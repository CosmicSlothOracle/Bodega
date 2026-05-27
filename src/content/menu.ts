export type MenuItem = {
  name: string;
  desc?: string;
  price: number;
  vegan?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
  allergens?: string[];
};

export type MenuSection = {
  id: string;
  title: string;
  intro?: string;
  items: MenuItem[];
};

/** Speisekarte (nur Speisen) — abgestimmt mit speisekarte-arbeitskopie.txt */
export const menu: MenuSection[] = [
  {
    id: "tapas_frias",
    title: "Tapas frías · Kalte Tapas",
    intro: "Kalt, frisch, mediterran.",
    items: [
      { name: "Pan con Alioli", desc: "Knuspriges Baguette mit hausgemachter Aioli.", price: 4.5, vegan: true },
      { name: "Pan con Tomate", desc: "Geröstetes Brot mit frischen Tomaten und Olivenöl.", price: 5.5, vegan: true },
      { name: "Almendras Fritas", desc: "Geröstete und gesalzene Mandeln.", price: 5.5, vegan: true },
      { name: "Aceitunas Aliñadas", desc: "Mediterran marinierte Oliven.", price: 3.9, vegan: true },
      { name: "Alcachofas", desc: "Artischockenherzen in aromatischem Knoblauchöl mariniert.", price: 6.5, vegan: true },
      { name: "Jamón Serrano", desc: "Luftgetrockneter spanischer Serrano-Schinken.", price: 7.9 },
      { name: "Jamón Ibérico Bellota", desc: "Eichelgefütterter Ibérico-Schinken vom schwarzen Ibérico-Schwein.", price: 8.9 },
      { name: "Chorizo Ibérico Bellota", desc: "Würzige Ibérico-Chorizo vom schwarzen Ibérico-Schwein.", price: 8.9 },
      { name: "Queso Manchego", desc: "Spanischer Manchego aus der Region La Mancha.", price: 7.5, vegetarian: true },
      { name: "OLMEDA Tres Leches Semicurado", desc: "Würziger Käse aus Ziegen-, Kuh- und Schafsmilch.", price: 6.9, vegetarian: true },
    ],
  },
  {
    id: "tapas_calientes",
    title: "Tapas calientes · Warme Tapas",
    intro: "Frisch aus der Küche, zum Teilen.",
    items: [
      { name: "Patatas Bravas", desc: "Knusprig gebratene Kartoffelwürfel mit würziger Salsa Brava.", price: 7.9, vegetarian: true, spicy: true },
      { name: "Papas Arrugadas", desc: "Kanarische Runzelkartoffeln mit Mojo-Saucen.", price: 6.9, vegan: true },
      { name: "Tortilla", desc: "Spanisches Kartoffelomelett.", price: 6.5, vegetarian: true },
      { name: "Champiñones al Ajillo", desc: "Champignons in Knoblauchöl geschwenkt.", price: 6.9, vegan: true },
      { name: "Pimientos de Padrón", desc: "Gebratene Padrón-Paprika mit Meersalz.", price: 5.9, vegan: true },
      { name: "Dátiles", desc: "Datteln im knusprigen Speckmantel.", price: 5.9 },
      { name: "Verduras Mediterráneas", desc: "Mediterran gebratenes Gemüse.", price: 6.9, vegan: true },
      { name: "Gambas al Ajillo", desc: "Garnelen in aromatischem Knoblauchöl.", price: 7.9 },
      { name: "Gambas en Nido de Patata", desc: "Garnelen im knusprigen Kartoffelmantel.", price: 8.9 },
      { name: "Boquerones Fritos", desc: "Knusprig gebratene Sardellen.", price: 7.9 },
      { name: "Rabas de Calamar", desc: "Gebackene Tintenfischstreifen.", price: 7.9 },
      { name: "Chipirones", desc: "Zarte Mini-Tintenfische, gebraten.", price: 7.9 },
      { name: "Croquetas de Espinaca", desc: "Drei Croquetas mit Spinat und Ziegenfrischkäsefüllung.", price: 6.5 },
      { name: "Croquetas de Pollo", desc: "Drei Croquetas mit Hähnchenfüllung.", price: 6.5 },
      { name: "Croquetas de Sobrasada", desc: "Drei Croquetas mit Sobrasada und Mahón-Käse-Füllung.", price: 6.5 },
      { name: "Albóndigas", desc: "Spanische Rindfleischbällchen in würziger Sauce.", price: 7.5 },
      { name: "Pinchos Morunos de Pollo", desc: "Marinierte Hähnchenspieße nach spanischer Art.", price: 7.5 },
      { name: "Chorizo al Jerez", desc: "Gebratene Chorizo in Sherry.", price: 7.9 },
      { name: "Carne en Salsa", desc: "Spanisches Rindergulasch in kräftiger Sauce.", price: 7.9 },
      { name: "Queso de Cabra con Miel", desc: "Gratinierter Ziegenfrischkäse mit Honig und karamellisiertem braunem Zucker.", price: 7.9, vegetarian: true },
    ],
  },
  {
    id: "ensaladas",
    title: "Ensaladas · Frische Salate",
    intro: "Leicht und saisonal gewürzt.",
    items: [
      { name: "Ensalada de Acompañamiento", desc: "Kleiner gemischter Salat der Saison.", price: 7.5 },
      { name: "Ensalada Ibérico", desc: "Gemischter Salat mit Serrano-Schinken und Manchego.", price: 16.9 },
      { name: "Ensalada La Gomera", desc: "Gemischter Salat mit gratiniertem Ziegenfrischkäse.", price: 15.9, vegetarian: true },
    ],
  },
  {
    id: "platos_de_tapas",
    title: "Platos de Tapas · Tapas-Platten",
    intro: "Zum Vorstellen und Teilen am Tisch.",
    items: [
      {
        name: "Plato Ibérico",
        desc: "Kalte Tapas-Platte mit Manchego, Serrano-Schinken, Ibérico-Chorizo und marinierten Oliven.",
        price: 15.9,
      },
      {
        name: "Plato de Queso",
        desc: "Spanische Käseauswahl mit Manchego, Tres Leches, Ziegenfrischkäse, Quittengelee und Apfel-Karamell-Salsa.",
        price: 15.9,
      },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    intro: "Süße spanische Abschläge.",
    items: [
      { name: "Crema Catalana", desc: "Hausgemachte Crema Catalana mit knuspriger Karamellkruste.", price: 6.5 },
      { name: "Tarta Santiago", desc: "Traditioneller Mandelkuchen aus Santiago de Compostela.", price: 6.5 },
      { name: "Tarta Santiago con Helado", desc: "Mandelkuchen aus Santiago de Compostela mit Vanilleeis.", price: 7.9 },
      { name: "Schokotörtchen", desc: "Warmes Schokotörtchen mit Vanilleeis und Sahne.", price: 7.9 },
    ],
  },
];
