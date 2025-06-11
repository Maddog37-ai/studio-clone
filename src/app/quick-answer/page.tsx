// Simple investigation page to answer: Are Richard Niger and Marcelo Guerra on the same team?

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickAnswerPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quick Answer: Richard Niger & Marcelo Guerra Team Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="text-xl font-bold mb-2">Investigation Methods Available:</h2>
            <div className="space-y-2">
              <p>• <a href="/test-auth" className="text-blue-600 underline">Test Authentication Page</a> - Create test data including both team members</p>
              <p>• <a href="/debug-richard" className="text-blue-600 underline">Debug Richard Page</a> - Comprehensive investigation tool</p>
              <p>• <a href="/debug-firebase" className="text-blue-600 underline">Firebase Debug Page</a> - Raw database inspection</p>
              <p>• <a href="/dashboard" className="text-blue-600 underline">Dashboard</a> - Main application view</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded p-4">
            <h3 className="font-bold mb-2">Current Status:</h3>
            <p>To determine if Richard Niger and Marcelo Guerra are on the same team, we need to:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Authenticate with the application</li>
              <li>Query the Firestore database for both team members</li>
              <li>Compare their team IDs</li>
            </ol>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="font-bold mb-2">Recommended Steps:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="/test-auth" className="text-blue-600 underline">/test-auth</a></li>
              <li>Create test data (includes Richard Niger & Marcelo Guerra)</li>
              <li>Login with test credentials</li>
              <li>Go to <a href="/debug-richard" className="text-blue-600 underline">/debug-richard</a> to see the results</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
