/**
 * ActivityFeedCard Component
 * 
 * Timeline list for activity/events across dashboards.
 * Consistent UI for showing recent actions, notifications, etc.
 */

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Clock } from "lucide-react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  iconColor?: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedCardProps {
  title: string;
  description?: string;
  items: ActivityItem[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  onRetry?: () => void;
  onItemClick?: (item: ActivityItem) => void;
  className?: string;
  maxItems?: number;
}

export function ActivityFeedCard({
  title,
  description,
  items,
  isLoading,
  error,
  emptyMessage = "No recent activity",
  onRetry,
  onItemClick,
  className,
  maxItems = 10,
}: ActivityFeedCardProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton variant="text" count={5} />
        ) : error ? (
          <ErrorState
            title="Activity Error"
            message={error.message || "Failed to load activity feed"}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Clock} title={emptyMessage} />
        ) : (
          <div className="space-y-4">
            {displayItems.map((item, index) => {
              const ItemIcon = item.icon || Clock;
              const isLast = index === displayItems.length - 1;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative pl-8 pb-4",
                    !isLast && "border-l-2 border-slate-200 dark:border-slate-700",
                    onItemClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-2 -ml-2 transition-colors"
                  )}
                  onClick={() => onItemClick?.(item)}
                  role={onItemClick ? "button" : undefined}
                  tabIndex={onItemClick ? 0 : undefined}
                >
                  {/* Timeline dot/icon */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 w-6 h-6 rounded-full",
                      "flex items-center justify-center",
                      "bg-white dark:bg-slate-900",
                      "border-2 border-slate-200 dark:border-slate-700",
                      "-translate-x-[13px]"
                    )}
                  >
                    <ItemIcon 
                      className={cn(
                        "w-3 h-3",
                        item.iconColor || "text-slate-500"
                      )} 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-[var(--font-size-body-sm)] font-[var(--font-weight-medium)] text-[var(--color-foreground)] mb-0.5">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[var(--font-size-body-sm)] text-[var(--color-muted)]">
                        {item.description}
                      </p>
                    )}
                    <time className="text-[var(--font-size-body-sm)] text-[var(--color-subtle)] mt-1 block">
                      {item.timestamp}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
