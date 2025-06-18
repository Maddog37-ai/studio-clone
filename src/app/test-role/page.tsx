"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function TestRolePage() {
  const { user, loading } = useAuth();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading user data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Role Testing & Manager Tools Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">User Authentication</h3>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Render Count</h3>
              <Badge variant="outline">{renderCount}</Badge>
            </div>
          </div>
          
          {user && (
            <div className="space-y-3">
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Display Name:</strong> {user.displayName || "None"}
              </div>
              <div>
                <strong>Role:</strong> 
                <Badge className="ml-2" variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <div>
                <strong>Team ID:</strong> {user.teamId || "None"}
              </div>
              <div>
                <strong>UID:</strong> {user.uid}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Manager Tools Visibility Test</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <strong>Should show manager tools:</strong>
                <Badge variant={isManagerOrAdmin ? "default" : "destructive"}>
                  {isManagerOrAdmin ? "YES" : "NO"}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Manager tools appear when: <code>(user?.role === "manager" || user?.role === "admin")</code>
              </div>
              
              <div className="text-sm">
                Current evaluation: <code>{user?.role} === "manager"</code> = {user?.role === "manager" ? "true" : "false"}
              </div>
              <div className="text-sm">
                Current evaluation: <code>{user?.role} === "admin"</code> = {user?.role === "admin" ? "true" : "false"}
              </div>
              <div className="text-sm font-semibold">
                Final result: {isManagerOrAdmin ? "✅ Manager tools should be visible" : "❌ Manager tools should be hidden"}
              </div>
            </div>
          </div>
          
          {user?.role === "admin" && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Admin Role Detected!
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                You should see the following manager tools in the sidebar:
              </p>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 text-sm mt-1">
                <li>Lead Management</li>
                <li>Performance Analytics</li>
                <li>All Leads History</li>
                <li>Admin Tools (admin only)</li>
              </ul>
              <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                If you don't see these, try refreshing the page or clearing your browser cache.
              </p>
            </div>
          )}
          
          {user && user.role !== "admin" && user.role !== "manager" && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                ⚠️ Non-Manager Role
              </h4>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Your current role is "{user.role}". Manager tools are only visible to users with "manager" or "admin" roles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
