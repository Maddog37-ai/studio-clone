"use client";

import PerformanceDashboard from "@/components/analytics/performance-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function PerformanceAnalyticsPage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "setter") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Performance Analytics Not Available</h2>
              <p className="text-muted-foreground">Performance analytics are available for closers and managers only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <PerformanceDashboard />
    </div>
  );
}
