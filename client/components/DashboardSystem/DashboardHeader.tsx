/**
 * DashboardHeader Component
 *
 * Standard header for all dashboards.
 * Anatomy: Title → Period Picker → Brand Switcher → Filter Bar
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SegmentedControl, PeriodOption } from "./SegmentedControl";
import { LayoutTokens } from "./LayoutTokens";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  period?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  brandSelector?: ReactNode;
  filterBar?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  period,
  onPeriodChange,
  brandSelector,
  filterBar,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-[var(--color-border)] dark:border-slate-700",
        "bg-white dark:bg-slate-900",
        className,
      )}
    >
      {/* Top row: Title + Period + Brand + Actions */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4"
        style={{ minHeight: `${LayoutTokens.header.height}px` }}
      >
        {/* Left: Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--color-foreground)] tracking-[var(--letter-spacing-tight)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Picker */}
          {period && onPeriodChange && (
            <SegmentedControl value={period} onChange={onPeriodChange} />
          )}

          {/* Brand Switcher */}
          {brandSelector}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Bottom row: Filters (if present) */}
      {filterBar && <div className="px-6 pb-4">{filterBar}</div>}
    </div>
  );
}
