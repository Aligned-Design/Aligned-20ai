import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input Component
 *
 * Form input field that consumes design tokens for:
 * - Height (--spacing-xl / 40px)
 * - Border radius (--radius-md)
 * - Padding (--spacing-sm)
 * - Border color (--color-border)
 * - Focus ring (--color-primary)
 * - Font size (--font-size-body)
 *
 * Usage:
 * <Input type="text" placeholder="Enter text..." />
 * <Input type="email" disabled />
 */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full",
          "h-[var(--spacing-xl)] rounded-[var(--radius-md)]",
          "border border-[var(--color-border)] bg-[var(--color-surface)]",
          "px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
          "text-[var(--font-size-body)] text-[var(--color-foreground)]",
          "placeholder:text-[var(--color-muted)]",
          "ring-offset-[var(--color-surface)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-gray-100)]",
          "transition-colors duration-[var(--animation-duration-quick)]",
          "file:border-0 file:bg-transparent file:text-[var(--font-size-body-sm)] file:font-[var(--font-weight-semibold)] file:text-[var(--color-foreground)]",
          "dark:bg-[var(--color-dark-surface)] dark:text-[var(--color-dark-foreground)] dark:placeholder:text-[var(--color-slate-400)] dark:border-[var(--color-slate-600)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
