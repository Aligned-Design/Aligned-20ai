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
    "inline-flex items-center justify-center rounded-3xl text-sm font-semibold transform transition-all duration-180 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9F06A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background shadow-sm hover:-translate-y-0.5";

  const variantStyles: Record<string, string> = {
    default: "bg-[#C9F06A] text-black hover:shadow-lg",
    destructive: "bg-red-600 text-white hover:shadow-lg",
    outline: "border border-white/30 text-white hover:bg-white/8",
    secondary: "bg-white/6 text-white hover:bg-white/10",
    ghost: "bg-transparent hover:bg-white/6",
    link: "underline-offset-4 hover:underline text-[#C9F06A]",
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
