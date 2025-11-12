/**
 * SegmentedControl Component
 * 
 * Period selector for dashboards: Day / Week / Month / Custom
 * Consistent UI pattern across all dashboard views.
 */

import { cn } from "@/lib/utils";

export type PeriodOption = "day" | "week" | "month" | "custom";

interface SegmentedControlProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
  options?: Array<{ value: PeriodOption; label: string }>;
  className?: string;
}

const DEFAULT_OPTIONS: Array<{ value: PeriodOption; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

export function SegmentedControl({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center",
        "bg-slate-100 dark:bg-slate-800",
        "rounded-lg p-1",
        "gap-1",
        className
      )}
      role="tablist"
      aria-label="Time period selector"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 rounded-md",
            "text-[var(--font-size-body-sm)] font-[var(--font-weight-medium)]",
            "transition-all duration-[var(--animation-duration-quick)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
            value === option.value
              ? "bg-white dark:bg-slate-700 text-[var(--color-foreground)] shadow-sm"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          )}
          role="tab"
          aria-selected={value === option.value}
          aria-controls={`panel-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
