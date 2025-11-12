/**
 * DashboardShell Component
 *
 * Main container for all dashboards.
 * Provides consistent 12-column grid, header, and responsive layout.
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./DashboardHeader";
import { PeriodOption } from "./SegmentedControl";
import { LayoutTokens, DashboardVariant } from "./LayoutTokens";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  period?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  brandSelector?: ReactNode;
  filterBar?: ReactNode;
  headerActions?: ReactNode;
  variant?: DashboardVariant;
  className?: string;
  children: ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  period,
  onPeriodChange,
  brandSelector,
  filterBar,
  headerActions,
  variant = "standard",
  className,
  children,
}: DashboardShellProps) {
  return (
    <div
      className={cn("min-h-screen bg-slate-50 dark:bg-slate-950", className)}
    >
      {/* Header */}
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        period={period}
        onPeriodChange={onPeriodChange}
        brandSelector={brandSelector}
        filterBar={filterBar}
        actions={headerActions}
      />

      {/* Main Content Grid */}
      <main
        className={cn(
          "p-6",
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          // Read-only variant styling
          variant === "read-only" && "pointer-events-none opacity-90",
          // Demo variant styling
          variant === "demo" && "relative",
        )}
        role="main"
      >
        {children}

        {/* Demo watermark */}
        {variant === "demo" && (
          <div className="fixed bottom-4 right-4 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
            Demo Mode
          </div>
        )}
      </main>
    </div>
  );
}
