"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { hero, heroSlides } from "@/content/home";
import { Button } from "@/components/ui/Button";

const SLIDE_MS = 10000;

function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CinematicHero() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [reduceMotion]);

  const current = heroSlides[index];

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Slide stack with crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 3.5, ease: "easeInOut" },
            scale: { duration: SLIDE_MS / 1000 + 1, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette gradients for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bloom-ink via-bloom-ink/40 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bloom-ink/85 via-bloom-ink/30 to-transparent"
      />

      {/* Hero copy — bottom-left per manifest §9 */}
      <div className="absolute inset-0 z-10 flex items-end">
        <div className="shell pb-20 sm:pb-28 lg:pb-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-block text-[0.72rem] uppercase tracking-[0.32em] text-bloom-ochre/95 mb-6">
              {hero.eyebrow}
            </span>
            <h1 className="font-display text-bloom-cream text-balance">
              {hero.headline.map((line, i) => (
                <span
                  key={i}
                  className="block"
                  style={{ opacity: 1 - i * 0.06 }}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-xl">
              {hero.sub}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href={hero.primary.href}>{hero.primary.label}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={hero.secondary.href}>{hero.secondary.label}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide indicator strip (decorative, no clickable arrows per §8) */}
      <div className="absolute bottom-6 right-6 z-10 hidden md:flex gap-2">
        {heroSlides.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="h-px w-10 transition-all duration-700"
            style={{
              background: i === index ? "var(--bloom-ochre)" : "var(--border-soft)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
