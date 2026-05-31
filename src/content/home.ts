/**
 * Homepage editorial content.
 * Until Payload CMS is wired (Phase 3), this is the source of truth.
 * Image paths point at files under /public/gallery and /public/assets.
 */

export const heroSlides = [
  {
    src: "/assets/Gemini_Generated_Image_luxfwqluxfwqluxf.png",
    alt: "Terrasse der Bodega Bühlot bei goldenem Abendlicht – Gäste, Tapas und warme Stimmung.",
  },
  {
    src: "/assets/ChatGPT Image 31. Mai 2026, 14_43_22.png",
    alt: "Außenterrasse der Bodega bei Sonnenuntergang – leere Tische und mediterrane Atmosphäre.",
  },
  {
    src: "/gallery/img_4985-ts1587294575.webp",
    alt: "Tapas, Wein und Kerzenlicht auf rustikalem Holz.",
  },
  {
    src: "/gallery/img_4900-ts1587294716.webp",
    alt: "Glas Rotwein, eingerahmt von warmem Abendlicht.",
  },
  {
    src: "/gallery/img_4470-ts1587294713.webp",
    alt: "Spanische Tapas-Komposition aus der Bodega.",
  },
  {
    src: "/gallery/img_4884-ts1587294714.webp",
    alt: "Hände, Brot, Gespräche - mediterraner Abend.",
  },
  {
    src: "/gallery/img_4962-ts1587294718.webp",
    alt: "Detail vom Tisch der Bodega.",
  },
] as const;

export const hero = {
  eyebrow: "Bodega Bühlot · seit 2009",
  headline: ["Mediterrane Nächte.", "Heiße Tapas.", "Gute Gespräche."],
  sub: "Tapas, Wein und lange Abende an der Bühlot.",
  primary: { href: "/reservierung", label: "Tisch reservieren" },
  secondary: { href: "/speisekarte", label: "Speisekarte ansehen" },
} as const;

export const atmosphere = {
  eyebrow: "Atmosphäre",
  headline: "Ein Abend, der vergisst, wie spät es geworden ist.",
  body: [
    "Bienvenidos. Schön, dass du den Weg zu uns gefunden hast. Wir nehmen dich mit auf einen Kurzurlaub in den Süden – ein kulinarischer Streifzug durch das Land der Sonne und der Lebensfreude.",
    "Dunkles Holz, spanische Fliesen, warmer Lichthauch. Drinnen riecht es nach Knoblauch und gerösteten Mandeln, draußen rauscht die Bühlot. Die Bodega ist kein Restaurant, das man schnell besucht. Sie ist ein Abend, den man bewohnt.",
  ],
  image: "/gallery/IMG_4468 quer-ts1589329326.webp",
  imageAlt: "Innenraum der Bodega Bühlot bei Kerzenlicht.",
} as const;

export const signatureFood = {
  eyebrow: "Signature Food",
  headline: "Authentische Tapas. Mit Sorgfalt und Liebe gemacht.",
  intro:
    "Unsere Tapas entstehen aus hochwertigen Zutaten und bestechen durch Einfachheit – ohne Kompromisse im Geschmack. Vieles direkt aus Spanien importiert, vieles aus der Region, alles von Hand zubereitet.",
  dishes: [
    {
      name: "Patatas Bravas",
      tag: "Klassiker",
      desc: "Knusprige Kartoffeln, hausgemachte Brava-Sauce, Aioli mit gerösteten Knoblauch.",
    },
    {
      name: "Gambas al Ajillo",
      tag: "Heiß",
      desc: "Garnelen in Olivenöl, Knoblauch, Peperoncino, Petersilie. Mit Brot zum Tunken.",
    },
    {
      name: "Pimientos de Padrón",
      tag: "Vegan",
      desc: "Gebratene Padrón-Paprika mit Meersalz. Manche schärfer als gedacht – das gehört dazu.",
    },
    {
      name: "Croquetas de Jamón",
      tag: "Hausgemacht",
      desc: "Cremige Croquetas mit Serrano-Schinken, in goldener Panade.",
    },
  ],
} as const;

export const wineCocktails = {
  eyebrow: "Wein & Cocktails",
  headline: "Aus den großen spanischen Anbaugebieten – und ein paar Klassikern.",
  body: "Wir servieren bemerkenswerte Weine kleinerer Bodegas aus bekannten Regionen wie Rioja, Ribera del Duero und Priorat. Dazu sortenreine Sherrys, ehrliche Sangrias und Cocktails ohne Show – aber mit Charakter.",
  image: "/assets/drink-1.jpeg",
  imageAlt: "Glas Rotwein vor warmem Hintergrund.",
  picks: [
    { label: "Rioja", value: "Tempranillo, 5 Jahre, Eichenfass." },
    { label: "Sherry Manzanilla", value: "Salzig, blass, perfekt zu Oliven." },
    { label: "Negroni della Casa", value: "Bitter. Trocken. Ohne Eile." },
  ],
} as const;

export const eventNights = {
  eyebrow: "Event Nights",
  headline: "Live-Musik, Wine Tastings, lange Abende.",
  body: "Einmal im Monat verwandelt sich die Bodega in eine kleine Bühne. Jazz, Latin, Flamenco, Wein. Plätze sind begrenzt – Reservierung empfohlen.",
  events: [
    {
      date: "31.05.2026",
      title: "Voices & Ivories",
      desc: "Swing, Rock und Blues live im MusikSommer.",
    },
    {
      date: "21.06.2026",
      title: "Clave de Sol",
      desc: "Lateinamerikanische Klänge, Sommer-Vibe.",
    },
    {
      date: "19.07.2026",
      title: "Lilia Jones Special",
      desc: "Kubanischer Abend im Buena-Vista-Style.",
    },
  ],
} as const;

export const gallery = [
  { src: "/gallery/img_4985-ts1587294575.webp", alt: "Tapas Komposition", span: "tall" },
  { src: "/gallery/img_4470-ts1587294713.webp", alt: "Spanische Vielfalt", span: "wide" },
  { src: "/gallery/img_4900-ts1587294716.webp", alt: "Wein bei Kerzenlicht", span: "small" },
  { src: "/gallery/img_4884-ts1587294714.webp", alt: "Tisch mit Tapas", span: "small" },
  { src: "/gallery/IMG_4468 quer-ts1589329326.webp", alt: "Innenraum", span: "wide" },
  { src: "/gallery/img_4469-ts1587294711.webp", alt: "Terrasse an der Bühlot", span: "tall" },
  { src: "/gallery/img_4962-ts1587294718.webp", alt: "Detail vom Tisch", span: "small" },
  { src: "/gallery/img_4981-ts1587294720.webp", alt: "Tapas Variation", span: "small" },
  { src: "/gallery/IMG_4614.webp", alt: "Atmosphäre der Bodega", span: "wide" },
  { src: "/assets/drink-2.jpeg", alt: "Cocktail-Detail", span: "tall" },
  { src: "/assets/glasses-1.jpeg", alt: "Gläser bereit für den Abend", span: "small" },
  { src: "/assets/outdoors-1.jpeg", alt: "Außenbereich", span: "wide" },
] as const;

export const finalCta = {
  eyebrow: "Reservierung",
  headline: "Wir reservieren dir den Abend.",
  body: "Wähle einen Tisch, eine Uhrzeit, eine Stimmung. Den Rest übernehmen wir – inklusive Bestätigung und Erinnerung.",
  primary: { href: "/reservierung", label: "Tisch reservieren" },
  secondary: { href: "/kontakt", label: "Gruppe ab 9 Personen" },
} as const;
