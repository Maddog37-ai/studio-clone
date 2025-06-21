"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
i      {/* Lead Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>tContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
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
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setterChartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <ChartTooltip />
                <ChartLegend 
                  content={<ChartLegendContent />} 
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar dataKey="sitRate" fill={chartConfig.sitRate.color} name="Sit Rate %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failedCreditRate" fill={chartConfig.failedCredit.color} name="Failed Credit Rate %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cancelNoShowRate" fill={chartConfig.cancelNoShow.color} name="Cancel/No Show Rate %" />
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
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closerChartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <ChartTooltip />
                <ChartLegend 
                  content={<ChartLegendContent />} 
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar dataKey="closeRate" fill={chartConfig.closeRate.color} name="Close Rate %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="conversionRate" fill={chartConfig.selfGen.color} name="Conversion Rate %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="selfGenRate" fill={chartConfig.immediate.color} name="Self-Generated Rate %" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Lead Distribution Pie Chart */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            Lead Distribution by Type
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Breakdown of leads by dispatch and outcome type</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={leadDistributionData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {leadDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `${label} Leads`}
                />
                <ChartLegend 
                  content={<ChartLegendContent />}
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Trend Analysis Chart */}
      <Card className="lg:col-span-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            Performance Trends Over Time
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Historical performance metrics and trend analysis</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <ChartTooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <ChartLegend 
                  content={<ChartLegendContent />}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalLeads" 
                  stroke={chartConfig.total.color} 
                  name="Total Leads Count" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sitRate" 
                  stroke={chartConfig.sitRate.color} 
                  name="Sit Rate %" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="closeRate" 
                  stroke={chartConfig.closeRate.color} 
                  name="Close Rate %" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
