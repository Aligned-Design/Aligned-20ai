/**
 * PeriodPicker Component
 * 
 * Enhanced period selector with custom date range support.
 * Used across dashboards for consistent time filtering.
 */

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PeriodOption } from "@/components/DashboardSystem";
import { cn } from "@/lib/utils";

interface PeriodPickerProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
  dateRange?: {
    start: Date;
    end: Date;
  };
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
}

export function PeriodPicker({
  value,
  onChange,
  dateRange,
  onDateRangeChange,
  className,
}: PeriodPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const periodLabels: Record<PeriodOption, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    custom: "Custom Range",
  };

  const handlePeriodClick = (period: PeriodOption) => {
    onChange(period);
    if (period !== "custom") {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {periodLabels[value]}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-2">
          {Object.entries(periodLabels).map(([period, label]) => (
            <Button
              key={period}
              variant={value === period ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handlePeriodClick(period as PeriodOption)}
            >
              {label}
            </Button>
          ))}
          
          {/* Custom date range picker would go here */}
          {value === "custom" && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-muted-foreground mb-2">
                Custom date range picker
              </p>
              {/* TODO: Add actual date range picker */}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
