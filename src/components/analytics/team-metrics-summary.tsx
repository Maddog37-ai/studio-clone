"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Activity, Calendar } from "lucide-react";
import { TeamMetrics } from "./types";

interface TeamMetricsSummaryProps {
  teamMetrics: TeamMetrics;
  loading: boolean;
}

export function TeamMetricsSummary({ teamMetrics, loading }: TeamMetricsSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Leads",
      value: teamMetrics.totalLeads.toLocaleString(),
      icon: Activity,
      color: "text-blue-600"
    },
    {
      title: "Active Setters",
      value: teamMetrics.totalSetters.toString(),
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Active Closers",
      value: teamMetrics.totalClosers.toString(),
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Overall Sit Rate",
      value: `${teamMetrics.overallSitRate.toFixed(1)}%`,
      icon: Calendar,
      color: "text-emerald-600"
    },
    {
      title: "Overall Close Rate",
      value: `${teamMetrics.overallCloseRate.toFixed(1)}%`,
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Revenue Generated",
      value: `$${teamMetrics.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Avg Revenue/Lead",
      value: `$${teamMetrics.avgRevenuePerLead.toFixed(0)}`,
      icon: Activity,
      color: "text-orange-600"
    },
    {
      title: "Conversion Rate",
      value: `${teamMetrics.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
