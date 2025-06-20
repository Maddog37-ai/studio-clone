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
        className="hidden sm:flex hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
      >
        <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
        <span className="hidden md:inline text-green-600 dark:text-green-400 font-medium">Team Chat</span>
        <span className="md:hidden text-green-600 dark:text-green-400 font-medium">Chat</span>
      </Button>
      
      {/* Mobile version */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="sm:hidden hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
      >
        <MessageCircle className="h-4 w-4 text-green-500" />
      </Button>

      {/* Team Chat Component */}
      <TeamChat 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
