/**
 * LoadingSkeleton Component
 *
 * Shimmer placeholder for loading states across all dashboards.
 * Provides consistent loading experience and reduces layout shift.
 */

import { cn } from "@/lib/utils";
import { LayoutTokens, CardHeight } from "./LayoutTokens";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "avatar" | "chart" | "table";
  count?: number;
  height?: CardHeight;
  className?: string;
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  height = "md",
  className,
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex gap-2", className)}>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Header row */}
        <div className="flex gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1 animate-pulse"
            />
          ))}
        </div>
        {/* Data rows */}
        {skeletons.map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1 animate-pulse"
                style={{ animationDelay: `${i * 100 + col * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default: Card skeleton
  return (
    <div
      className={cn(
        "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {skeletons.map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] dark:border-slate-600 bg-white dark:bg-slate-800 p-6 relative overflow-hidden"
          style={{ height: `${LayoutTokens.cardHeights[height]}px` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-slate-700/20 to-transparent" />

          {/* Content placeholders */}
          <div className="space-y-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// CSS for shimmer animation (add to global.css or include inline)
// @keyframes shimmer {
//   100% {
//     transform: translateX(100%);
//   }
// }
