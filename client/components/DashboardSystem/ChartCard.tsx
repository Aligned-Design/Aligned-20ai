/**
 * ChartCard Component
 *
 * Wrapper for charts (line/area/bar) across all dashboards.
 * Provides consistent header, loading, and error states.
 */

import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  isLoading,
  error,
  onRetry,
  actions,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("col-span-full lg:col-span-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-muted)]" />}
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>

        {actions || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">More options</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoadingSkeleton variant="chart" />
        ) : error ? (
          <ErrorState
            title="Chart Error"
            message={error.message || "Failed to load chart data"}
            onRetry={onRetry}
          />
        ) : (
          <div className="h-[280px]" role="img" aria-label={`${title} chart`}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
