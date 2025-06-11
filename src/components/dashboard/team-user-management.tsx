"use client";

import type {AppUser} from "@/types";
import React, {useEffect, useState} from "react";
import {useAuth} from "@/hooks/use-auth";
import {db} from "@/lib/firebase";
import {collection, query, onSnapshot, doc, writeBatch, updateDoc} from "firebase/firestore";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Loader2, Users, UserCog, Trash2, ShieldAlert, ShieldCheck, Building2, ChevronDown, Camera, Search} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import ChangeUserRoleModal from "./change-user-role-modal";
import ConfirmUserDeleteModal from "./confirm-user-delete-modal";
import UploadAvatarModal from "./upload-avatar-modal";
import TeamSelector from "./team-selector";
import InviteNewUserButton from "./invite-new-user-button";
import {initializeTeams} from "@/utils/init-teams";

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function TeamUserManagement() {
  const {user: managerUser} = useAuth();
  const {toast} = useToast();
  const [teamUsers, setTeamUsers] = useState<AppUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState<AppUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AppUser | null>(null);
  const [selectedUserForAvatar, setSelectedUserForAvatar] = useState<AppUser | null>(null);

  // Load all teams and initialize missing ones
  useEffect(() => {
    const teamsQuery = query(collection(db, "teams"));
    
    const unsubscribe = onSnapshot(teamsQuery, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Team));
      
      setTeams(teamsData);
      
      // Always initialize teams to ensure "empire" exists
      if (managerUser?.role === "manager" || managerUser?.role === "admin") {
        // Check if Empire team exists
        const hasEmpireTeam = teamsData.some(team => team.id === "empire");
        
        if (!hasEmpireTeam) {
          initializeTeams().catch(() => {
            // Error handling done in initializeTeams
          });
        }
      }
    }, (_error) => {
      toast({
        title: "Error",
        description: "Failed to load teams.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast, managerUser]);

  useEffect(() => {
    if (managerUser?.role === "manager" || managerUser?.role === "admin") {
      setLoading(true);
      // Query all users across all teams
      const usersQuery = query(
        collection(db, "users")
      );

      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs
          .map((doc) => ({uid: doc.id, ...doc.data()} as AppUser));
        // Removed filter that excluded the manager

        // Sort client-side
        usersData.sort((a, b) => {
          const nameA = a.displayName || a.email || "";
          const nameB = b.displayName || b.email || "";
          return nameA.localeCompare(nameB);
        });

        setTeamUsers(usersData);
        setLoading(false);
      }, (_error) => {
        toast({title: "Error", description: "Could not fetch team users.", variant: "destructive"});
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
      setTeamUsers([]);
    }
  }, [managerUser, toast]);

  const handleDeleteUser = async (userToDelete: AppUser) => {
    if (!managerUser || (managerUser.role !== "manager" && managerUser.role !== "admin")) {
      toast({title: "Unauthorized", description: "Only managers and admins can delete users.", variant: "destructive"});
      return;
    }
    if (userToDelete.uid === managerUser.uid) {
      toast({title: "Action Not Allowed", description: "You cannot delete yourself.", variant: "destructive"});
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(db, "users", userToDelete.uid);
    batch.delete(userDocRef);

    // If the user was a closer, manager, or admin, delete their closer record too
    if (userToDelete.role === "closer" || userToDelete.role === "manager" || userToDelete.role === "admin") {
      const closerDocRef = doc(db, "closers", userToDelete.uid);
      batch.delete(closerDocRef);
    }

    try {
      await batch.commit();
      toast({
        title: "User Records Deleted",
        description: `${userToDelete.displayName || userToDelete.email}'s records have been removed from the application. Note: Full Firebase Authentication account deletion requires backend admin privileges.`,
        duration: 7000,
      });
      setSelectedUserForDelete(null); // Close modal
    } catch {
      toast({
        title: "Deletion Failed",
        description: "Could not delete user records. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeUserTeam = async (userToMove: AppUser, newTeamId: string) => {
    if (!managerUser || (managerUser.role !== "manager" && managerUser.role !== "admin")) {
      toast({title: "Unauthorized", description: "Only managers and admins can change user teams.", variant: "destructive"});
      return;
    }

    if (userToMove.teamId === newTeamId) {
      toast({title: "No Change", description: "User is already on that team.", variant: "default"});
      return;
    }

    try {
      const userDocRef = doc(db, "users", userToMove.uid);
      await updateDoc(userDocRef, {
        teamId: newTeamId,
        updatedAt: new Date()
      });

      // If the user is a closer, manager, or admin, also update their closer record
      if (userToMove.role === "closer" || userToMove.role === "manager" || userToMove.role === "admin") {
        const closerDocRef = doc(db, "closers", userToMove.uid);
        await updateDoc(closerDocRef, {
          teamId: newTeamId,
          updatedAt: new Date()
        });
      }

      const newTeam = teams.find(t => t.id === newTeamId);
      toast({
        title: "Team Changed",
        description: `${userToMove.displayName || userToMove.email} has been moved to ${newTeam?.name || newTeamId}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to change user's team. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline flex items-center justify-center">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Team Management
          </CardTitle>
          <CardDescription className="text-center">Loading team members...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!managerUser || (managerUser.role !== "manager" && managerUser.role !== "admin")) {
    return null;
  }

  // Filter users based on search query
  const filteredUsers = searchQuery.trim() === '' 
    ? teamUsers 
    : teamUsers.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        const displayName = (user.displayName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        const teamName = (teams.find(t => t.id === user.teamId)?.name || '').toLowerCase();
        
        return displayName.includes(searchLower) || 
               email.includes(searchLower) || 
               role.includes(searchLower) || 
               teamName.includes(searchLower);
      });
  
  return (
    <>
      <div className="space-y-6">
        {/* Team Selection and Invite Controls */}
        <div className="space-y-4">
          {/* Team Selection Dropdown */}
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-headline">Current Team</h3>
              <p className="text-sm text-muted-foreground">Select the team you want to manage</p>
            </div>
          </div>
          <TeamSelector />
          
          {/* Invite New User Button */}
          <div className="flex justify-start">
            <InviteNewUserButton 
              variant="outline" 
              className="border-emerald-500/60 bg-gradient-to-r from-emerald-50/80 to-green-50/80 text-emerald-700 hover:from-emerald-100/90 hover:to-green-100/90 hover:text-emerald-800 hover:border-emerald-500 dark:border-emerald-400/60 dark:from-emerald-950/40 dark:to-green-950/40 dark:text-emerald-300 dark:hover:from-emerald-900/60 dark:hover:to-green-900/60 dark:hover:text-emerald-200 shadow-sm shadow-emerald-200/20 hover:shadow-md hover:shadow-emerald-200/30 transition-all duration-300" 
            />
          </div>
        </div>
        
        {/* Team Member Management */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center">
                <Users className="mr-3 h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold font-headline">Team Management</CardTitle>
                  <CardDescription>Manage roles, teams, and access for your team members.</CardDescription>
                </div>
              </div>
              {/* Search Filter */}
              <div className="w-full sm:max-w-xs">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name, email, role or team..."
                    className="w-full pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {searchQuery.trim() !== '' ? "No matching team members found." : "No team members found."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filteredUsers.map((teamMember) => (
                  <li key={teamMember.uid} className={`py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${teamMember.uid === managerUser?.uid ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <div className="relative group">
                        <Avatar 
                          className={`h-10 w-10 border cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ${teamMember.uid === managerUser?.uid ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                          onClick={() => setSelectedUserForAvatar(teamMember)}
                        >
                          <AvatarImage src={teamMember.avatarUrl || undefined} alt={teamMember.displayName || teamMember.email || "User"} />
                          <AvatarFallback>
                            {teamMember.displayName ? teamMember.displayName.substring(0, 2).toUpperCase() : (teamMember.email ? teamMember.email.substring(0, 2).toUpperCase() : "??")}
                          </AvatarFallback>
                        </Avatar>
                        {/* Camera overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                             onClick={() => setSelectedUserForAvatar(teamMember)}>
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-semibold">{teamMember.displayName || teamMember.email || "Unnamed User"}</p>
                          {teamMember.uid === managerUser?.uid && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">You</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{teamMember.email}</p>
                        <div className="flex flex-col xs:flex-row xs:gap-3">
                          <p className="text-xs text-muted-foreground capitalize flex items-center">
                            {(teamMember.role === "manager" || teamMember.role === "admin") ? <ShieldCheck className="mr-1 h-3 w-3 text-primary" /> : <UserCog className="mr-1 h-3 w-3" />}
                            Role: {teamMember.role}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Building2 className="mr-1 h-3 w-3" />
                            Team: {teams.find(t => t.id === teamMember.teamId)?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0 self-end sm:self-center">
                      {/* Team Selection Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className={
                              teamMember.teamId === "empire" 
                                ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 dark:text-indigo-400" 
                                : "bg-slate-100 dark:bg-slate-800"
                            }
                          >
                            <Building2 className="mr-1.5 h-4 w-4" />
                            Team: {teams.find(t => t.id === teamMember.teamId)?.name || 'Unknown'}
                            <ChevronDown className="ml-1.5 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {teams.filter(team => team.id !== "revolution" && team.id !== "takeover-pros").map((team) => (
                            <DropdownMenuItem
                              key={team.id}
                              onClick={() => handleChangeUserTeam(teamMember, team.id)}
                              disabled={teamMember.teamId === team.id}
                              className={team.id === "empire" ? "text-indigo-700 dark:text-indigo-400 font-medium" : ""}
                            >
                              <Building2 className={`mr-2 h-4 w-4 ${team.id === "empire" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                              {team.name}
                              {teamMember.teamId === team.id && (
                                <ShieldCheck className="ml-auto h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button variant="outline" size="sm" onClick={() => setSelectedUserForRoleChange(teamMember)}>
                        <UserCog className="mr-1.5 h-4 w-4" /> Change Role
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setSelectedUserForDelete(teamMember)} 
                        disabled={(teamMember.role === "manager" || teamMember.role === "admin") || teamMember.uid === managerUser?.uid}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                      {(teamMember.role === "manager" || teamMember.role === "admin") && teamMember.uid !== managerUser?.uid && (
                        <p className="text-xs text-muted-foreground flex items-center ml-2">
                          <ShieldAlert className="h-3 w-3 mr-1 text-orange-500"/> Cannot delete other managers/admins.
                        </p>
                      )}
                      {teamMember.uid === managerUser?.uid && (
                        <p className="text-xs text-muted-foreground flex items-center ml-2">
                          <ShieldAlert className="h-3 w-3 mr-1 text-orange-500"/> Cannot delete yourself.
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedUserForRoleChange && (
        <ChangeUserRoleModal
          userToEdit={selectedUserForRoleChange}
          isOpen={!!selectedUserForRoleChange}
          onClose={() => setSelectedUserForRoleChange(null)}
          managerTeamId={managerUser.teamId}
        />
      )}

      {selectedUserForDelete && (
        <ConfirmUserDeleteModal
          userToDelete={selectedUserForDelete}
          isOpen={!!selectedUserForDelete}
          onClose={() => setSelectedUserForDelete(null)}
          onConfirmDelete={() => handleDeleteUser(selectedUserForDelete)}
        />
      )}

      {selectedUserForAvatar && (
        <UploadAvatarModal
          user={selectedUserForAvatar}
          isOpen={!!selectedUserForAvatar}
          onClose={() => setSelectedUserForAvatar(null)}
        />
      )}
    </>
  );
}

