"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import TeamChat from "./team-chat";

export default function TeamChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Team Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="hidden sm:flex"
      >
        <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden md:inline">Team Chat</span>
        <span className="md:hidden">Chat</span>
      </Button>
      
      {/* Mobile version */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="sm:hidden"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      {/* Team Chat Component */}
      <TeamChat 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
