"use client";

import Link from "next/link";
import {useAuth} from "@/hooks/use-auth";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LogOut, UserCircle, PlusCircle} from "lucide-react";
import AvailabilityToggle from "./availability-toggle";
import {useState} from "react";
import dynamic from "next/dynamic";
import TeamChatButton from "./floating-team-chat-button";
import GearIcon from "@/components/ui/gear-icon";

// Dynamic import with Next.js dynamic to avoid circular dependency issues
const CreateLeadForm = dynamic(() => import("./create-lead-form"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function DashboardHeader() {
  const {user, logout} = useAuth();
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);

  const getAvatarFallbackText = () => {
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return <UserCircle size={24}/>;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-white/95 dark:bg-slate-950/95 dark:card-glass dark:glow-turquoise backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/95 shadow-sm">
        <div className="container flex h-16 sm:h-18 max-w-7xl mx-auto items-center px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="mr-6 sm:mr-8 flex items-center space-x-3 premium:text-premium-purple group">
            <div className="p-3 bg-gradient-to-br from-premium-purple/30 to-premium-teal/20 rounded-xl premium:icon-hover-glow shadow-sm">
              <GearIcon className="h-14 w-14 sm:h-20 sm:w-20 premium:text-premium-purple premium:icon-glow-purple premium:icon-pulse transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold font-headline bg-gradient-to-r from-premium-purple to-premium-teal bg-clip-text text-transparent premium:text-glow tracking-tight leading-tight">LeadFlow</span>
              <span className="text-xs text-muted-foreground hidden sm:block premium:text-muted-foreground font-medium tracking-wide">Premium Lead Management</span>
            </div>
          </Link>
          
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 md:space-x-4 ml-auto">
            {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
              <Button 
                onClick={() => setIsCreateLeadModalOpen(true)} 
                variant="primary-solid" 
                size="sm" 
                className="hidden sm:flex bg-gradient-to-r from-[#3574F2] to-[#5096F2] hover:from-[#3574F2]/90 hover:to-[#5096F2]/90 dark:from-turquoise dark:to-cyan dark:hover:from-turquoise/90 dark:hover:to-cyan/90 premium:from-premium-purple premium:to-premium-teal premium:hover:from-premium-purple/90 premium:hover:to-premium-teal/90 shadow-lg shadow-[#3574F2]/25 dark:shadow-turquoise/25 premium:shadow-premium-purple/25 hover:shadow-xl hover:shadow-[#3574F2]/30 dark:hover:shadow-turquoise/30 premium:hover:shadow-premium-purple/30 transition-all duration-300 border-0 dark:glow-turquoise premium:glow-premium group"
              >
                <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden md:inline">Create New Lead</span>
                <span className="md:hidden">Create</span>
              </Button>
            )}
            {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
              <Button 
                onClick={() => setIsCreateLeadModalOpen(true)} 
                variant="primary-solid" 
                size="sm" 
                className="sm:hidden bg-gradient-to-r from-[#3574F2] to-[#5096F2] hover:from-[#3574F2]/90 hover:to-[#5096F2]/90 dark:from-turquoise dark:to-cyan dark:hover:from-turquoise/90 dark:hover:to-cyan/90 premium:from-premium-purple premium:to-premium-teal premium:hover:from-premium-purple/90 premium:hover:to-premium-teal/90 shadow-lg shadow-[#3574F2]/25 dark:shadow-turquoise/25 premium:shadow-premium-purple/25 border-0 dark:glow-turquoise premium:glow-premium group"
              >
                <PlusCircle className="h-4 w-4 premium:nav-icon premium:icon-glow-white transition-all duration-300" />
              </Button>
            )}
            
            <TeamChatButton />
            
            {user?.role === "closer" && <AvailabilityToggle />}
            
            <Link 
              href="/dashboard/profile" 
              className="flex items-center space-x-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 premium:hover:bg-premium-glass/50 dark:card-glass dark:glow-cyan premium:card-glass premium:glow-premium transition-all duration-300 group"
            >
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-border dark:border-turquoise/30 premium:border-premium-glow shadow-sm dark:glow-turquoise premium:glow-premium">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || user?.email || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-[#3574F2]/20 to-[#5096F2]/10 dark:from-turquoise/20 dark:to-cyan/10 premium:from-premium-purple/20 premium:to-premium-teal/10 text-[#3574F2] dark:text-turquoise premium:text-premium-purple font-semibold">
                  {getAvatarFallbackText()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-xs">
                <span className="font-semibold text-foreground">{user?.displayName || user?.email}</span>
                <span className="text-muted-foreground capitalize">{user?.role}</span>
              </div>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              aria-label="Logout" 
              className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-red-50 dark:hover:bg-red-950/20 premium:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 premium:hover:text-red-300 transition-colors duration-300 group"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 premium:nav-icon premium:icon-glow-white transition-all duration-300" />
            </Button>
          </div>
        </div>
      </header>
      {(user?.role === "setter" || user?.role === "manager" || user?.role === "admin") && (
        <CreateLeadForm
          isOpen={isCreateLeadModalOpen}
          onClose={() => setIsCreateLeadModalOpen(false)}
        />
      )}
    </>
  );
}
