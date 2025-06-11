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
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
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

interface TrendData {
  date: string;
  totalLeads: number;
  sitRate: number;
  closeRate: number;
  immediateDispatchPercentage: number;
  failedCreditRate: number;
  cancelNoShowRate: number;
  completedAppointments: number;
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
  appointments: { label: "Completed Appointments", color: "#059669" },
  sold: { label: "Sold", color: "#10b981" },
  no_sale: { label: "No Sale", color: "#ef4444" },
  credit_fail: { label: "Credit Fail", color: "#f97316" },
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
          id: doc.id,
          ...doc.data()
        })) as unknown as Closer[];
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
    try {
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

        if (['sold', 'no_sale', 'credit_fail'].includes(lead.status)) {
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
    } catch (error) {
      console.error('Error calculating setter performance:', error);
      return [];
    }
  };

  // Calculate closer performance metrics
  const calculateCloserPerformance = (): CloserPerformance[] => {
    try {
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
    } catch (error) {
      console.error('Error calculating closer performance:', error);
      return [];
    }
  };

  // Calculate team-wide metrics
  const calculateTeamMetrics = (): TeamMetrics => {
    try {
      const setterPerformance = calculateSetterPerformance();
      const closerPerformance = calculateCloserPerformance();

      const totalSits = leads.filter(lead => ['sold', 'no_sale', 'credit_fail'].includes(lead.status)).length;
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
    } catch (error) {
      console.error('Error calculating team metrics:', error);
      return {
        totalLeads: 0,
        totalSetters: 0,
        totalClosers: 0,
        overallSitRate: 0,
        overallCloseRate: 0,
        overallFailedCreditRate: 0,
        overallCancelNoShowRate: 0,
        averageLeadsPerSetter: 0,
        averageLeadsPerCloser: 0,
      };
    }
  };

  // Generate trend data for time-series analysis
  const generateTrendData = (): TrendData[] => {
    try {
      const days = parseInt(dateRange.replace('d', ''));
      const trendData: TrendData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Filter leads for this specific day
        const dayLeads = leads.filter(lead => {
          try {
            if (!lead.createdAt || !lead.createdAt.seconds) return false;
            const leadDate = new Date(lead.createdAt.seconds * 1000);
            return leadDate.toDateString() === date.toDateString();
          } catch (error) {
            console.warn('Error parsing lead date:', error, lead);
            return false;
          }
        });
        
        const totalLeads = dayLeads.length;
        const soldLeads = dayLeads.filter(lead => lead.status === 'sold').length;
        const noSaleLeads = dayLeads.filter(lead => lead.status === 'no_sale').length;
        const sitLeads = dayLeads.filter(lead => ['sold', 'no_sale', 'credit_fail'].includes(lead.status));
        const failedCreditLeads = dayLeads.filter(lead => lead.status === 'credit_fail');
        const canceledLeads = dayLeads.filter(lead => lead.status === 'canceled');
        const immediateLeads = dayLeads.filter(lead => lead.dispatchType === 'immediate');
        
        trendData.push({
          date: dateStr,
          totalLeads,
          sitRate: totalLeads > 0 ? (sitLeads.length / totalLeads) * 100 : 0,
          closeRate: (soldLeads + noSaleLeads) > 0 ? (soldLeads / (soldLeads + noSaleLeads)) * 100 : 0,
          immediateDispatchPercentage: totalLeads > 0 ? (immediateLeads.length / totalLeads) * 100 : 0,
          failedCreditRate: sitLeads.length > 0 ? (failedCreditLeads.length / sitLeads.length) * 100 : 0,
          cancelNoShowRate: totalLeads > 0 ? (canceledLeads.length / totalLeads) * 100 : 0,
          completedAppointments: sitLeads.length,
        });
      }
      
      return trendData;
    } catch (error) {
      console.error('Error generating trend data:', error);
      return [];
    }
  };

  // Calculate trend insights
  const calculateTrendInsights = () => {
    try {
      const trendData = generateTrendData();
      if (trendData.length < 2) return null;
      
      const recent = trendData.slice(-7); // Last 7 days
      const earlier = trendData.slice(0, -7); // Earlier days
      
      if (recent.length === 0 || earlier.length === 0) return null;
      
      const recentAvgSitRate = recent.reduce((sum, day) => sum + (day.sitRate || 0), 0) / recent.length;
      const earlierAvgSitRate = earlier.reduce((sum, day) => sum + (day.sitRate || 0), 0) / earlier.length;
      
      const recentAvgCloseRate = recent.reduce((sum, day) => sum + (day.closeRate || 0), 0) / recent.length;
      const earlierAvgCloseRate = earlier.reduce((sum, day) => sum + (day.closeRate || 0), 0) / earlier.length;
      
      const recentAvgLeads = recent.reduce((sum, day) => sum + (day.totalLeads || 0), 0) / recent.length;
      const earlierAvgLeads = earlier.reduce((sum, day) => sum + (day.totalLeads || 0), 0) / earlier.length;
      
      return {
        sitRateTrend: recentAvgSitRate - earlierAvgSitRate,
        closeRateTrend: recentAvgCloseRate - earlierAvgCloseRate,
        leadVolumeTrend: recentAvgLeads - earlierAvgLeads,
        bestPerformanceDay: trendData.reduce((best, day) => 
          (day.closeRate || 0) > (best.closeRate || 0) ? day : best, trendData[0]
        ),
        avgDailyLeads: trendData.reduce((sum, day) => sum + (day.totalLeads || 0), 0) / trendData.length,
        avgSitRate: trendData.reduce((sum, day) => sum + (day.sitRate || 0), 0) / trendData.length,
        avgCloseRate: trendData.reduce((sum, day) => sum + (day.closeRate || 0), 0) / trendData.length,
      };
    } catch (error) {
      console.error('Error calculating trend insights:', error);
      return null;
    }
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
    reportData.push(['Overall Sit Rate:', `${(teamMetrics.overallSitRate || 0).toFixed(1)}%`]);
    reportData.push(['Overall Close Rate:', `${(teamMetrics.overallCloseRate || 0).toFixed(1)}%`]);

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

  // Safety check to prevent crashes with malformed data
  if (!leads || !Array.isArray(leads)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Unable to load performance data. Please try refreshing the page.</p>
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

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="setters">Setter Performance</TabsTrigger>
          <TabsTrigger value="closers">Closer Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overall Tab */}
        <TabsContent value="overall" className="space-y-6">
          {/* Overall Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold">{teamMetrics.totalLeads}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Sit Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(teamMetrics.overallSitRate || 0).toFixed(1)}%
                    </p>
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
                    <p className="text-2xl font-bold text-blue-600">
                      {(teamMetrics.overallCloseRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Team Members</p>
                    <p className="text-2xl font-bold">{teamMetrics.totalSetters + teamMetrics.totalClosers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Distribution Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Distribution by Final Disposition</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: "Sold", 
                            value: leads.filter(lead => lead.status === 'sold').length,
                            fill: chartConfig.sold.color 
                          },
                          { 
                            name: "No Sale", 
                            value: leads.filter(lead => lead.status === 'no_sale').length,
                            fill: chartConfig.no_sale.color 
                          },
                          { 
                            name: "Credit Fail", 
                            value: leads.filter(lead => lead.status === 'credit_fail').length,
                            fill: chartConfig.credit_fail.color 
                          }
                        ].filter(item => item.value > 0 && isFinite(item.value))} // Only show valid, non-zero values
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
                          { name: "Sold", fill: chartConfig.sold.color },
                          { name: "No Sale", fill: chartConfig.no_sale.color },
                          { name: "Credit Fail", fill: chartConfig.credit_fail.color }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const value = Number(data.value) || 0;
                            const total = leads.filter(lead => ['sold', 'no_sale', 'credit_fail'].includes(lead.status)).length;
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

            {/* Stacked Bar Graph showing Final Dispositions over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Final Dispositions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={(() => {
                        try {
                          const trendData = generateTrendData();
                          return trendData.map(day => {
                            return {
                              date: day.date,
                              sold: day.completedAppointments > 0 ? Math.round(day.completedAppointments * ((day.closeRate || 0) / 100)) : 0,
                              no_sale: day.completedAppointments > 0 ? Math.round(day.completedAppointments * ((100 - (day.closeRate || 0)) / 100)) : 0,
                              credit_fail: Math.round(day.completedAppointments * ((day.failedCreditRate || 0) / 100)),
                            };
                          }).filter(item => isFinite(item.sold) && isFinite(item.no_sale) && isFinite(item.credit_fail));
                        } catch (error) {
                          console.error('Error generating stacked bar data:', error);
                          return [];
                        }
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const sold = payload.find(p => p.dataKey === 'sold')?.value || 0;
                            const noSale = payload.find(p => p.dataKey === 'no_sale')?.value || 0;
                            const creditFail = payload.find(p => p.dataKey === 'credit_fail')?.value || 0;
                            const total = Number(sold) + Number(noSale) + Number(creditFail);
                            
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-bold">{label}</p>
                                <p className="text-sm">Sold: {sold}</p>
                                <p className="text-sm">No Sale: {noSale}</p>
                                <p className="text-sm">Credit Fail: {creditFail}</p>
                                <p className="text-sm font-bold">Total: {total}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="sold" stackId="dispositions" fill={chartConfig.sold.color} name="Sold" />
                      <Bar dataKey="no_sale" stackId="dispositions" fill={chartConfig.no_sale.color} name="No Sale" />
                      <Bar dataKey="credit_fail" stackId="dispositions" fill={chartConfig.credit_fail.color} name="Credit Fail" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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

          {/* Setter Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Sit Rate</p>
                    <p className="text-2xl font-bold text-green-600">{(teamMetrics.overallSitRate || 0).toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed Credit Rate</p>
                    <p className="text-2xl font-bold text-amber-600">{(teamMetrics.overallFailedCreditRate || 0).toFixed(1)}%</p>
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
                    <p className="text-2xl font-bold text-red-600">{(teamMetrics.overallCancelNoShowRate || 0).toFixed(1)}%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
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
                                <p className="text-sm">Sit Rate: {(data.sitRate || 0).toFixed(1)}%</p>
                                <p className="text-sm">Total Leads: {data.totalLeads || 0}</p>
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

          {/* Closer Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Close Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{(teamMetrics.overallCloseRate || 0).toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
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
                                <p className="text-sm">Close Rate: {(data.closeRate || 0).toFixed(1)}%</p>
                                <p className="text-sm">Total Assigned: {data.totalAssigned || 0}</p>
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
                                <p className="text-sm">Self-Gen Rate: {(data.selfGenRate || 0).toFixed(1)}%</p>
                                <p className="text-sm">Self-Gen Count: {data.selfGenCount || 0}</p>
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
          {(() => {
            const trendData = generateTrendData();
            const insights = calculateTrendInsights();
            
            return (
              <>
                {/* Trend Summary Cards */}
                {insights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Best Performance Day</p>
                            <p className="text-lg font-bold">{insights.bestPerformanceDay.date}</p>
                            <p className="text-sm text-green-600">{(insights.bestPerformanceDay.closeRate || 0).toFixed(1)}% close rate</p>
                          </div>
                          <Target className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Daily Leads</p>
                            <p className="text-2xl font-bold">{(insights.avgDailyLeads || 0).toFixed(1)}</p>
                            <div className="flex items-center gap-1 text-sm">
                              {(insights.leadVolumeTrend || 0) > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                              )}
                              <span className={(insights.leadVolumeTrend || 0) > 0 ? "text-green-600" : "text-red-600"}>
                                {Math.abs(insights.leadVolumeTrend || 0).toFixed(1)} trend
                              </span>
                            </div>
                          </div>
                          <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Sit Rate</p>
                            <p className="text-2xl font-bold">{(insights.avgSitRate || 0).toFixed(1)}%</p>
                            <div className="flex items-center gap-1 text-sm">
                              {(insights.sitRateTrend || 0) > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                              )}
                              <span className={(insights.sitRateTrend || 0) > 0 ? "text-green-600" : "text-red-600"}>
                                {Math.abs(insights.sitRateTrend || 0).toFixed(1)}% trend
                              </span>
                            </div>
                          </div>
                          <Target className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Close Rate</p>
                            <p className="text-2xl font-bold">{insights.avgCloseRate.toFixed(1)}%</p>
                            <div className="flex items-center gap-1 text-sm">
                              {insights.closeRateTrend > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                              )}
                              <span className={insights.closeRateTrend > 0 ? "text-green-600" : "text-red-600"}>
                                {Math.abs(insights.closeRateTrend).toFixed(1)}% trend
                              </span>
                            </div>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Trend Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sit Rate Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sit Rate Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
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
                            <Line 
                              type="monotone" 
                              dataKey="sitRate" 
                              stroke={chartConfig.sitRate.color} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Close Rate Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Close Rate Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
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
                                      <p className="text-sm">Total Leads: {data.totalLeads}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="closeRate" 
                              stroke={chartConfig.closeRate.color} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Completed Appointment Volume */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Appointment Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
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
                                      <p className="text-sm">Completed Appointments: {data.completedAppointments}</p>
                                      <p className="text-sm">Total Leads: {data.totalLeads}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="completedAppointments" 
                              stroke={chartConfig.appointments.color} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Failed Credit & Cancel/No Show Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Failed Credit & Cancel/No Show Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
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
                                      <p className="text-sm">Failed Credit: {data.failedCreditRate.toFixed(1)}%</p>
                                      <p className="text-sm">Cancel/No Show: {data.cancelNoShowRate.toFixed(1)}%</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="failedCreditRate" 
                              stroke={chartConfig.failedCredit.color} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Failed Credit Rate"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cancelNoShowRate" 
                              stroke={chartConfig.cancelNoShow.color} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Cancel/No Show Rate"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
