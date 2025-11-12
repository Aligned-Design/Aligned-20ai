import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button Component
 * 
 * Consumes design tokens for colors, spacing, and sizing.
 * All colors and dimensions come from tokens; no ad-hoc hex codes or px values.
 * 
 * Usage:
 * <Button variant="default">Click me</Button>
 * <Button variant="ghost" size="sm">Small ghost button</Button>
 */

const buttonVariants = cva(
  /* Base styles - all use tokens */
  cn(
    "inline-flex items-center justify-center gap-[var(--spacing-sm)] whitespace-nowrap",
    "font-[var(--font-weight-semibold)] text-[var(--font-size-body)]",
    "transition-all duration-[var(--animation-duration-quick)]",
    "rounded-[var(--radius-lg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
  ),
  {
    variants: {
      variant: {
        /* Primary - brand color */
        default: cn(
          "bg-[var(--color-primary)] text-white",
          "hover:bg-[var(--color-primary-light)] hover:shadow-[var(--shadow-md)]",
          "active:scale-95",
          "dark:hover:bg-[var(--color-primary-lighter)]"
        ),
        
        /* Destructive/Error */
        destructive: cn(
          "bg-[var(--color-error)] text-white",
          "hover:bg-[var(--color-red-700)] hover:shadow-[var(--shadow-md)]",
          "active:scale-95"
        ),
        
        /* Outline - bordered secondary */
        outline: cn(
          "border border-[var(--color-border)] bg-white text-[var(--color-foreground)]",
          "hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]",
          "active:scale-95",
          "dark:bg-[var(--color-dark-surface)] dark:text-[var(--color-dark-foreground)] dark:border-[var(--color-slate-600)]"
        ),
        
        /* Secondary - light background */
        secondary: cn(
          "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
          "hover:bg-[var(--color-primary)]/20 hover:shadow-[var(--shadow-sm)]",
          "active:scale-95",
          "dark:bg-[var(--color-primary)]/20 dark:hover:bg-[var(--color-primary)]/30"
        ),
        
        /* Ghost - transparent background */
        ghost: cn(
          "text-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
          "active:scale-95",
          "dark:hover:bg-[var(--color-dark-surface)]"
        ),
        
        /* Link - underlined text */
        link: cn(
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
          "active:scale-95"
        ),
        
        /* Success */
        success: cn(
          "bg-[var(--color-success)] text-white",
          "hover:bg-[var(--color-green-700)] hover:shadow-[var(--shadow-md)]",
          "active:scale-95"
        ),
        
        /* Warning */
        warning: cn(
          "bg-[var(--color-warning)] text-white",
          "hover:bg-[var(--color-amber-700)] hover:shadow-[var(--shadow-md)]",
          "active:scale-95"
        ),
      },
      size: {
        /* Default size */
        default: cn(
          "h-[var(--spacing-xl)] px-[var(--spacing-md)] py-[var(--spacing-sm)]"
        ),
        
        /* Small size */
        sm: cn(
          "h-9 px-[var(--spacing-sm)] py-[var(--spacing-xs)]",
          "rounded-[var(--radius-md)]",
          "text-[var(--font-size-body-sm)]"
        ),
        
        /* Large size */
        lg: cn(
          "h-11 px-[var(--spacing-lg)] py-[var(--spacing-md)]",
          "rounded-[var(--radius-xl)]"
        ),
        
        /* Icon button */
        icon: cn(
          "h-[var(--spacing-xl)] w-[var(--spacing-xl)]"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
