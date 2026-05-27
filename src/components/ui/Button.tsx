"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-btn)] font-sans text-sm uppercase tracking-[0.14em]",
    "transition-all duration-[var(--duration-base)] ease-[var(--ease-bloom)]",
    "focus-visible:outline-2 focus-visible:outline-bloom-ochre focus-visible:outline-offset-3",
    "disabled:opacity-50 disabled:cursor-not-allowed select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-bloom-red text-bloom-cream hover:bg-bloom-cream hover:text-bloom-ink shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--bloom-red)_70%,transparent)]",
        secondary:
          "bg-transparent text-text-primary border border-border-strong hover:bg-surface-hover hover:border-bloom-sand/50",
        ghost:
          "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-card",
        wine:
          "bg-bloom-wine text-bloom-cream hover:bg-bloom-red shadow-[0_10px_30px_-14px_color-mix(in_srgb,var(--bloom-red)_60%,transparent)]",
        link: "text-bloom-ochre hover:text-bloom-cream underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-[0.95rem]",
        xl: "h-16 px-10 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
