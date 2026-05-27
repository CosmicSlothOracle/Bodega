import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  shell?: boolean;
  tone?: "default" | "wine" | "ink" | "cream";
  spacing?: "sm" | "md" | "lg" | "xl";
}

const toneClass: Record<NonNullable<SectionProps["tone"]>, string> = {
  default: "",
  wine: "bg-[color-mix(in_srgb,var(--bloom-wine)_18%,var(--bloom-charcoal))]",
  ink: "bg-bloom-ink",
  cream: "bg-bloom-cream text-bloom-ink",
};

const spacingClass: Record<NonNullable<SectionProps["spacing"]>, string> = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-24 sm:py-32",
  xl: "py-32 sm:py-44",
};

export function Section({
  as = "section",
  shell = true,
  tone = "default",
  spacing = "lg",
  className,
  children,
  ...props
}: SectionProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cn(
        "relative w-full",
        toneClass[tone],
        spacingClass[spacing],
        className,
      )}
      {...props}
    >
      {shell ? <div className="shell">{children}</div> : children}
    </Tag>
  );
}

export function Eyebrow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.32em] text-bloom-ochre/90",
        "before:block before:h-px before:w-10 before:bg-bloom-ochre/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
