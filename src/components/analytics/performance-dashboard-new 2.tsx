"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Calendar, Activity, Download, Filter, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import type { Lead, Closer } from "@/types";

// Interfaces for analytics data
interface SetterPerformance {
  uid: string;
  name: string;
  totalLeads: number;
  sitCount: number;
  sitRate: number;
  failedCreditCount: number;
  failedCreditRate: number;
  immediateDispatchCount: number;
  scheduledDispatchCount: number;
  immediateDispatchPercentage: number;
  cancelNoShowCount: number;
  cancelNoShowRate: number;
  avgLeadsPerDay: number;
}

interface CloserPerformance {
  uid: string;
  name: string;
  totalAssigned: number;
  soldCount: number;
  noSaleCount: number;
  failedCreditCount: number;
  closeRate: number;
  selfGenCount: number;
  selfGenRate: number;
  avgLeadsPerDay: number;
  conversionRate: number;
}

interface TeamMetrics {
  totalLeads: number;
  totalSetters: number;
  totalClosers: number;
  overallSitRate: number;
  overallCloseRate: number;
  overallFailedCreditRate: number;
  overallCancelNoShowRate: number;
  averageLeadsPerSetter: number;
  averageLeadsPerCloser: number;
}

interface PerformanceDashboardProps {
  className?: string;
}

const chartConfig = {
  sitRate: { label: "Sit Rate", color: "#10b981" },
  closeRate: { label: "Close Rate", color: "#3b82f6" },
  failedCredit: { label: "Failed Credit", color: "#f59e0b" },
  cancelNoShow: { label: "Cancel/No Show", color: "#ef4444" },
  immediate: { label: "Immediate", color: "#8b5cf6" },
  scheduled: { label: "Scheduled", color: "#06b6d4" },
  selfGen: { label: "Self-Generated", color: "#84cc16" },
  total: { label: "Total", color: "#6b7280" },
};

export default function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [_closers, setClosers] = useState<Closer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedSetter, setSelectedSetter] = useState<string>("all");
  const [selectedCloser, setSelectedCloser] = useState<string>("all");

  // Load data
  useEffect(() => {
    if (!user?.teamId) return;

    const days = parseInt(dateRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const unsubscribeLeads = onSnapshot(
      query(
        collection(db, "leads"),
        where("teamId", "==", user.teamId),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lead[];
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leads:", error);
        toast({
          title: "Error loading leads",
          description: "Failed to load performance data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    const unsubscribeClosers = onSnapshot(
      query(
        collection(db, "closers"),
        where("teamId", "==", user.teamId)
      ),
      (snapshot) => {
        const closersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as Closer[];
        setClosers(closersData);
      },
      (error) => {
        console.error("Error fetching closers:", error);
        toast({
          title: "Error loading closers",
          description: "Failed to load closer data.",
          variant: "destructive",
        });
      }
    );

    return () => {
      unsubscribeLeads();
      unsubscribeClosers();
    };
  }, [user?.teamId, dateRange, toast]);

  // Calculate setter performance metrics
  const calculateSetterPerformance = (): SetterPerformance[] => {
    const setterMap = new Map<string, SetterPerformance>();

    leads.forEach(lead => {
      if (!lead.setterId || !lead.setterName) return;

      const existing = setterMap.get(lead.setterId) || {
        uid: lead.setterId,
        name: lead.setterName,
        totalLeads: 0,
        sitCount: 0,
        sitRate: 0,
        failedCreditCount: 0,
        failedCreditRate: 0,
        immediateDispatchCount: 0,
        scheduledDispatchCount: 0,
        immediateDispatchPercentage: 0,
        cancelNoShowCount: 0,
        cancelNoShowRate: 0,
        avgLeadsPerDay: 0,
      };

      existing.totalLeads++;

      if (['sold', 'no_sale'].includes(lead.status)) {
        existing.sitCount++;
      }

      if (lead.status === 'credit_fail') {
        existing.failedCreditCount++;
      }

      if (lead.dispatchType === 'immediate') {
        existing.immediateDispatchCount++;
      } else if (lead.dispatchType === 'scheduled') {
        existing.scheduledDispatchCount++;
      }

      if (lead.status === 'canceled') {
        existing.cancelNoShowCount++;
      }

      setterMap.set(lead.setterId, existing);
    });

    const daysInRange = parseInt(dateRange.replace('d', ''));
    
    return Array.from(setterMap.values()).map(setter => ({
      ...setter,
      sitRate: setter.totalLeads > 0 ? (setter.sitCount / setter.totalLeads) * 100 : 0,
      failedCreditRate: setter.sitCount > 0 ? (setter.failedCreditCount / setter.sitCount) * 100 : 0,
      immediateDispatchPercentage: setter.totalLeads > 0 ? (setter.immediateDispatchCount / setter.totalLeads) * 100 : 0,
      cancelNoShowRate: setter.totalLeads > 0 ? (setter.cancelNoShowCount / setter.totalLeads) * 100 : 0,
      avgLeadsPerDay: setter.totalLeads / daysInRange,
    }));
  };

  // Calculate closer performance metrics
  const calculateCloserPerformance = (): CloserPerformance[] => {
    const closerMap = new Map<string, CloserPerformance>();

    leads.forEach(lead => {
      if (!lead.assignedCloserId || !lead.assignedCloserName) return;

      const existing = closerMap.get(lead.assignedCloserId) || {
        uid: lead.assignedCloserId,
        name: lead.assignedCloserName,
        totalAssigned: 0,
        soldCount: 0,
        noSaleCount: 0,
        failedCreditCount: 0,
        closeRate: 0,
        selfGenCount: 0,
        selfGenRate: 0,
        avgLeadsPerDay: 0,
        conversionRate: 0,
      };

      if (['sold', 'no_sale', 'credit_fail'].includes(lead.status)) {
        existing.totalAssigned++;

        if (lead.status === 'sold') existing.soldCount++;
        if (lead.status === 'no_sale') existing.noSaleCount++;
        if (lead.status === 'credit_fail') existing.failedCreditCount++;

        if (lead.setterId === lead.assignedCloserId) {
          existing.selfGenCount++;
        }
      }

      closerMap.set(lead.assignedCloserId, existing);
    });

    const daysInRange = parseInt(dateRange.replace('d', ''));
    
    return Array.from(closerMap.values()).map(closer => ({
      ...closer,
      closeRate: (closer.soldCount + closer.noSaleCount) > 0 ? 
        (closer.soldCount / (closer.soldCount + closer.noSaleCount)) * 100 : 0,
      selfGenRate: closer.totalAssigned > 0 ? (closer.selfGenCount / closer.totalAssigned) * 100 : 0,
      avgLeadsPerDay: closer.totalAssigned / daysInRange,
      conversionRate: closer.totalAssigned > 0 ? (closer.soldCount / closer.totalAssigned) * 100 : 0,
    }));
  };

  // Calculate team-wide metrics
  const calculateTeamMetrics = (): TeamMetrics => {
    const setterPerformance = calculateSetterPerformance();
    const closerPerformance = calculateCloserPerformance();

    const totalSits = leads.filter(lead => ['sold', 'no_sale'].includes(lead.status)).length;
    const totalSold = leads.filter(lead => lead.status === 'sold').length;
    const totalNoSale = leads.filter(lead => lead.status === 'no_sale').length;
    const totalFailedCredit = leads.filter(lead => lead.status === 'credit_fail').length;
    const totalCanceled = leads.filter(lead => lead.status === 'canceled').length;

    return {
      totalLeads: leads.length,
      totalSetters: setterPerformance.length,
      totalClosers: closerPerformance.length,
      overallSitRate: leads.length > 0 ? (totalSits / leads.length) * 100 : 0,
      overallCloseRate: (totalSold + totalNoSale) > 0 ? (totalSold / (totalSold + totalNoSale)) * 100 : 0,
      overallFailedCreditRate: totalSits > 0 ? (totalFailedCredit / totalSits) * 100 : 0,
      overallCancelNoShowRate: leads.length > 0 ? (totalCanceled / leads.length) * 100 : 0,
      averageLeadsPerSetter: setterPerformance.length > 0 ? 
        setterPerformance.reduce((sum, setter) => sum + setter.totalLeads, 0) / setterPerformance.length : 0,
      averageLeadsPerCloser: closerPerformance.length > 0 ?
        closerPerformance.reduce((sum, closer) => sum + closer.totalAssigned, 0) / closerPerformance.length : 0,
    };
  };

  // Export analytics data
  const exportData = () => {
    const _setterPerformance = calculateSetterPerformance();
    const _closerPerformance = calculateCloserPerformance();
    const teamMetrics = calculateTeamMetrics();

    const reportData = [];
    reportData.push(['PERFORMANCE ANALYTICS REPORT']);
    reportData.push(['Generated:', new Date().toLocaleString()]);
    reportData.push(['Date Range:', dateRange]);
    reportData.push(['Team:', user?.teamId || 'Unknown']);
    reportData.push([]);

    // Team metrics
    reportData.push(['TEAM METRICS']);
    reportData.push(['Total Leads:', teamMetrics.totalLeads]);
    reportData.push(['Overall Sit Rate:', `${teamMetrics.overallSitRate.toFixed(1)}%`]);
    reportData.push(['Overall Close Rate:', `${teamMetrics.overallCloseRate.toFixed(1)}%`]);

    // Convert to CSV
    const csvContent = reportData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download file
    if (typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: "Performance analytics report has been downloaded.",
      });
    }
  };

  if (!user || user.role === "setter") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Performance Analytics Not Available</h2>
          <p className="text-muted-foreground">Performance analytics are available for closers and managers only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const setterPerformance = calculateSetterPerformance();
  const closerPerformance = calculateCloserPerformance();
  const teamMetrics = calculateTeamMetrics();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Performance Analytics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive performance insights for setters and closers
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Team Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Sit Rate</p>
                <p className="text-2xl font-bold text-green-600">{teamMetrics.overallSitRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Close Rate</p>
                <p className="text-2xl font-bold text-blue-600">{teamMetrics.overallCloseRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Credit Rate</p>
                <p className="text-2xl font-bold text-amber-600">{teamMetrics.overallFailedCreditRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancel/No Show Rate</p>
                <p className="text-2xl font-bold text-red-600">{teamMetrics.overallCancelNoShowRate.toFixed(1)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="setters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setters">Setter Performance</TabsTrigger>
          <TabsTrigger value="closers">Closer Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Setter Performance Tab */}
        <TabsContent value="setters" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedSetter} onValueChange={setSelectedSetter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Setters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setters</SelectItem>
                {setterPerformance.map(setter => (
                  <SelectItem key={setter.uid} value={setter.uid}>
                    {setter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Setter Sit Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Setter Sit Rate Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={setterPerformance
                      .filter(setter => selectedSetter === "all" || setter.uid === selectedSetter)
                      .sort((a, b) => b.sitRate - a.sitRate)
                      .slice(0, 10)
                      .map(setter => ({
                        name: setter.name.split(" ")[0],
                        sitRate: setter.sitRate,
                        totalLeads: setter.totalLeads
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-bold">{label}</p>
                                <p className="text-sm">Sit Rate: {data.sitRate.toFixed(1)}%</p>
                                <p className="text-sm">Total Leads: {data.totalLeads}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="sitRate" fill={chartConfig.sitRate.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Dispatch Type Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Immediate vs Scheduled Dispatch</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: "Immediate", 
                            value: setterPerformance
                              .filter(setter => selectedSetter === "all" || setter.uid === selectedSetter)
                              .reduce((sum, setter) => sum + setter.immediateDispatchCount, 0),
                            fill: chartConfig.immediate.color 
                          },
                          { 
                            name: "Scheduled", 
                            value: setterPerformance
                              .filter(setter => selectedSetter === "all" || setter.uid === selectedSetter)
                              .reduce((sum, setter) => sum + setter.scheduledDispatchCount, 0),
                            fill: chartConfig.scheduled.color 
                          }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        innerRadius="40%"
                        label={({ name, percent }) => {
                          if (percent > 0.05) { // Only show label if slice is > 5%
                            return `${name}: ${(percent * 100).toFixed(0)}%`;
                          }
                          return null;
                        }}
                        labelLine={false}
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {[
                          { name: "Immediate", fill: chartConfig.immediate.color },
                          { name: "Scheduled", fill: chartConfig.scheduled.color }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const value = Number(data.value) || 0;
                            const total = setterPerformance
                              .filter(setter => selectedSetter === "all" || setter.uid === selectedSetter)
                              .reduce((sum, setter) => sum + setter.immediateDispatchCount + setter.scheduledDispatchCount, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-bold">{data.name}</p>
                                <p className="text-sm">Count: {value}</p>
                                <p className="text-sm">Percentage: {percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Closer Performance Tab */}
        <TabsContent value="closers" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedCloser} onValueChange={setSelectedCloser}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Closers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Closers</SelectItem>
                {closerPerformance.map(closer => (
                  <SelectItem key={closer.uid} value={closer.uid}>
                    {closer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Closer Close Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Closer Close Rate Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={closerPerformance
                      .filter(closer => selectedCloser === "all" || closer.uid === selectedCloser)
                      .sort((a, b) => b.closeRate - a.closeRate)
                      .slice(0, 10)
                      .map(closer => ({
                        name: closer.name.split(" ")[0],
                        closeRate: closer.closeRate,
                        totalAssigned: closer.totalAssigned
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-bold">{label}</p>
                                <p className="text-sm">Close Rate: {data.closeRate.toFixed(1)}%</p>
                                <p className="text-sm">Total Assigned: {data.totalAssigned}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="closeRate" fill={chartConfig.closeRate.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Self-Generated Leads Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Self-Generated Lead Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={closerPerformance
                      .filter(closer => selectedCloser === "all" || closer.uid === selectedCloser)
                      .sort((a, b) => b.selfGenRate - a.selfGenRate)
                      .slice(0, 10)
                      .map(closer => ({
                        name: closer.name.split(" ")[0],
                        selfGenRate: closer.selfGenRate,
                        selfGenCount: closer.selfGenCount
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-bold">{label}</p>
                                <p className="text-sm">Self-Gen Rate: {data.selfGenRate.toFixed(1)}%</p>
                                <p className="text-sm">Self-Gen Count: {data.selfGenCount}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="selfGenRate" fill={chartConfig.selfGen.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Trends analysis coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
