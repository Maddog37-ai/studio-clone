"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";

export default function DeleteUsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  // Check if current user is admin or manager
  const canAccess = currentUser?.role === "admin" || currentUser?.role === "manager";

  if (!canAccess) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>You don't have permission to access this page.</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Functionality Removed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The bulk user deletion functionality has been removed from the system. 
            Users can still be deleted individually through the Team Management interface.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => router.push("/dashboard/team-management")}>
              Go to Team Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
