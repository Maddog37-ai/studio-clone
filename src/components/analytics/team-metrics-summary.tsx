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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-20"></div>
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
      icon: Activity
    },
    {
      title: "Failed Credits %",
      value: `${teamMetrics.scheduledAppointmentCloseRate.toFixed(1)}%`,
      icon: Target
    },
    {
      title: "Setter Overview",
      value: "",
      icon: TrendingUp,
      totalSetters: teamMetrics.totalSetters,
      samedayRate: teamMetrics.samedaySitRate,
      scheduledRate: teamMetrics.scheduledSitRate,
      isCombined: true
    },
    {
      title: "Overall Close Rate",
      value: `${teamMetrics.avgCloseRate.toFixed(1)}%`,
      icon: Target
    },
    {
      title: "Scheduled Appointments That Close %",
      value: "",
      icon: Activity,
      isEmpty: true
    },
    {
      title: "Closer Overview",
      value: "",
      icon: Target,
      totalClosers: teamMetrics.totalClosers,
      samedayRate: teamMetrics.samedaySitCloseRate,
      scheduledRate: teamMetrics.scheduledAppointmentCloseRate,
      isCombined: true
    }
  ];

  // Split cards for custom layout
  const leftCards = metricCards.filter(card => card.title === "Setter Overview" || card.title === "Closer Overview");
  const rightCards = metricCards.filter(card => card.title !== "Setter Overview" && card.title !== "Closer Overview");

  // Group right cards for 2x2 grid layout
  const rightMetricTitles = [
    "Total Leads",
    "Failed Credits %",
    "Overall Close Rate",
    "Scheduled Appointments That Close %"
  ];
  const rightMetricCards = rightCards.filter(card => rightMetricTitles.includes(card.title));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Setter Overview, Closer Overview stacked */}
      <div className="flex flex-col gap-6">
        {leftCards.map((metric, index) => {
          if (!metric.isCombined) return null;
          const Icon = metric.icon;
          const isSettersCard = metric.title === "Setter Overview";
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-4 text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Icon className={`h-5 w-5 ${isSettersCard ? 'text-purple-500' : 'text-green-500'}`} />
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {isSettersCard ? "Active Setters" : "Active Closers"}
                    </h4>
                    <div className="text-5xl font-bold text-blue-600">
                      {isSettersCard ? metric.totalSetters : metric.totalClosers}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {isSettersCard ? "Sit Rates by Type" : "Close Rates by Type"}
                    </h4>
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-green-600">
                        Sameday: {metric.samedayRate?.toFixed(1)}%
                      </div>
                      <div className="text-xl font-bold text-purple-600">
                        Scheduled: {metric.scheduledRate?.toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isSettersCard ? "Appointment Completion" : "Sales Conversion"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Right column: 2x2 grid of metric cards, tighter and larger font */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
        {rightMetricCards.map((metric, index) => {
          const Icon = metric.icon;
          const getIconColor = (IconComponent: any) => {
            if (IconComponent === Activity) return "text-blue-500";
            if (IconComponent === Target) return "text-green-500";
            if (IconComponent === TrendingUp) return "text-purple-500";
            if (IconComponent === Calendar) return "text-orange-500";
            return "text-muted-foreground";
          };
          return (
            <Card key={index} className="aspect-square w-full max-w-[220px] mx-auto flex flex-col justify-center items-center">
              <CardHeader className="flex flex-col items-center justify-center pb-1 pt-4">
                <Icon className={`h-7 w-7 mb-1 ${getIconColor(Icon)}`} />
                <span className="text-base font-semibold text-center">Data Snapshot</span>
              </CardHeader>
              <CardContent className="flex flex-1 items-center justify-center p-0">
                <span className="text-base text-muted-foreground text-center">Request Data Here</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
