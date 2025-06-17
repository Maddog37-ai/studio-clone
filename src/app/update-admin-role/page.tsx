"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { updateAdminRolesFunction } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpdateAdminRolesResult {
  success: boolean;
  message?: string;
  error?: string;
  results?: {
    ryan?: {
      found: boolean;
      updated: boolean;
      alreadyAdmin?: boolean;
    };
    rocky?: {
      found: boolean;
      updated: boolean;
      alreadyAdmin?: boolean;
    };
  };
  updatedCount?: number;
}

export default function UpdateAdminRolePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<UpdateAdminRolesResult | null>(null);

  const handleUpdateAdminRoles = async () => {
    try {
      setIsUpdating(true);
      setResults(null);
      
      const result = await updateAdminRolesFunction();
      
      console.log("✅ Function result:", result.data);
      const data = result.data as UpdateAdminRolesResult;
      setResults(data);
      
      if (data?.success) {
        toast({
          title: "Success!",
          description: data.message || "Admin roles updated successfully",
        });
        
        // Refresh the page after a short delay to see the updated role
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Update Failed",
          description: data?.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("❌ Error calling updateAdminRoles:", error);
      
      toast({
        title: "Function Call Failed",
        description: error.message || "Failed to call the admin role update function",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Please log in to access this page.</p>
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
            <Shield className="h-6 w-6 text-primary" />
            Admin Role Updater
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-semibold">Current User: {user.displayName || user.email}</p>
              <Badge variant="outline" className="mt-1">
                Role: {user.role}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              This will update Ryan Madden and Rocky Niger to admin roles in the database.
            </p>
            
            <Button 
              onClick={handleUpdateAdminRoles}
              disabled={isUpdating}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Admin Roles...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Update Admin Roles
                </>
              )}
            </Button>
          </div>

          {/* Results Display */}
          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {results.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  Update Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Status:</strong> {results.success ? "Success" : "Failed"}
                  </p>
                  
                  {results.message && (
                    <p className="text-sm">
                      <strong>Message:</strong> {results.message}
                    </p>
                  )}

                  {results.results && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Details:</p>
                      <div className="pl-4 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Ryan Madden:</span>
                          {results.results.ryan?.found ? (
                            <Badge variant={results.results.ryan.updated ? "default" : "secondary"}>
                              {results.results.ryan.updated ? "Updated" : results.results.ryan.alreadyAdmin ? "Already Admin" : "Found"}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Not Found</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span>Rocky Niger:</span>
                          {results.results.rocky?.found ? (
                            <Badge variant={results.results.rocky.updated ? "default" : "secondary"}>
                              {results.results.rocky.updated ? "Updated" : results.results.rocky.alreadyAdmin ? "Already Admin" : "Found"}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Not Found</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {results.updatedCount !== undefined && (
                    <p className="text-sm">
                      <strong>Users Updated:</strong> {results.updatedCount}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="font-medium mb-2">Instructions:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Click the "Update Admin Roles" button above</li>
              <li>The function will search for Ryan Madden and Rocky Niger in the database</li>
              <li>If found and not already admin, their roles will be updated to "admin"</li>
              <li>The page will automatically refresh to show the updated role</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
