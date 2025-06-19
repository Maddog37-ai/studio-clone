"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function TestInteractionsPage() {
  const { user } = useAuth();

  const testButtons = [
    {
      name: "Test Console Log",
      action: () => {
        console.log('🔥 TestPage - Test button clicked:', { 
          userRole: user?.role, 
          timestamp: new Date().toISOString() 
        });
      }
    },
    {
      name: "Test Alert",
      action: () => {
        alert("Test alert fired successfully!");
      }
    },
    {
      name: "Test Multiple Logs",
      action: () => {
        console.log('🔥 TestPage - Multiple logs test 1');
        console.log('🔥 TestPage - Multiple logs test 2');
        console.log('🔥 TestPage - Multiple logs test 3');
      }
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">User Information</h3>
            <p><strong>Role:</strong> {user?.role || 'Not loaded'}</p>
            <p><strong>UID:</strong> {user?.uid || 'Not loaded'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Test Interactive Elements</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Open browser console (F12) to see logging output. Look for messages with 🔥 emoji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testButtons.map((test, index) => (
              <Button 
                key={index}
                onClick={test.action}
                variant="outline"
                className="h-auto py-4"
              >
                {test.name}
              </Button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Navigation Test Links</h4>
            <div className="space-y-2">
              <a href="/dashboard" className="block text-blue-600 hover:underline">
                → Dashboard Home
              </a>
              <a href="/dashboard/analytics" className="block text-blue-600 hover:underline">
                → Analytics Page
              </a>
              <a href="/dashboard/profile" className="block text-blue-600 hover:underline">
                → Profile Page
              </a>
              {(user?.role === "admin" || user?.role === "manager") && (
                <a href="/dashboard/admin-tools" className="block text-blue-600 hover:underline">
                  → Admin Tools (Admin/Manager Only)
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions for Testing</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open browser developer tools (F12) and go to Console tab</li>
              <li>Click the test buttons above to verify console logging works</li>
              <li>Navigate to main dashboard and click various interactive elements</li>
              <li>Look for logs with 🔥 emoji prefix in the console</li>
              <li>Test navigation links above to verify routing works</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
