"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  UserCircle, 
  ClipboardList,
  PlusCircle, 
  User,
  Home,
  BarChart3,
  Settings,
  Users,
  Trophy,
  Brain
} from "lucide-react";
import AvailabilityToggle from "./availability-toggle";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useState } from "react";
import React from "react";
import dynamic from "next/dynamic";
import TeamChatButton from "./floating-team-chat-button";
import GearIcon from "@/components/ui/gear-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Dynamic import with Next.js dynamic to avoid circular dependency issues
const CreateLeadForm = dynamic(() => import("./create-lead-form"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

function DashboardSidebarContent() {
  const { user, logout } = useAuth();
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);

  // Debug logging for user role
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 Sidebar Debug - User data:', user);
      console.log('🎭 Current role:', user?.role);
      console.log('👤 User UID:', user?.uid);
      console.log('📧 User email:', user?.email);
      console.log('🏢 Team ID:', user?.teamId);
      
      // Log role-based conditions
      const isManager = user?.role === "manager";
      const isAdmin = user?.role === "admin";
      const isManagerOrAdmin = isManager || isAdmin;
      
      console.log('🔐 Role checks:', {
        isManager,
        isAdmin,
        isManagerOrAdmin,
        shouldShowManagerTools: isManagerOrAdmin
      });
    }
  }, [user]);

  const getAvatarFallbackText = () => {
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return <UserCircle size={24} />;
  };

  // Explicitly check user roles
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";
  const isManagerOrAdmin = isManager || isAdmin;
  const isAdminOnly = user?.role === "admin";

  // Debug log role state
  React.useEffect(() => {
    console.log('🔐 Sidebar role state:', {
      userRole: user?.role,
      isManager,
      isAdmin,
      isManagerOrAdmin,
      isAdminOnly
    });
  }, [user?.role, isManager, isAdmin, isManagerOrAdmin, isAdminOnly]);

  return (
    <>
      <Sidebar className="dark:card-glass dark:glow-turquoise dark:border-turquoise/20">
        <SidebarHeader className="border-b border-border/20 dark:border-turquoise/20">
          <div className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 dark:from-turquoise/20 dark:to-cyan/10 rounded-xl shadow-sm dark:glow-turquoise">
              <GearIcon className="h-12 w-12 text-[#3574F2] dark:text-turquoise" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-bold font-headline bg-gradient-to-r from-[#3574F2] to-[#5096F2] dark:from-turquoise dark:to-cyan bg-clip-text text-transparent">
                LeadFlow
              </span>
              <span className="text-xs text-muted-foreground">Lead History</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Create Lead Button */}
            {(user?.role === "setter" || isManagerOrAdmin) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCreateLeadModalOpen(true)}
                  className="bg-gradient-to-r from-[#3574F2] to-[#5096F2] hover:from-[#3574F2]/90 hover:to-[#5096F2]/90 dark:from-turquoise dark:to-cyan dark:hover:from-turquoise/90 dark:hover:to-cyan/90 text-white shadow-lg shadow-[#3574F2]/25 dark:shadow-turquoise/25 hover:shadow-xl hover:shadow-[#3574F2]/30 dark:hover:shadow-turquoise/30 transition-all duration-300 border-0 dark:glow-turquoise"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create New Lead</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <Separator className="my-2" />

            {/* Manager/Admin Tools */}
            {isManagerOrAdmin && (
              <>
                {/* For Managers: Show manager tools directly */}
                {isManager && !isAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/lead-history" className="flex items-center space-x-3">
                          <ClipboardList className="h-5 w-5" />
                          <span>Lead History</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/performance-analytics" className="flex items-center space-x-3">
                          <Brain className="h-5 w-5" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* For Admins: Show both Manager Tools and Admin Tools sections */}
                {isAdminOnly && (
                  <>
                    {/* Manager Tools Section for Admins */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center space-x-3 px-2 py-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Manager Tools</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/lead-history" className="flex items-center space-x-3 ml-4">
                          <ClipboardList className="h-4 w-4" />
                          <span>Lead History</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/manage-teams" className="flex items-center space-x-3 ml-4">
                          <Users className="h-4 w-4" />
                          <span>Manage Teams</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/performance-analytics" className="flex items-center space-x-3 ml-4">
                          <Brain className="h-4 w-4" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div className="my-2" />

                    {/* Admin Tools Section */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center space-x-3 px-2 py-1">
                          <Settings className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Admin Tools</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/admin-tools" className="flex items-center space-x-3 ml-4">
                          <Settings className="h-4 w-4" />
                          <span>Region & Team Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <Separator className="my-2" />
              </>
            )}

            {/* Navigation Items */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/leaderboard" className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Leaderboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/profile" className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Team Chat */}
            <SidebarMenuItem>
              <div className="px-2 py-1">
                <TeamChatButton />
              </div>
            </SidebarMenuItem>

            {/* Availability Toggle for closers */}
            {user?.role === "closer" && (
              <SidebarMenuItem>
                <div className="px-2 py-1">
                  <AvailabilityToggle />
                </div>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/20 dark:border-turquoise/20 dark:card-glass">
          <SidebarMenu>
            {/* Theme Toggle positioned above user profile */}
            <SidebarMenuItem>
              <div className="flex justify-center px-2 py-1">
                <ThemeToggleButton />
              </div>
            </SidebarMenuItem>

            {/* User Profile */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/profile" className="flex items-center space-x-3 p-2 dark:card-glass dark:glow-cyan hover:dark:glow-turquoise transition-all duration-300">
                  <Avatar className="h-8 w-8 border-2 border-border dark:border-turquoise/30 shadow-sm dark:glow-turquoise">
                    <AvatarImage 
                      src={user?.avatarUrl || undefined} 
                      alt={user?.displayName || user?.email || "User"} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 dark:from-turquoise/20 dark:to-cyan/10 text-[#3574F2] dark:text-turquoise font-semibold">
                      {getAvatarFallbackText()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-xs group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-foreground">
                      {user?.displayName || user?.email}
                    </span>
                    <span className="text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Logout Button */}
            <SidebarMenuItem>
              <div className="flex justify-center px-2 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Logout"
                  className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Create Lead Modal */}
      {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
        <CreateLeadForm
          isOpen={isCreateLeadModalOpen}
          onClose={() => setIsCreateLeadModalOpen(false)}
        />
      )}
    </>
  );
}

export default function DashboardSidebar({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <DashboardSidebarContent />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with sidebar trigger */}
          <header className="sticky top-0 z-40 w-full border-b border-border/20 bg-white/95 dark:bg-slate-950/95 dark:card-glass dark:glow-turquoise backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/95 shadow-sm">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger className="mr-3 dark:text-turquoise dark:hover:bg-slate-800/50 dark:hover:glow-cyan" />
              {/* Team Logo */}
              {user?.teamId === "takeover-pros" && (
                <div className="flex items-center mr-4">
                  <img 
                    src="https://imgur.com/l5eskR4.png" 
                    alt="Takeoverpros Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {pathname === "/dashboard" ? "Dashboard" :
                   pathname === "/dashboard/lead-history" ? "Lead History" :
                   pathname === "/dashboard/analytics" ? "Analytics" :
                   pathname === "/dashboard/performance-analytics" ? "Analytics" :
                   pathname === "/dashboard/profile" ? "Profile" :
                   pathname === "/dashboard/admin-tools" ? "Admin Tools" :
                   pathname === "/dashboard/leaderboard" ? "Leaderboard" :
                   pathname === "/dashboard/quick-cleanup" ? "Quick Cleanup" :
                   "Dashboard"}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children || "Dashboard content goes here"}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
