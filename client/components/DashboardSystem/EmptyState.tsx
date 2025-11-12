/**
 * EmptyState Component
 * 
 * Consistent empty state UI across all dashboards.
 * Shows icon, headline, description, and optional CTA.
 */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "p-[var(--spacing-4xl)] text-center",
        "min-h-[320px]",
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      
      <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--color-foreground)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-[var(--font-size-body)] text-[var(--color-muted)] max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}
