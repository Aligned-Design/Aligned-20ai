import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const buttonVariants = (
  props?: {
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
  } | null,
) => {
  const { variant = "default", size = "default" } = props || {};

  const baseStyles =
    "inline-flex items-center justify-center rounded-3xl text-sm font-semibold transform-gpu transition-transform duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-lime)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background shadow-sm hover:scale-[1.02]";

  const variantStyles: Record<string, string> = {
    default:
      "bg-[var(--accent-lime)] text-[var(--indigo-deep)] hover:brightness-105",
    destructive: "bg-red-600 text-white hover:brightness-95",
    outline: "border border-black/10 text-[var(--text-main)] hover:bg-black/5",
    secondary:
      "bg-transparent border border-black/10 text-[var(--text-main)] hover:bg-black/5",
    ghost: "bg-transparent hover:bg-black/5",
    link: "underline-offset-4 hover:underline text-[var(--accent-lime)]",
  };

  const sizeStyles: Record<string, string> = {
    default: "h-12 px-6",
    sm: "h-10 px-4",
    lg: "h-14 px-8",
    icon: "h-10 w-10",
  };

  return cn(
    baseStyles,
    variantStyles[variant] || variantStyles.default,
    sizeStyles[size] || sizeStyles.default,
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
