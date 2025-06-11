"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { acceptJobFunction, debugAcceptJobFunction, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestAcceptJob() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [leadId, setLeadId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
  const [leadLoading, setLeadLoading] = useState<boolean>(false);
  
  // Load assigned leads for the current user
  useEffect(() => {
    async function fetchAssignedLeads() {
      if (!user?.uid) return;
      
      setLeadLoading(true);
      try {
        const leadsQuery = query(
          collection(db, "leads"),
          where("assignedCloserId", "==", user.uid),
          where("status", "in", ["waiting_assignment", "scheduled"])
        );
        
        const querySnapshot = await getDocs(leadsQuery);
        const leads = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAssignedLeads(leads);
      } catch (err) {
        console.error("Error fetching assigned leads:", err);
      } finally {
        setLeadLoading(false);
      }
    }
    
    fetchAssignedLeads();
  }, [user?.uid]);

  const handleAcceptJob = async () => {
    if (!leadId) {
      toast({
        title: "Error",
        description: "Please enter a lead ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log("Calling acceptJob with:", { leadId });
      const response = await acceptJobFunction({ leadId });
      console.log("acceptJob response:", response);
      
      setResult(response.data);
      toast({
        title: "Success",
        description: "Job acceptance request processed successfully",
      });
      
      // Remove the lead from the list if it was accepted
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success && !('alreadyAccepted' in response.data && response.data.alreadyAccepted)) {
        setAssignedLeads(prev => prev.filter(lead => lead.id !== leadId));
      }
    } catch (err: any) {
      console.error("Error calling acceptJob:", err);
      setError(err.message || "An error occurred");
      toast({
        title: "Error",
        description: `Failed to accept job: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugAcceptJob = async () => {
    if (!leadId) {
      toast({
        title: "Error",
        description: "Please enter a lead ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await debugAcceptJobFunction(leadId);
      setResult(response.data);
      toast({
        title: "Debug Complete",
        description: "Debug acceptance request processed",
      });
    } catch (err: any) {
      console.error("Error in debug function:", err);
      setError(err.message || "An error occurred");
      toast({
        title: "Debug Error",
        description: `Failed in debug mode: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (lead: any) => {
    setLeadId(lead.id);
    setResult(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Accept Job Function</CardTitle>
        <CardDescription>
          Test the job acceptance functionality directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="assigned">Your Assigned Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leadId">Lead ID</Label>
              <Input
                id="leadId"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                placeholder="Enter the lead ID"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="assigned">
            {leadLoading ? (
              <div className="text-center py-4">Loading your assigned leads...</div>
            ) : assignedLeads.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No waiting or scheduled leads assigned to you
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignedLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className={`p-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                      leadId === lead.id ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => selectLead(lead)}
                  >
                    <div className="font-medium">{lead.customerName}</div>
                    <div className="text-xs flex justify-between">
                      <span>Status: {lead.status.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">{lead.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex space-x-2">
          <Button
            onClick={handleAcceptJob}
            disabled={loading || !leadId}
            className="flex-1"
          >
            {loading ? "Processing..." : "Accept Job"}
          </Button>
          
          <Button
            onClick={handleDebugAcceptJob}
            disabled={loading || !leadId}
            variant="outline"
            className="flex-1"
          >
            Debug Mode
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md">
            <h3 className="font-medium">Result:</h3>
            <pre className="text-sm overflow-auto mt-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded-md">
            <h3 className="font-medium">Error:</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
