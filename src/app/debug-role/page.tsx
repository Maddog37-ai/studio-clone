// Debug component to check user role
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleDebugPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>User Role Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User exists:</strong> {user ? "Yes" : "No"}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || "None"}</p>
                <p><strong>Role:</strong> {user.role || "None"}</p>
                <p><strong>Team ID:</strong> {user.teamId || "None"}</p>
                <p><strong>UID:</strong> {user.uid}</p>
              </>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm"><strong>Manager tools should show:</strong> {user?.role === "manager" || user?.role === "admin" ? "YES" : "NO"}</p>
            <p className="text-sm"><strong>Admin tools should show:</strong> {user?.role === "admin" ? "YES" : "NO"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
