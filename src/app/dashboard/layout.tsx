"use client";

import type {ReactNode} from "react";
import {useAuth} from "@/hooks/use-auth";
import {useRouter, usePathname} from "next/navigation";
import {useEffect, useState} from "react";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  UserCircle, 
  ClipboardList, 
  PlusCircle, 
  Home,
  BarChart3,
  Settings,
  Shield,
  Wrench,
  Loader2
} from "lucide-react";
import AvailabilityToggle from "@/components/dashboard/availability-toggle";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import dynamic from "next/dynamic";
import TeamChatButton from "@/components/dashboard/floating-team-chat-button";
import { Separator } from "@/components/ui/separator";

// Dynamic import with Next.js dynamic to avoid circular dependency issues
const CreateLeadForm = dynamic(() => import("@/components/dashboard/create-lead-form"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const ManagerToolsModal = dynamic(() => import("@/components/dashboard/manager-tools-modal"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function DashboardLayout({children}: { children: ReactNode }) {
  const {user, logout, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [isManagerToolsModalOpen, setIsManagerToolsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  const getAvatarFallbackText = () => {
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return <UserCircle size={24} />;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-border/20">
            <div className="flex items-center space-x-3 p-4">
              <div className="p-2 bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 rounded-xl shadow-sm">
                <ClipboardList className="h-6 w-6 text-[#3574F2]" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-bold font-headline bg-gradient-to-r from-[#3574F2] to-[#5096F2] bg-clip-text text-transparent">
                  LeadFlow
                </span>
                <span className="text-xs text-muted-foreground">Lead Management</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1">
            <SidebarMenu className="p-2">
              {/* Create New Lead Button - positioned above Dashboard */}
              {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsCreateLeadModalOpen(true)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-[#3574F2] to-[#5096F2] hover:from-[#3574F2]/90 hover:to-[#5096F2]/90 text-white shadow-lg shadow-[#3574F2]/25 hover:shadow-xl hover:shadow-[#3574F2]/30 transition-all duration-300 border-0"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Create New Lead</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" className="flex items-center space-x-3">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Separator className="my-2" />

              {/* Manager Tools - only for managers and admins */}
              {(user?.role === "manager" || user?.role === "admin") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsManagerToolsModalOpen(true)}
                    className="flex items-center space-x-3"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Manager Tools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Navigation Items */}
              {/* Lead Management - only visible to Ryan Madden */}
              {(user?.email?.includes('ryan.madden') || 
                user?.email?.includes('ryan@') || 
                user?.displayName?.toLowerCase().includes('ryan madden') ||
                (user?.displayName || '').toLowerCase().includes('ryan') && (user?.email || '').toLowerCase().includes('madden')) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/lead-management"}>
                    <Link href="/dashboard/lead-management" className="flex items-center space-x-3">
                      <ClipboardList className="h-5 w-5" />
                      <span>Lead Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}



              {/* Performance Analytics - only for managers and admins */}
              {(user?.role === "manager" || user?.role === "admin") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/performance-analytics"}>
                    <Link href="/dashboard/performance-analytics" className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5" />
                      <span>Performance Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}



              {/* Admin Tools - only for admin users */}
              {user?.role === "admin" && (
                <>
                  <Separator className="my-2" />
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/admin-tools"}>
                      <Link href="/dashboard/admin-tools" className="flex items-center space-x-3">
                        <Shield className="h-5 w-5" />
                        <span>Admin Tools</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/quick-cleanup"}>
                      <Link href="/dashboard/quick-cleanup" className="flex items-center space-x-3">
                        <Wrench className="h-5 w-5" />
                        <span>Quick Cleanup</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

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

          <SidebarFooter className="border-t border-border/20">
            <SidebarMenu>
              {/* Theme Toggle */}
              <SidebarMenuItem>
                <div className="flex justify-center px-2 py-2">
                  <ThemeToggleButton />
                </div>
              </SidebarMenuItem>

              {/* User Profile */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                  <Link href="/dashboard/profile" className="flex items-center space-x-3 p-3">
                    <Avatar className="h-9 w-9 border-2 border-border shadow-sm">
                      <AvatarImage 
                        src={user?.avatarUrl || undefined} 
                        alt={user?.displayName || user?.email || "User"} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 text-[#3574F2] font-semibold">
                        {getAvatarFallbackText()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold text-foreground truncate">
                        {user?.displayName || user?.email}
                      </span>
                      <span className="text-muted-foreground capitalize text-xs">{user?.role}</span>
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
                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with sidebar trigger */}
          <header className="sticky top-0 z-40 w-full border-b border-border/20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/95 shadow-sm">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger className="mr-2" />
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {pathname === "/dashboard" ? "Dashboard" :
                   pathname === "/dashboard/lead-management" ? "Lead Management" :
                   pathname === "/dashboard/analytics" ? "Analytics" :
                   pathname === "/dashboard/performance-analytics" ? "Performance Analytics" :
                   pathname === "/dashboard/profile" ? "Profile" :
                   pathname === "/dashboard/admin-tools" ? "Admin Tools" :
                   pathname === "/dashboard/quick-cleanup" ? "Quick Cleanup" :
                   "Dashboard"}
                </span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Create Lead Modal */}
      {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
        <CreateLeadForm
          isOpen={isCreateLeadModalOpen}
          onClose={() => setIsCreateLeadModalOpen(false)}
        />
      )}

      {/* Manager Tools Modal */}
      {(user?.role === "manager" || user?.role === "admin") && (
        <ManagerToolsModal
          isOpen={isManagerToolsModalOpen}
          onClose={() => setIsManagerToolsModalOpen(false)}
        />
      )}
    </SidebarProvider>
  );
}
