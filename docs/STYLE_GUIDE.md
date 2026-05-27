# Bodega Bloom — Style Guide

Internal codename **Bloom** is the design system powering the public Bodega
Bühlot site and the Bloom OS hospitality dashboard. It targets one cohesive,
cinematic look — dark mediterranean editorial — and forbids alternate themes.

> Single source of truth: [`src/app/globals.css`](../src/app/globals.css).
> Never hard-code brand hex in components — always use the CSS variables or the
> Tailwind utilities they generate.

## Brand palette

| Token            | Hex       | Use |
|------------------|-----------|-----|
| `--bloom-red`     | `#6F1D1B` | Primary brand, accents on dark surfaces |
| `--bloom-wine`    | `#4A1312` | Dark surface tint, emphasis blocks |
| `--bloom-ochre`   | `#8B7A3D` | CTAs, eyebrows, focus rings |
| `--bloom-olive`   | `#6F7356` | Secondary accents, status confirmed |
| `--bloom-sand`    | `#D8C7AA` | Body text on dark surfaces |
| `--bloom-cream`   | `#F3EEE6` | Headings, paper / inverted surfaces |
| `--bloom-charcoal`| `#161616` | Main background |
| `--bloom-ink`     | `#0D0A08` | Deepest background |

## Three-tier elevation

Every interactive element follows the elevation triad:

1. `--surface-bg` — page/section background (charcoal/ink).
2. `--surface-card` — raised content (cards, inputs, sidebar).
3. `--surface-hover` — hover/active state.

This is the manifest's "dreifache Kontrastlogik" — it makes clickable elements
read instantly even on dark UI.

## Typography

- **Display**: Cormorant Garamond — `--font-display`. Headlines, eyebrows in
  brand voice. **Never bold** — regular (400) only.
- **Sans**: Inter — `--font-sans`. Everything else.
- Body copy max width = `--measure` = `65ch`.

## Motion

- Easing: `--ease-bloom` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Durations: `--duration-fast` 180ms, `--duration-base` 260ms, `--duration-slow` 520ms.
- Allowed motion: fade, soft `translateY`, parallax minimal, cinematic crossfade.
- Forbidden: bounce, hard zooms, spinners on idle, neon, aggressive hover.
- Honour `prefers-reduced-motion: reduce` (already globally enforced).

## Pattern background

`/public/assets/seamless-pattern.png` is loaded as a fixed body underlay at
`opacity: var(--pattern-opacity)` (`0.04`) with `mix-blend-mode: soft-light`.
Never increase opacity — readability comes first.

## Components

| Primitive | File | Notes |
|---|---|---|
| `Button`    | [`src/components/ui/Button.tsx`](../src/components/ui/Button.tsx) | `cva` variants: `primary`, `secondary`, `wine`, `ghost`, `link` |
| `Card`      | [`src/components/ui/Card.tsx`](../src/components/ui/Card.tsx) | 24px radius, hover lift |
| `Section`   | [`src/components/ui/Section.tsx`](../src/components/ui/Section.tsx) | `tone` + `spacing` variants, optional `shell` wrapper |
| `Eyebrow`   | from `Section.tsx` | Small uppercase label with leading rule |
| `SiteHeader`| [`src/components/site/SiteHeader.tsx`](../src/components/site/SiteHeader.tsx) | Floating, transparent over hero, blur on scroll |
| `MobileNav` | [`src/components/site/MobileNav.tsx`](../src/components/site/MobileNav.tsx) | Fullscreen overlay with blurred backdrop, 48px+ targets |
| `SiteFooter`| [`src/components/site/SiteFooter.tsx`](../src/components/site/SiteFooter.tsx) | Atmospheric, wine-label feel |

## Contrast & accessibility

- All clickable elements have a visible focus ring (`var(--border-focus)` =
  Bloom Ochre) at 2px outline, 3px offset.
- Touch targets ≥ 48px on mobile (header burger 44, mobile nav links 48).
- Text colors on dark surfaces:
  - `--bloom-cream` on `--surface-bg` ≈ 14:1 (AAA)
  - `--bloom-sand` on `--surface-card` ≈ 9:1 (AAA for body)
  - `--text-muted` (sand 55%) — only for hint/meta text, never primary copy.

## Rules for new CSS

1. Prefer Tailwind utilities (`bg-surface-card`, `text-bloom-cream`,
   `rounded-[var(--radius-card)]`) over raw classes; they're already wired to
   the tokens via `@theme inline` in `globals.css`.
2. Use `color-mix(in srgb, …)` for hovers/overlays — survives palette tweaks.
3. Spacing/radii/shadows always come from tokens.
4. Don't introduce new global colors. If you need a new accent, add it to
   `globals.css` as a token first, then mirror it under `@theme inline`.
