"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { nav, site } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { LogoSymbol } from "./LogoSymbol";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[90] flex flex-col"
          aria-modal="true"
          role="dialog"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-bloom-ink/92 backdrop-blur-2xl"
          />

          <div className="relative flex flex-col h-full px-6 py-8 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-bloom-cream">
                <LogoSymbol className="w-8 h-8 text-bloom-red" />
                <div className="flex flex-col">
                  <span className="font-display text-2xl tracking-wide leading-none mt-1">
                    {site.name}
                  </span>
                  <span className="font-sans text-[0.65rem] text-bloom-red tracking-widest uppercase mt-1">
                    tapas y mas
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Menü schließen"
                className="h-12 w-12 inline-flex items-center justify-center text-bloom-cream rounded-full border border-border-soft hover:border-border-strong transition"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M4 4L18 18M18 4L4 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center gap-6 py-12">
              {nav.primary.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="font-display text-4xl sm:text-5xl text-bloom-cream hover:text-bloom-red transition-colors block py-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-6 border-t border-border-soft mt-4 flex flex-col gap-2">
                {nav.secondary.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="text-base uppercase tracking-[0.2em] text-text-secondary hover:text-bloom-red py-3 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="space-y-4">
              <Button asChild variant="primary" size="xl" className="w-full">
                <Link href={nav.cta.href} onClick={onClose}>
                  {nav.cta.label}
                </Link>
              </Button>
              <p className="text-xs text-text-muted text-center">
                {site.contact.address.street} · {site.contact.address.zip}{" "}
                {site.contact.address.city}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
