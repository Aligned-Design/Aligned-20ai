/**
 * TableCard Component
 *
 * Sortable/paginated table shell for dashboards.
 * Provides consistent table UI with loading and error states.
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
import { LucideIcon } from "lucide-react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

interface TableCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function TableCard({
  title,
  description,
  icon: Icon,
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No data available",
  onRetry,
  actions,
  className,
  children,
}: TableCardProps) {
  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-muted)]" />}
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
        {actions}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : error ? (
          <ErrorState
            title="Table Error"
            message={error.message || "Failed to load table data"}
            onRetry={onRetry}
          />
        ) : isEmpty ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <div className="relative w-full overflow-auto">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
