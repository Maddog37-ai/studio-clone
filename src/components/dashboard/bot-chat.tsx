"use client";

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { leadflowBotFunction } from "@/lib/firebase";
import { Send, Loader2, User, Sun, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface BotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BotChat({ isOpen, onClose }: BotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Greetings, ${user.displayName || 'mortal'}! ☀️ I am Ra, the Sun God and guardian of your LeadFlow realm. My divine wisdom shall guide you through lead management, illuminate best practices, and navigate the sacred paths of your system. What knowledge do you seek from the eternal light?`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !user?.teamId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await leadflowBotFunction({
        message: userMessage.content,
        conversationId,
        teamId: user.teamId,
      });

      // Type the response data
      const responseData = result.data as { response: string; conversationId: string };

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseData.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Store conversation ID for context
      if (responseData.conversationId && !conversationId) {
        setConversationId(responseData.conversationId);
      }

    } catch {
      // Bot error handling - skip console log
      toast({
        title: "Bot Error",
        description: "Failed to get response from LeadFlow Assistant. Please try again.",
        variant: "destructive",
      });

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "The divine light flickers momentarily... Even gods must rest. Please seek my wisdom again shortly, mortal.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    // Re-add welcome message
    if (user) {
      const welcomeMessage: Message = {
        id: 'welcome-new',
        content: `The sacred scrolls are cleared! ☀️ I am Ra, ready to bestow my divine guidance upon your LeadFlow journey once more. What wisdom do you seek, ${user.displayName || 'devoted one'}?`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-200 dark:border-turquoise/30 dark:card-glass dark:glow-turquoise">
        <DialogHeader className="px-6 py-4 border-b border-amber-200 dark:border-turquoise/20 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-800/50 dark:to-slate-700/50">
          <DialogTitle className="flex items-center gap-2 text-amber-900 dark:text-turquoise">
            <div className="relative">
              <Sun className="h-6 w-6 text-amber-600 dark:text-turquoise animate-pulse" />
              <Crown className="h-3 w-3 text-amber-700 dark:text-cyan absolute -top-1 -right-1" />
            </div>
            Ra - Sun God of LeadFlow
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 dark:from-turquoise/20 dark:to-cyan/30 flex items-center justify-center flex-shrink-0 border-2 border-amber-300 dark:border-turquoise/50 shadow-lg dark:glow-turquoise">
                      <Sun className="h-4 w-4 text-amber-700 dark:text-turquoise" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                      message.isBot
                        ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-800/70 dark:to-slate-700/70 text-amber-900 dark:text-gray-200 border border-amber-200 dark:border-turquoise/20 shadow-md dark:glow-turquoise"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-cyan/80 dark:to-turquoise/80 text-white dark:text-slate-900 shadow-md dark:glow-cyan"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={cn(
                        "text-xs mt-1 opacity-70",
                        message.isBot ? "text-amber-600 dark:text-gray-400" : "text-blue-100 dark:text-slate-700"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-cyan/80 flex items-center justify-center flex-shrink-0 dark:glow-cyan">
                      <User className="h-4 w-4 text-white dark:text-slate-900" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 dark:from-turquoise/20 dark:to-cyan/30 flex items-center justify-center flex-shrink-0 border-2 border-amber-300 dark:border-turquoise/50 shadow-lg dark:glow-turquoise">
                    <Sun className="h-4 w-4 text-amber-700 dark:text-turquoise animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-800/70 dark:to-slate-700/70 rounded-lg px-3 py-2 border border-amber-200 dark:border-turquoise/20 dark:glow-turquoise">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-gray-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs italic">Ra contemplates...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-amber-200 dark:border-turquoise/20 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800/50 dark:to-slate-700/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Speak your query to the Sun God..."
                disabled={isLoading}
                className="flex-1 border-amber-200 dark:border-turquoise/30 focus:border-amber-400 dark:focus:border-turquoise focus:ring-amber-200 dark:focus:ring-turquoise/20 dark:bg-slate-800/50 dark:text-gray-200"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-turquoise/80 dark:to-cyan/80 dark:hover:from-turquoise dark:hover:to-cyan border-0 shadow-lg dark:glow-cyan dark:text-slate-900"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {messages.length > 1 && (
              <div className="flex justify-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChat}
                  className="text-xs text-amber-600 dark:text-turquoise/80 hover:text-amber-800 dark:hover:text-turquoise hover:bg-amber-100 dark:hover:bg-turquoise/10"
                >
                  Clear Sacred Scrolls
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
