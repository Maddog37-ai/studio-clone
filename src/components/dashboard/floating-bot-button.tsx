"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";
import BotChat from "./bot-chat";
import { cn } from "@/lib/utils";

interface FloatingBotButtonProps {
  className?: string;
}

export default function FloatingBotButton({ className }: FloatingBotButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40",
          "bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-200",
          "dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500",
          "hover:scale-110 active:scale-95 border-2 border-amber-300 dark:border-amber-400/60 shadow-amber-200/50 dark:shadow-amber-400/30",
          "dark:glow-turquoise",
          className
        )}
      >
        <Sun className="h-6 w-6 animate-pulse dark:text-yellow-200" />
        <span className="sr-only">Consult Ra - Sun God of LeadFlow</span>
      </Button>

      <BotChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
