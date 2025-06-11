
"use client";

import {useState, useEffect} from "react";
import type {Closer, UserRole, Lead} from "@/types";
import {useAuth} from "@/hooks/use-auth";
import {useToast} from "@/hooks/use-toast";
import {db} from "@/lib/firebase";
import {collection, query, where, onSnapshot, orderBy} from "firebase/firestore";
import CloserCard from "./closer-card";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Users, Loader2} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import ManageClosersModal from "./off-duty-closers-modal";

export default function CloserLineup() {
  const {user} = useAuth();
  const {toast} = useToast();
  const [closersInLineup, setClosersInLineup] = useState<Closer[]>([]);
  const [allOnDutyClosers, setAllOnDutyClosers] = useState<Closer[]>([]);
  const [isLoadingClosersForLineup, setIsLoadingClosersForLineup] = useState(true);
  const [assignedLeadCloserIds, setAssignedLeadCloserIds] = useState<Set<string>>(new Set());
  const [isLoadingAssignedCloserIds, setIsLoadingAssignedCloserIds] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Check if user can manage closers (managers and admins)
  const canManageClosers = user?.role === "manager" || user?.role === "admin";
  
  // Check if user is a closer (show full lineup)
  const isCloser = user?.role === "closer";

  // Effect 1: Fetch UIDs of closers assigned to ANY lead (waiting_assignment, scheduled, accepted, in_process).
  useEffect(() => {
    if (!user?.teamId) {
      setAssignedLeadCloserIds(new Set());
      setIsLoadingAssignedCloserIds(false);
      return;
    }

    setIsLoadingAssignedCloserIds(true);
    const leadsQuery = query(
      collection(db, "leads"),
      where("teamId", "==", user.teamId),
      where("status", "in", ["waiting_assignment", "scheduled", "accepted", "in_process"])
    );

    const unsubscribeLeads = onSnapshot(
      leadsQuery,
      (querySnapshot) => {
        const assignedCloserIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          const lead = doc.data() as Lead;
          if (lead.assignedCloserId) {
            assignedCloserIds.add(lead.assignedCloserId);
          }
        });
        setAssignedLeadCloserIds(assignedCloserIds);
        setIsLoadingAssignedCloserIds(false);
      },
      (_error) => {
        toast({
          title: "Error",
          description: "Failed to load assigned closers. Please refresh the page.",
          variant: "destructive",
        });
        setAssignedLeadCloserIds(new Set());
        setIsLoadingAssignedCloserIds(false);
      }
    );
    return () => unsubscribeLeads();
  }, [user?.teamId, toast]);

  // Effect 2: Fetch "On Duty" closers, then filter out those assigned to an "in_process" lead.
  useEffect(() => {
    if (!user?.teamId) {
      setClosersInLineup([]);
      setAllOnDutyClosers([]);
      setIsLoadingClosersForLineup(false);
      return;
    }

    if (isLoadingAssignedCloserIds) {
      setClosersInLineup([]);
      setAllOnDutyClosers([]);
      setIsLoadingClosersForLineup(true);
      return;
    }

    setIsLoadingClosersForLineup(true);
    const closersCollectionQuery = query(
      collection(db, "closers"),
      where("teamId", "==", user.teamId),
      where("status", "==", "On Duty"),
      orderBy("name", "asc")
    );

    const unsubscribeClosers = onSnapshot(
      closersCollectionQuery,
      (querySnapshot) => {
        const allOnDutyClosers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            name: data.name,
            status: data.status as "On Duty" | "Off Duty",
            teamId: data.teamId,
            role: data.role as UserRole,
            avatarUrl: data.avatarUrl,
            phone: data.phone,
            lineupOrder: data.lineupOrder,
          } as Closer;
        });

        // Log to debug why Ryan Madden might be appearing in lineup
        if (allOnDutyClosers.some(closer => closer.name === "Ryan Madden")) {
          const ryanMadden = allOnDutyClosers.find(closer => closer.name === "Ryan Madden");
          console.log("Ryan Madden status:", { 
            isOnDuty: ryanMadden?.status === "On Duty",
            uid: ryanMadden?.uid,
            hasAssignedLead: assignedLeadCloserIds.has(ryanMadden?.uid || ""),
            assignedCloserIds: Array.from(assignedLeadCloserIds)
          });
        }
        
        const availableClosers = allOnDutyClosers.filter(
          (closer) => !assignedLeadCloserIds.has(closer.uid)
        );

        const sortedAvailableClosers = availableClosers
          .map((closer, index) => ({
            ...closer,
            lineupOrder:
              typeof closer.lineupOrder === "number" ?
                closer.lineupOrder :
                (index + 1) * 100000,
          }))
          .sort((a, b) => {
            const orderA = a.lineupOrder || 999999;
            const orderB = b.lineupOrder || 999999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
          });

        // Sort all on duty closers for the full lineup view (closers can see this)
        const sortedAllOnDutyClosers = allOnDutyClosers
          .map((closer, index) => ({
            ...closer,
            lineupOrder:
              typeof closer.lineupOrder === "number" ?
                closer.lineupOrder :
                (index + 1) * 100000,
          }))
          .sort((a, b) => {
            const orderA = a.lineupOrder || 999999;
            const orderB = b.lineupOrder || 999999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
          });

        setClosersInLineup(sortedAvailableClosers);
        setAllOnDutyClosers(sortedAllOnDutyClosers);
        setIsLoadingClosersForLineup(false);
      },
      (_error) => {
        toast({
          title: "Error",
          description: "Failed to load closer lineup. Please refresh the page.",
          variant: "destructive",
        });
        setClosersInLineup([]);
        setAllOnDutyClosers([]);
        setIsLoadingClosersForLineup(false);
      }
    );

    return () => unsubscribeClosers();
  }, [user?.teamId, assignedLeadCloserIds, isLoadingAssignedCloserIds, toast]);

  const isOverallLoading = isLoadingAssignedCloserIds || isLoadingClosersForLineup;

  const handleCardClick = () => {
    if (canManageClosers) {
      setIsManageModalOpen(true);
    }
  };

  // Determine which closers to display and the appropriate messaging
  const getDisplayData = () => {
    // Safety check for user data
    if (!user || !user.role) {
      return {
        closers: [],
        emptyTitle: "Loading...",
        emptyDescription: "Please wait while we load your data.",
        titleSuffix: 'Loading'
      };
    }

    if (isCloser) {
      // Closers see the full On Duty lineup with their position
      const displayClosers = allOnDutyClosers;
      const emptyTitle = "No On Duty Closers";
      const emptyDescription = "No closers are currently on duty.";
      const titleSuffix = 'On duty team members';
      
      return {
        closers: displayClosers,
        emptyTitle,
        emptyDescription,
        titleSuffix
      };
    } else {
      // Managers/admins/setters see only available closers
      const displayClosers = closersInLineup;
      const emptyTitle = "No Available Closers";
      const emptyDescription = "All closers are currently off duty or assigned to leads.";
      const titleSuffix = 'Available team members';
      
      return {
        closers: displayClosers,
        emptyTitle,
        emptyDescription,
        titleSuffix
      };
    }
  };

  const { closers: displayClosers, emptyTitle, emptyDescription, titleSuffix } = getDisplayData();

  // Early return if user is not loaded yet
  if (!user) {
    return (
      <Card className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 border-0 ring-1 ring-slate-200 dark:ring-slate-800 dark:card-glass dark:glow-cyan">
        <CardContent className="flex-grow overflow-hidden px-6 pb-6">
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm mt-2">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 border-0 ring-1 ring-slate-200 dark:ring-slate-800 dark:card-glass dark:glow-cyan"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold font-headline flex items-center text-slate-900 dark:text-slate-100">
            <div 
              className={`p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 ${
                canManageClosers ? 'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors' : ''
              }`}
              onClick={canManageClosers ? handleCardClick : undefined}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span>Closer Lineup</span>
              <span className="text-sm font-normal text-muted-foreground">
                {canManageClosers ? 'Click icon to manage • ' + titleSuffix : titleSuffix}
              </span>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOverallLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-6 pb-6">
        {displayClosers.length === 0 && !isOverallLoading ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{emptyTitle}</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {emptyDescription}
            </p>
            {user && !user.teamId && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-md mt-2">
                Error: User missing team assignment
              </p>
            )}
          </div>
        ) : (
          <div className="h-64">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-2">
                {displayClosers.map((closer, index) => {
                  const isCurrentUser = closer.uid === user?.uid;
                  const isAssigned = assignedLeadCloserIds.has(closer.uid);
                  
                  return (
                    <div key={closer.uid} className={isCurrentUser ? "ring-2 ring-blue-400 dark:ring-blue-500 rounded-lg" : ""}>
                      <CloserCard
                        closer={closer}
                        allowInteractiveToggle={false}
                        position={index + 1}
                        assignedLeadName={
                          isAssigned ? "Working on lead" : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Manage Closers Modal */}
    <ManageClosersModal
      isOpen={isManageModalOpen}
      onClose={() => setIsManageModalOpen(false)}
    />
    </>
  );
}
