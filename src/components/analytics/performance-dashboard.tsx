"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lead, Closer } from "@/types";
import { 
  SetterPerformance, 
  CloserPerformance, 
  TeamMetrics, 
  TrendData 
} from "./types";
import {
  calculateSetterPerformance,
  calculateCloserPerformance,
  calculateTeamMetrics,
  generateTrendData,
  exportToCSV
} from "./utils";
import { TeamMetricsSummary } from "./team-metrics-summary";
import { PerformanceFilters } from "./performance-filters";
import { SetterPerformanceTable } from "./setter-performance-table";
import { CloserPerformanceTable } from "./closer-performance-table";
import { PerformanceCharts } from "./performance-charts";

interface PerformanceDashboardProps {
  className?: string;
}

const chartConfig = {
  sitRate: { label: "Sit Rate (%)", color: "#10b981" },
  closeRate: { label: "Close Rate (%)", color: "#3b82f6" },
  failedCredit: { label: "Failed Credit Rate (%)", color: "#f59e0b" },
  cancelNoShow: { label: "Cancel/No Show Rate (%)", color: "#ef4444" },
  immediate: { label: "Immediate Dispatch", color: "#8b5cf6" },
  scheduled: { label: "Scheduled Dispatch", color: "#06b6d4" },
  selfGen: { label: "Self-Generated Leads", color: "#84cc16" },
  total: { label: "Total Leads Count", color: "#6b7280" },
  appointments: { label: "Completed Appointments", color: "#059669" },
  sold: { label: "Sold Leads", color: "#10b981" },
  no_sale: { label: "No Sale Leads", color: "#ef4444" },
  credit_fail: { label: "Credit Failed Leads", color: "#f97316" },
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

  // Calculate performance metrics using extracted utility functions with memoization
  const setterPerformance = useMemo(() => calculateSetterPerformance(leads), [leads]);
  const closerPerformance = useMemo(() => calculateCloserPerformance(leads), [leads]);
  const teamMetrics = useMemo(() => calculateTeamMetrics(leads, setterPerformance, closerPerformance), [leads, setterPerformance, closerPerformance]);
  const trendData = useMemo(() => generateTrendData(leads), [leads]);

  // Filter data based on selected filters
  const filteredSetterPerformance = useMemo(() => {
    return selectedSetter === "all" 
      ? setterPerformance 
      : setterPerformance.filter(setter => setter.uid === selectedSetter);
  }, [setterPerformance, selectedSetter]);

  const filteredCloserPerformance = useMemo(() => {
    return selectedCloser === "all" 
      ? closerPerformance 
      : closerPerformance.filter(closer => closer.uid === selectedCloser);
  }, [closerPerformance, selectedCloser]);

  // Handle exports with memoization
  const handleExport = useCallback(() => {
    exportToCSV({ setterPerformance, closerPerformance, teamMetrics }, dateRange);
    toast({
      title: "Export successful",
      description: "Performance data has been exported to CSV.",
    });
  }, [setterPerformance, closerPerformance, teamMetrics, dateRange, toast]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Team Metrics Summary */}
      <TeamMetricsSummary teamMetrics={teamMetrics} loading={loading} />

      {/* Filters */}
      <PerformanceFilters
        dateRange={dateRange}
        selectedSetter={selectedSetter}
        selectedCloser={selectedCloser}
        setterPerformance={setterPerformance}
        closerPerformance={closerPerformance}
        onDateRangeChange={setDateRange}
        onSetterChange={setSelectedSetter}
        onCloserChange={setSelectedCloser}
        onExport={handleExport}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setters">Setters</TabsTrigger>
          <TabsTrigger value="closers">Closers</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Removed SetterPerformanceTable and CloserPerformanceTable from Overview */}
          {/* Only show them in their respective tabs below */}
        </TabsContent>

        <TabsContent value="setters" className="space-y-6">
          <SetterPerformanceTable
            setterPerformance={filteredSetterPerformance}
            selectedSetter={selectedSetter}
            onSetterSelect={setSelectedSetter}
          />
        </TabsContent>

        <TabsContent value="closers" className="space-y-6">
          <CloserPerformanceTable
            closerPerformance={filteredCloserPerformance}
            selectedCloser={selectedCloser}
            onCloserSelect={setSelectedCloser}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <PerformanceCharts
            setterPerformance={filteredSetterPerformance}
            closerPerformance={filteredCloserPerformance}
            trendData={trendData}
            chartConfig={chartConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
