"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ambienceCopy, ambienceSlides } from "@/content/reservation-ambience";
import { cn } from "@/lib/utils";

const SLIDE_MS = 9000;
/** Spanish visible before crossfade to German. */
const QUOTE_ES_MS = 4800;
const QUOTE_CROSSFADE_MS = 1800;
/** German line visible before next item. */
const QUOTE_DE_MS = 6000;
const FACT_MS = 9000;

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

export function AmbienceAside({ className }: { className?: string }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [langPhase, setLangPhase] = useState<"es" | "de">("es");

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  const currentSlide = ambienceSlides[slideIndex % ambienceSlides.length];
  const copyItem = ambienceCopy[quoteIndex % ambienceCopy.length];

  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % ambienceSlides.length);
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    if (copyItem.kind === "fact") {
      const t = setTimeout(
        () => setQuoteIndex((i) => (i + 1) % ambienceCopy.length),
        FACT_MS,
      );
      return () => clearTimeout(t);
    }

    // Drive the quote crossfade state machine: ES → DE → next quote.
    // The intentional synchronous set here resets the phase whenever a new
    // quote-kind copyItem arrives; the alternative (deriving phase from
    // copyItem via useMemo) would lose the timer-driven transitions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangPhase("es");
    const toDe = setTimeout(() => setLangPhase("de"), QUOTE_ES_MS);
    const toNext = setTimeout(
      () => setQuoteIndex((i) => (i + 1) % ambienceCopy.length),
      QUOTE_ES_MS + QUOTE_CROSSFADE_MS + QUOTE_DE_MS,
    );
    return () => {
      clearTimeout(toDe);
      clearTimeout(toNext);
    };
  }, [copyItem, quoteIndex, reduceMotion]);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-full max-w-[420px] shrink-0",
        className,
      )}
      aria-label="Stimmung und Lektüre zur Reservierung"
    >
      <div className="relative w-full h-[620px] rounded-[var(--radius-card)] border border-border-soft overflow-hidden bg-surface-card">
        {/* Slides */}
        <AnimatePresence mode="sync">
          <motion.div
            key={reduceMotion ? ambienceSlides[0].src : currentSlide.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 2.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={reduceMotion ? ambienceSlides[0].src : currentSlide.src}
              alt={reduceMotion ? ambienceSlides[0].alt : currentSlide.alt}
              fill
              sizes="420px"
              className="object-cover"
              priority={false}
            />
          </motion.div>
        </AnimatePresence>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bloom-ink via-bloom-ink/55 to-bloom-ink/20 pointer-events-none"
        />

        {/* Copy overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-6 sm:p-7",
            "flex flex-col gap-3 text-left",
          )}
        >
          <span className="text-[0.65rem] uppercase tracking-[0.28em] text-bloom-ochre/90">
            {copyItem.kind === "fact" ? "Wussten Sie schon?" : "Zitat"}
          </span>

          {copyItem.kind === "fact" ? (
            <p className="font-display text-lg sm:text-xl text-bloom-cream leading-snug text-pretty">
              {copyItem.text}
            </p>
          ) : reduceMotion ? (
            <p className="font-display text-lg sm:text-xl text-bloom-cream leading-snug text-pretty">
              {copyItem.german}
            </p>
          ) : (
            <div className="relative min-h-[4.75rem] sm:min-h-[5.25rem]">
              <motion.p
                aria-hidden={langPhase === "de"}
                className="absolute inset-x-0 top-0 font-display text-lg sm:text-xl text-bloom-cream leading-snug text-pretty"
                animate={{
                  opacity: langPhase === "es" ? 1 : 0,
                  y: langPhase === "es" ? 0 : -4,
                }}
                transition={{
                  duration: QUOTE_CROSSFADE_MS / 1000,
                  ease: "easeInOut",
                }}
              >
                „{copyItem.spanish}“
              </motion.p>
              <motion.p
                aria-hidden={langPhase === "es"}
                className="absolute inset-x-0 top-0 font-display text-lg sm:text-xl text-bloom-cream leading-snug text-pretty"
                animate={{
                  opacity: langPhase === "de" ? 1 : 0,
                  y: langPhase === "de" ? 0 : 4,
                }}
                transition={{
                  duration: QUOTE_CROSSFADE_MS / 1000,
                  ease: "easeInOut",
                }}
              >
                „{copyItem.german}“
              </motion.p>
            </div>
          )}

          {copyItem.kind === "quote" && copyItem.author ? (
            <motion.p
              className="text-xs text-text-muted pt-1 border-t border-border-soft/60"
              initial={false}
              animate={{
                opacity: reduceMotion || langPhase === "de" ? 1 : 0,
              }}
              transition={{ duration: QUOTE_CROSSFADE_MS / 1000 }}
            >
              — {copyItem.author}
            </motion.p>
          ) : null}
        </div>

        {/* Slide ticks (decorative) */}
        {!reduceMotion ? (
          <div
            className="absolute top-4 right-4 z-10 flex flex-col gap-1.5"
            aria-hidden
          >
            {ambienceSlides.map((_, i) => (
              <span
                key={i}
                className="h-8 w-px transition-colors duration-700"
                style={{
                  background:
                    i === slideIndex % ambienceSlides.length
                      ? "var(--bloom-ochre)"
                      : "var(--border-soft)",
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
