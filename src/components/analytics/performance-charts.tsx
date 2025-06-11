"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Calendar, Activity } from "lucide-react";
import { SetterPerformance, CloserPerformance, TrendData } from "./types";

interface PerformanceChartsProps {
  setterPerformance: SetterPerformance[];
  closerPerformance: CloserPerformance[];
  trendData: TrendData[];
  chartConfig: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function PerformanceCharts({ 
  setterPerformance, 
  closerPerformance, 
  trendData, 
  chartConfig 
}: PerformanceChartsProps) {
  // Prepare setter chart data
  const setterChartData = setterPerformance.map(setter => ({
    name: setter.name.split(' ')[0], // First name only for chart
    sitRate: setter.sitRate,
    failedCreditRate: setter.failedCreditRate,
    cancelNoShowRate: setter.cancelNoShowRate,
    totalLeads: setter.totalLeads
  }));

  // Prepare closer chart data
  const closerChartData = closerPerformance.map(closer => ({
    name: closer.name.split(' ')[0], // First name only for chart
    closeRate: closer.closeRate,
    conversionRate: closer.conversionRate,
    selfGenRate: closer.selfGenRate,
    totalAssigned: closer.totalAssigned
  }));

  // Prepare pie chart data for lead distribution
  const leadDistributionData = [
    { name: 'Immediate Dispatch', value: setterPerformance.reduce((sum, s) => sum + s.immediateDispatchCount, 0) },
    { name: 'Scheduled Dispatch', value: setterPerformance.reduce((sum, s) => sum + s.scheduledDispatchCount, 0) },
    { name: 'Failed Credit', value: setterPerformance.reduce((sum, s) => sum + s.failedCreditCount, 0) },
    { name: 'Cancel/No Show', value: setterPerformance.reduce((sum, s) => sum + s.cancelNoShowCount, 0) }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Setter Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Setter Performance Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setterChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sitRate" fill={chartConfig.sitRate.color} name="Sit Rate %" />
                <Bar dataKey="failedCreditRate" fill={chartConfig.failedCredit.color} name="Failed Credit %" />
                <Bar dataKey="cancelNoShowRate" fill={chartConfig.cancelNoShow.color} name="Cancel/No Show %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Closer Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Closer Performance Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="closeRate" fill={chartConfig.closeRate.color} name="Close Rate %" />
                <Bar dataKey="conversionRate" fill={chartConfig.selfGen.color} name="Conversion Rate %" />
                <Bar dataKey="selfGenRate" fill={chartConfig.immediate.color} name="Self-Gen Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Lead Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Trend Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
                <Line 
                  type="monotone" 
                  dataKey="totalLeads" 
                  stroke={chartConfig.total.color} 
                  name="Total Leads" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="sitRate" 
                  stroke={chartConfig.sitRate.color} 
                  name="Sit Rate %" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="closeRate" 
                  stroke={chartConfig.closeRate.color} 
                  name="Close Rate %" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
