/**
 * ErrorState Component
 *
 * Consistent error state UI across all dashboards.
 * Shows error icon, message, and retry/support actions.
 */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again or contact support if the problem persists.",
  onRetry,
  onSupport,
  className,
  children,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "p-[var(--spacing-4xl)] text-center",
        "min-h-[320px]",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
      </div>

      <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--color-foreground)] mb-2">
        {title}
      </h3>

      <p className="text-[var(--font-size-body)] text-[var(--color-muted)] max-w-md mb-6">
        {message}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {onSupport && (
          <Button onClick={onSupport} variant="outline">
            <HelpCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        )}
      </div>

      {children}
    </div>
  );
}
