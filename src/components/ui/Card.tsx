import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-[var(--radius-card)]",
      "bg-surface-card border border-border-soft",
      "transition-all duration-[var(--duration-base)] ease-[var(--ease-bloom)]",
      "hover:bg-surface-hover hover:border-border-strong",
      "hover:shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--bloom-red)_45%,transparent)]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 sm:p-8", className)} {...props} />
));
CardBody.displayName = "CardBody";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-2xl text-bloom-cream", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardEyebrow = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-block text-[0.7rem] uppercase tracking-[0.28em] text-bloom-ochre/90 mb-3",
      className,
    )}
    {...props}
  />
));
CardEyebrow.displayName = "CardEyebrow";
