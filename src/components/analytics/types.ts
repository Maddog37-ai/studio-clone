// Analytics types and interfaces
export interface SetterPerformance {
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

export interface CloserPerformance {
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

export interface TeamMetrics {
  totalLeads: number;
  totalSetters: number;
  totalClosers: number;
  avgCloseRate: number;
  avgSitRate: number;
  totalRevenue: number;
  avgRevenuePerLead: number;
  conversionRate: number;
  canceledLeadRate: number;
  samedaySitCloseRate: number;
  scheduledAppointmentCloseRate: number;
  samedaySitRate: number;
  scheduledSitRate: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
}

export interface TrendData {
  date: string;
  leads: number;
  sits: number;
  sales: number;
  revenue: number;
  setters: number;
  closers: number;
}

export interface PerformanceDashboardProps {
  className?: string;
}

export const chartConfig = {
  leads: { label: "Leads", color: "#8884d8" },
  sits: { label: "Sits", color: "#82ca9d" },
  sales: { label: "Sales", color: "#ffc658" },
  revenue: { label: "Revenue", color: "#ff7300" },
  setters: { label: "Setters", color: "#8dd1e1" },
  closers: { label: "Closers", color: "#d084d0" }
};
