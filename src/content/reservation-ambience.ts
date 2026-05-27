/**
 * Editorial ambience for /reservierung — slideshow + rotating copy.
 * Images live under /public (gallery + assets from home.ts).
 */

export const ambienceSlides = [
  { src: "/gallery/img_4985-ts1587294575.webp", alt: "Tapas, Wein und Kerzenlicht." },
  { src: "/gallery/img_4470-ts1587294713.webp", alt: "Spanische Tapas-Komposition." },
  { src: "/assets/drink-1.jpeg", alt: "Glas Rotwein, warmes Licht." },
  { src: "/gallery/img_4900-ts1587294716.webp", alt: "Wein bei Kerzenlicht." },
  { src: "/gallery/IMG_4468 quer-ts1589329326.webp", alt: "Innenraum der Bodega." },
  { src: "/gallery/img_4469-ts1587294711.webp", alt: "Terrasse an der Bühlot." },
  { src: "/assets/glasses-2.jpeg", alt: "Gläser für den Abend." },
  { src: "/gallery/img_4884-ts1587294714.webp", alt: "Tisch mit Tapas." },
] as const;

export type AmbienceCopy =
  | {
      kind: "quote";
      /** Original Spanish (shown first, then crossfades to German). */
      spanish: string;
      german: string;
      author?: string;
    }
  | {
      kind: "fact";
      /** German-only „Wussten Sie schon“. */
      text: string;
    };

export const ambienceCopy: AmbienceCopy[] = [
  {
    kind: "quote",
    spanish: "No hay mejor salsa en el mundo que el hambre.",
    german: "Es gibt keine bessere Würze in der Welt als den Hunger.",
    author: "Miguel de Cervantes, Don Quijote",
  },
  {
    kind: "quote",
    spanish: "Comer y rascar, todo es empezar.",
    german: "Essen und sich kratzen — alles ist ein Anfang.",
    author: "Spanisches Sprichwort",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? Das Wort „Tapas“ leitet sich von tapar ab — Wein mit einem Stück Brot „abdecken“, damit keine Fliegen hineinkamen.",
  },
  {
    kind: "quote",
    spanish: "Si no hay pan, hay tortillas.",
    german: "Wenn kein Brot da ist, gibt es Tortillas.",
    author: "Federico García Lorca",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? ¡Unos pican y otros no! — bei Pimientos de Padrón ist etwa jede zehnte Schote feurig scharf. Galicisches Roulette.",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? Tempranillo heißt „die Frühe“ — die Traube reift früh und prägt Rioja und Ribera del Duero wie bei uns an der Karte.",
  },
  {
    kind: "quote",
    spanish: "La inspiración existe, pero tiene que encontrarte trabajando.",
    german: "Inspiration gibt es — aber sie muss dich bei der Arbeit finden.",
    author: "Pablo Picasso",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? „Sobremesa“ ist das Sitzenbleiben am Tisch nach dem Essen — Gespräch, Wein, keine Eile.",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? Spanien hat die weltweit größte Rebfläche — mehr Weinland als Frankreich oder Italien.",
  },
  {
    kind: "fact",
    text:
      "Wussten Sie schon? Brandy de Jerez reift im Solera-System — bis zu viele Jahrgänge in einem Glas, wie bei Cardenal Mendoza.",
  },
];
