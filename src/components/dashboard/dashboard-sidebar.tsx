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
  Brain,
  Monitor
} from "lucide-react";
import AvailabilityToggle from "./availability-toggle";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useState } from "react";
import React from "react";
import dynamic from "next/dynamic";
import FloatingChatButton from "./floating-ai-button";
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
      <Sidebar className="">
        <SidebarHeader className="border-b border-border/20">
          <div className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-gradient-to-br from-premium-purple/30 to-premium-teal/20 rounded-xl premium:icon-hover-glow shadow-sm">
              <GearIcon className="h-10 w-10 sm:h-12 sm:w-12 premium:text-premium-purple premium:icon-glow-purple premium:icon-pulse transition-all duration-300" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-xl sm:text-2xl font-extrabold font-headline text-foreground tracking-tight leading-tight">LeadFlow</span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide">Premium Lead Management</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard" className="flex items-center space-x-3 group">
                  <Home className="h-5 w-5 transition-colors duration-300" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Create Lead Button */}
            {(user?.role === "setter" || isManagerOrAdmin) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCreateLeadModalOpen(true)}
                  className="bg-gradient-to-r from-[#3574F2] to-[#5096F2] hover:from-[#3574F2]/90 hover:to-[#5096F2]/90 text-white shadow-lg shadow-[#3574F2]/25 hover:shadow-xl hover:shadow-[#3574F2]/30 transition-all duration-300 border-0 group"
                >
                  <PlusCircle className="h-5 w-5 transition-all duration-300" />
                  <span>Create New Lead</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {/* Leaderboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/leaderboard" className="flex items-center space-x-3 group">
                  <Trophy className="h-5 w-5 text-yellow-500 transition-colors duration-300" />
                  <span>Leaderboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Separator className="my-2" />

            {/* Manager/Admin Tools */}
            {isManagerOrAdmin && (
              <>
                {/* For Managers: Show manager tools directly */}
                {isManager && !isAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/lead-history" className="flex items-center space-x-3 group">
                          <ClipboardList className="h-5 w-5 transition-colors duration-300" />
                          <span>Lead History</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/performance-analytics" className="flex items-center space-x-3 group">
                          <Brain className="h-5 w-5 transition-colors duration-300" />
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
                          <Users className="h-4 w-4 text-blue-500 transition-colors duration-300" />
                          <span className="text-sm font-medium text-blue-600">Manager Tools</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/lead-history" className="flex items-center space-x-3 ml-4 group">
                          <ClipboardList className="h-4 w-4 transition-colors duration-300" />
                          <span>Lead History</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/manage-teams" className="flex items-center space-x-3 ml-4 group">
                          <Users className="h-4 w-4 transition-colors duration-300" />
                          <span>Manage Teams</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/performance-analytics" className="flex items-center space-x-3 ml-4 group">
                          <Brain className="h-4 w-4 transition-colors duration-300" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div className="my-2" />

                    {/* Admin Tools */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/admin-tools" className="flex items-center space-x-3 group">
                          <Settings className="h-5 w-5 transition-colors duration-300" />
                          <span>Admin Tools</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <Separator className="my-2" />
              </>
            )}

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

        <SidebarFooter className="border-t border-border/20 p-4 min-h-[180px] flex-shrink-0">
          <SidebarMenu className="space-y-3 h-full">
            {/* User Profile */}
            <SidebarMenuItem className="flex-1">
              <SidebarMenuButton asChild>
                <Link href="/dashboard/profile" className="flex items-center space-x-4 p-4 min-h-[60px] transition-all duration-300">
                  <Avatar className="h-12 w-12 border-2 border-border shadow-md flex-shrink-0 premium:border-premium-glow">
                    <AvatarImage 
                      src={user?.avatarUrl || undefined} 
                      alt={user?.displayName || user?.email || 'User'} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 dark:from-turquoise/20 dark:to-cyan/10 premium:from-premium-purple/20 premium:to-premium-teal/10 text-[#3574F2] dark:text-turquoise premium:text-premium-purple font-semibold text-lg">
                      {getAvatarFallbackText()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                    <span className="font-bold text-foreground text-base truncate premium:text-foreground">
                      {user?.displayName || user?.email}
                    </span>
                    <span className="text-muted-foreground capitalize font-medium truncate premium:text-muted-foreground">{user?.role}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Display Settings in Profile */}
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-4 py-2 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-muted-foreground transition-colors duration-300" />
                  <span className="text-sm text-muted-foreground">Theme</span>
                </div>
                <ThemeToggleButton />
              </div>
            </SidebarMenuItem>

            {/* Logout Button */}
            <SidebarMenuItem>
              <div className="flex justify-center px-2 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Logout"
                  className="h-10 w-10 hover:bg-red-50 hover:text-red-600 transition-colors duration-300 group"
                >
                  <LogOut className="h-5 w-5 transition-all duration-300" />
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
          <header className="sticky top-0 z-40 w-full border-b border-border/20 bg-white/95 dark:bg-slate-950/95 dark:card-glass dark:glow-turquoise premium:card-glass premium:glow-premium backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/95 premium:supports-[backdrop-filter]:bg-transparent shadow-sm">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger className="mr-3 dark:text-turquoise dark:hover:bg-slate-800/50 dark:hover:glow-cyan premium:text-premium-purple premium:hover:bg-premium-glass/50 premium:hover:glow-premium" />
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
      
      {/* Floating Chat Button */}
      <FloatingChatButton />
    </SidebarProvider>
  );
}
