"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Loader2, Database, AlertCircle } from "lucide-react";

export default function DebugFirebaseData() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const debugFirestoreData = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log("=== FIREBASE CLIENT-SIDE DEBUG ===");
      
      const debugData: any = {
        timestamp: new Date().toISOString(),
        collections: {}
      };

      // Try to fetch leads with in-process status
      try {
        console.log("🔍 Checking leads collection...");
        const leadsQuery = query(
          collection(db, "leads"),
          where("status", "in", ["waiting_assignment", "accepted", "in_process"]),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        
        const leadsSnapshot = await getDocs(leadsQuery);
        debugData.collections.leads = {
          count: leadsSnapshot.size,
          data: leadsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
          }))
        };
        
        console.log(`Found ${leadsSnapshot.size} in-process leads`);
      } catch (leadsError: any) {
        console.error("Error fetching leads:", leadsError);
        debugData.collections.leads = { error: leadsError.message };
      }

      // Try to fetch users
      try {
        console.log("🔍 Checking users collection...");
        const usersQuery = query(collection(db, "users"), limit(10));
        const usersSnapshot = await getDocs(usersQuery);
        
        debugData.collections.users = {
          count: usersSnapshot.size,
          data: usersSnapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            displayName: doc.data().displayName,
            role: doc.data().role,
            teamId: doc.data().teamId
          }))
        };
        
        console.log(`Found ${usersSnapshot.size} users`);
        
        // Look for Richard specifically
        const richardUsers = usersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return (data.displayName || '').toLowerCase().includes('richard') ||
                 (data.email || '').toLowerCase().includes('richard');
        });
        
        if (richardUsers.length > 0) {
          debugData.richardUsers = richardUsers.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("🎯 Found Richard users:", debugData.richardUsers);
        }
        
      } catch (usersError: any) {
        console.error("Error fetching users:", usersError);
        debugData.collections.users = { error: usersError.message };
      }

      // Try to fetch closers
      try {
        console.log("🔍 Checking closers collection...");
        const closersQuery = query(collection(db, "closers"), limit(10));
        const closersSnapshot = await getDocs(closersQuery);
        
        debugData.collections.closers = {
          count: closersSnapshot.size,
          data: closersSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            teamId: doc.data().teamId
          }))
        };
        
        console.log(`Found ${closersSnapshot.size} closers`);
        
        // Look for Richard specifically
        const richardClosers = closersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return (data.name || '').toLowerCase().includes('richard');
        });
        
        if (richardClosers.length > 0) {
          debugData.richardClosers = richardClosers.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("🎯 Found Richard closers:", debugData.richardClosers);
        }
        
      } catch (closersError: any) {
        console.error("Error fetching closers:", closersError);
        debugData.collections.closers = { error: closersError.message };
      }

      // Try to fetch teams
      try {
        console.log("🔍 Checking teams collection...");
        const teamsQuery = query(collection(db, "teams"), limit(5));
        const teamsSnapshot = await getDocs(teamsQuery);
        
        debugData.collections.teams = {
          count: teamsSnapshot.size,
          data: teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
          }))
        };
        
        console.log(`Found ${teamsSnapshot.size} teams`);
      } catch (teamsError: any) {
        console.error("Error fetching teams:", teamsError);
        debugData.collections.teams = { error: teamsError.message };
      }

      console.log("=== DEBUG COMPLETE ===");
      console.log("Full debug data:", debugData);
      
      setResults(debugData);
      
    } catch (error: any) {
      console.error("=== DEBUG ERROR ===", error);
      setError(error.message || "Unknown error occurred");
      
      if (error.code === 'permission-denied') {
        setError("Permission denied - Firestore security rules may be blocking access. Authentication may be required.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Firebase Data Debug Tool
          </CardTitle>
          <CardDescription>
            Investigate Firestore data to understand the Richard Niger in-process leads issue.
            This tool attempts to read data directly from Firebase collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={debugFirestoreData}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Investigating Firebase Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Debug Firebase Collections
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
            <CardDescription>
              Firebase collections data (see browser console for detailed logs)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {Object.entries(results.collections).map(([collectionName, data]: [string, any]) => (
                    <div key={collectionName} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium capitalize">{collectionName}</div>
                      <div className="text-sm text-gray-600">
                        {data.error ? (
                          <span className="text-red-500">Error: {data.error}</span>
                        ) : (
                          <span>{data.count || 0} documents</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {results.richardUsers && (
                <div>
                  <h3 className="font-semibold text-lg text-green-700">🎯 Richard Users Found</h3>
                  <pre className="bg-green-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(results.richardUsers, null, 2)}
                  </pre>
                </div>
              )}

              {results.richardClosers && (
                <div>
                  <h3 className="font-semibold text-lg text-green-700">🎯 Richard Closers Found</h3>
                  <pre className="bg-green-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(results.richardClosers, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg">Raw Data</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
