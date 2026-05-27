"use client";

import { useEffect } from "react";

/**
 * Lenis is dynamic-imported so its bundle never lands in the public layout's
 * entry chunk — keeps Turbopack's first compile light enough not to OOM Node
 * on Windows dev boxes.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || isTouch) return;

    let cancelled = false;
    let rafId = 0;
    let destroy: (() => void) | null = null;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.2,
        lerp: 0.1,
        wheelMultiplier: 0.8,
      });

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      destroy = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      destroy?.();
    };
  }, []);

  return null;
}
