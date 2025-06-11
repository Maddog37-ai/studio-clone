"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function TestDatePicker() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Date Picker Test</h1>
      
      <div className="max-w-md">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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
                console.log('Date selected:', selectedDate);
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
          <p className="mt-4 text-sm">
            Selected date: {format(date, "PPP")}
          </p>
        )}
      </div>
      
      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-2">Direct Calendar (No Popover)</h2>
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
    </div>
  );
}
