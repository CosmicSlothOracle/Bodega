"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "./MobileNav";
import { LogoSymbol } from "./LogoSymbol";

interface SiteHeaderProps {
  /** Header is transparent over the hero on routes flagged as cinematic. */
  transparentOnTop?: boolean;
}

function subscribeScroll(cb: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
function getScrolled() {
  if (typeof window === "undefined") return false;
  return window.scrollY > 24;
}

export function SiteHeader({ transparentOnTop = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, () => false);
  const [open, setOpen] = useState(false);
  const previousPathRef = useRef(pathname);

  // Close the menu only when navigation actually happens. Synchronising UI to
  // a routing event is exactly what an effect is for; the strict React 19 rule
  // is suppressed locally with reason.
  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      if (open) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing UI to route change
        setOpen(false);
      }
    }
  }, [pathname, open]);

  const showSolid = !transparentOnTop || scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50",
          "transition-all duration-[var(--duration-base)] ease-[var(--ease-bloom)]",
          showSolid
            ? "bg-bloom-ink/72 backdrop-blur-xl border-b border-border-soft"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="shell flex items-center justify-between h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-3 text-bloom-cream"
            aria-label={`${ site.name } – Startseite`}
          >
            <LogoSymbol className="w-8 h-8 text-bloom-red" />
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl tracking-wide leading-none mt-1">
                {site.name}
              </span>
              <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-bloom-red tracking-widest uppercase mt-1">
                tapas y mas
              </span>
            </div>
          </Link>

          <nav
            aria-label="Hauptnavigation"
            className="hidden lg:flex items-center gap-8"
          >
            {nav.primary.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm uppercase tracking-[0.18em] text-text-secondary",
                    "transition-colors hover:text-bloom-cream",
                    "after:absolute after:left-0 after:-bottom-2 after:h-px after:bg-bloom-red",
                    "after:transition-all after:duration-[var(--duration-base)] after:ease-[var(--ease-bloom)]",
                    active ? "text-bloom-cream after:w-full" : "after:w-0 hover:after:w-6",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href={nav.cta.href}>{nav.cta.label}</Link>
            </Button>

            <button
              onClick={() => setOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={open}
              className="lg:hidden h-11 w-11 inline-flex items-center justify-center rounded-full border border-border-soft text-bloom-cream"
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <path
                  d="M1 1h18M1 7h18M1 13h12"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
