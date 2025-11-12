/**
 * FilterBar Component
 * 
 * Consistent filter controls for dashboards.
 * Handles platform, status, tags, and custom filters.
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface ActiveFilter {
  type: string;
  value: string;
  label: string;
}

interface FilterBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  children?: ReactNode;
  className?: string;
}

export function FilterBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  children,
  className,
}: FilterBarProps) {
  const hasFilters = activeFilters.length > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        "min-h-[var(--spacing-xl)]",
        className
      )}
      role="region"
      aria-label="Active filters"
    >
      {/* Filter controls (dropdowns, etc.) */}
      {children}
      
      {/* Active filter chips */}
      {hasFilters && (
        <>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          
          {activeFilters.map((filter) => (
            <button
              key={`${filter.type}-${filter.value}`}
              onClick={() => onRemoveFilter(filter)}
              className={cn(
                "inline-flex items-center gap-1.5",
                "px-3 py-1.5 rounded-full",
                "bg-purple-100 dark:bg-purple-900/20",
                "text-purple-700 dark:text-purple-300",
                "text-[var(--font-size-body-sm)] font-[var(--font-weight-medium)]",
                "hover:bg-purple-200 dark:hover:bg-purple-900/30",
                "transition-colors duration-[var(--animation-duration-quick)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              )}
              aria-label={`Remove ${filter.label} filter`}
            >
              {filter.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-[var(--font-size-body-sm)] h-8"
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
}
