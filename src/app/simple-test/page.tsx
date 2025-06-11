"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function SimpleTest() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Simple Date Picker Test</h1>
      
      <div className="p-6 border border-border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Test 1: Popover Date Picker</h2>
        <div className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  console.log('Popover date selected:', selectedDate);
                  setDate(selectedDate);
                }}
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          
          {date && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm font-medium">Selected: {format(date, "PPP")}</p>
              <p className="text-xs text-muted-foreground">Timestamp: {date.toISOString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Test 2: Direct Calendar</h2>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            console.log('Direct calendar date selected:', selectedDate);
            setDate(selectedDate);
          }}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          className="rounded-md border"
        />
      </div>

      <div className="p-6 border border-border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current Date:</strong> {new Date().toISOString()}</p>
          <p><strong>Selected Date:</strong> {date ? date.toISOString() : 'None'}</p>
          <p><strong>Today (for comparison):</strong> {new Date().toDateString()}</p>
        </div>
      </div>
    </div>
  );
}
