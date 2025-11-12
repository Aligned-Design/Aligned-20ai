/**
 * KpiCard Component
 *
 * Standard KPI/metric card showing value, delta, trend sparkline.
 * Used across all dashboards for consistent metric visualization.
 */

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: LucideIcon;
  sparkline?: number[]; // Simple array of values for trend
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  sparkline,
  description,
  className,
  children,
}: KpiCardProps) {
  const TrendIcon = delta
    ? delta.trend === "up"
      ? TrendingUp
      : delta.trend === "down"
        ? TrendingDown
        : Minus
    : null;

  const trendColor =
    delta?.trend === "up"
      ? "text-green-600 dark:text-green-500"
      : delta?.trend === "down"
        ? "text-red-600 dark:text-red-500"
        : "text-slate-500";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[var(--font-size-body-sm)] font-[var(--font-weight-medium)] text-[var(--color-muted)]">
          {title}
        </CardTitle>
        {Icon && (
          <Icon
            className="w-4 h-4 text-[var(--color-muted)]"
            aria-hidden="true"
          />
        )}
      </CardHeader>

      <CardContent>
        {/* Main value */}
        <div className="text-[var(--font-size-h2)] font-[var(--font-weight-bold)] text-[var(--color-foreground)] mb-1">
          {value}
        </div>

        {/* Delta/Change */}
        {delta && TrendIcon && (
          <div className="flex items-center gap-1 text-[var(--font-size-body-sm)]">
            <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
            <span
              className={cn("font-[var(--font-weight-medium)]", trendColor)}
            >
              {delta.value > 0 ? "+" : ""}
              {delta.value}%
            </span>
            {delta.label && (
              <span className="text-[var(--color-muted)]">{delta.label}</span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-[var(--font-size-body-sm)] text-[var(--color-muted)] mt-2">
            {description}
          </p>
        )}

        {/* Sparkline placeholder */}
        {sparkline && sparkline.length > 0 && (
          <div
            className="mt-4 h-12 flex items-end gap-0.5"
            aria-label="Trend sparkline"
          >
            {sparkline.map((val, i) => {
              const max = Math.max(...sparkline);
              const height = (val / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-purple-200 dark:bg-purple-900/30 rounded-t-sm transition-all"
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
