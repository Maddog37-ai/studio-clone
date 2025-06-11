"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc as _doc, getDoc as _getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DebugInformation() {
  const [loading, setLoading] = useState(true);
  const [closerInfo, setCloserInfo] = useState<any>(null);
  const [leadInfo, setLeadInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // 1. Find Ryan Madden's closer record
        const closersQuery = query(collection(db, "closers"), where("name", "==", "Ryan Madden"));
        const closerSnapshot = await getDocs(closersQuery);
        
        if (closerSnapshot.empty) {
          setError("Could not find Ryan Madden in the closers collection");
          setLoading(false);
          return;
        }
        
        const ryanMadden = { id: closerSnapshot.docs[0].id, ...closerSnapshot.docs[0].data() };
        setCloserInfo(ryanMadden);
        
        // 2. Find any lead assigned to Ryan Madden
        const leadsQuery = query(
          collection(db, "leads"), 
          where("assignedCloserId", "==", ryanMadden.id)
        );
        const leadSnapshot = await getDocs(leadsQuery);
        
        if (!leadSnapshot.empty) {
          const assignedLeads = leadSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          setLeadInfo(assignedLeads);
        } else {
          setLeadInfo("No leads assigned");
        }
        
      } catch (err) {
        console.error("Error fetching debug info:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDebugInfo();
  }, []);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Debug Information...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Closer Info (Ryan Madden)</h3>
            <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-xs">
              {closerInfo ? JSON.stringify(closerInfo, null, 2) : "No closer info found"}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Assigned Leads</h3>
            <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-xs">
              {leadInfo ? JSON.stringify(leadInfo, null, 2) : "No lead info found"}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
