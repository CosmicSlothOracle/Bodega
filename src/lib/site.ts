/**
 * Single source of truth for public-facing brand strings.
 * The legal/public name stays "Bodega Bühlot"; "Bloom" is internal codename.
 */

export const site = {
  name: "Bodega Bühlot",
  shortName: "Bodega",
  tagline: "Mediterrane Nächte. Heiße Tapas. Gute Gespräche.",
  url: "https://bodega-buehlot.de",
  locale: "de_DE",
  language: "de",
  description:
    "Bodega Bühlot — mediterrane Tapas, ausgewählte Weine und cineastische Abende in Bühl.",

  contact: {
    email: "reservierung@bodega-buehlot.de",
    phone: "+49 7223 9949321",
    phoneDisplay: "07223 / 99 49 321",
    address: {
      street: "Hüfflischer Hof 13",
      zip: "77815",
      city: "Bühl",
      country: "Deutschland",
    },
  },

  hours: [
    { label: "Dienstag – Samstag", value: "ab 17:30 Uhr" },
    { label: "Sonntag & Montag", value: "Ruhetag" },
  ],

  socials: [
    { label: "Instagram", href: "https://www.instagram.com/bodegabuehlot/" },
    { label: "Facebook", href: "https://www.facebook.com/BodegaBuehlot1/" },
  ],

  owner: "Leandra Ehinger",
} as const;

export const nav = {
  primary: [
    { href: "/", label: "Home" },
    { href: "/speisekarte", label: "Speisekarte" },
    { href: "/getraenkekarte", label: "Getränkekarte" },
    { href: "/events", label: "Events" },
    { href: "/galerie", label: "Galerie" },
    { href: "/ueber-uns", label: "Über uns" },
  ],
  secondary: [
    { href: "/to-go", label: "To Go" },
    { href: "/kontakt", label: "Kontakt" },
  ],
  cta: { href: "/reservierung", label: "Tisch reservieren" },
} as const;
