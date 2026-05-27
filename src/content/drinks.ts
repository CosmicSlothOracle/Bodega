export type DrinkPrice = {
  volume?: string;
  price: number;
};

export type DrinkItem = {
  name: string;
  desc?: string;
  prices: DrinkPrice[];
};

export type DrinkCategory = {
  id: string;
  title: string;
  subtitle?: string;
  items: DrinkItem[];
};

export const drinksMenu: DrinkCategory[] = [
  {
    id: "espirituosas",
    title: "Espírituosas",
    subtitle: "Hochprozentiges",
    items: [
      { name: "Brandy Cardenal Mendoza", prices: [{ volume: "2 cl", price: 5.00 }] },
      { name: "Absolut Vodka", prices: [{ volume: "2 cl", price: 3.50 }] },
      { name: "Gordon's Dry Gin", prices: [{ volume: "2 cl", price: 3.50 }] },
      { name: "Ramazzotti", prices: [{ volume: "4 cl", price: 4.50 }] },
      { name: "Túnel Hierbas dulces (20%)²", prices: [{ volume: "2 cl", price: 3.00 }] },
      { name: "Túnel Hierbas secas (40%)²", prices: [{ volume: "2 cl", price: 3.00 }] },
      { name: "Havana Club Añejo 3", prices: [{ volume: "2 cl", price: 3.50 }] },
      { name: "Licor 43²", prices: [{ volume: "2 cl", price: 3.50 }] },
      { name: "Sandeman Sherry", prices: [{ volume: "2 cl", price: 3.50 }] },
    ]
  },
  {
    id: "longdrinks",
    title: "Longdrinks",
    items: [
      { name: "Bodega Fizz", desc: "Gin | St. Germain | Zitronensaft | Soda | Rohrzuckersirup", prices: [{ price: 8.50 }] },
      { name: "Cuba Libre", desc: "Rum | Cola | Limette", prices: [{ price: 8.50 }] },
      { name: "Gin Tonic", desc: "Gin | Tonic Water | Limette", prices: [{ price: 8.50 }] },
      { name: "Campari Orange", desc: "Campari | Orangensaft", prices: [{ price: 8.00 }] },
      { name: "Crodino Orange", desc: "Crodino | alkoholfrei", prices: [{ price: 6.50 }] },
      { name: "Caipirinha", desc: "Cachaça | Limette | Rohrzucker", prices: [{ price: 8.50 }] },
    ]
  },
  {
    id: "aperitif",
    title: "Aperitif",
    subtitle: "Spritz & leichte Eröffner",
    items: [
      { name: "Bodega Sommerschorle", desc: "Rosé | süßer Sprudel | Limettensirup | Minze | Limette", prices: [{ price: 6.90 }] },
      { name: "Aperol Spritz", desc: "Aperol | Prosecco | Soda | Orange", prices: [{ price: 6.90 }] },
      { name: "Campari Spritz", desc: "Campari | Prosecco | Soda | Orange", prices: [{ price: 6.90 }] },
      { name: "Limoncello Spritz", desc: "Limoncello | Prosecco | Soda | Zitrone", prices: [{ price: 6.90 }] },
      { name: "Hugo", desc: "Prosecco | Holunder | Soda | Minze | Limette", prices: [{ price: 6.90 }] },
      { name: "French Hugo", desc: "St. Germain | Sekt | Soda | Limette", prices: [{ price: 6.90 }] },
      { name: "Bodega Spritz", desc: "Ingwersirup | Sekt | Zitrone", prices: [{ price: 6.90 }] },
      { name: "Sangria", desc: "Rotwein | Frucht | Spritz", prices: [{ volume: "0,3", price: 5.90 }, { volume: "0,5", price: 7.90 }] },
    ]
  },
  {
    id: "bebidas_calientes",
    title: "Bebidas Calientes",
    subtitle: "Warme Getränke",
    items: [
      { name: "Kaffee¹¹", prices: [{ price: 2.90 }] },
      { name: "Espresso¹¹", prices: [{ price: 2.60 }] },
      { name: "Espresso doble¹¹", prices: [{ price: 3.50 }] },
      { name: "Cortado", desc: "Espresso mit Milch¹¹", prices: [{ price: 3.30 }] },
      { name: "Carajillo", desc: "Espresso mit Brandy¹¹", prices: [{ price: 5.50 }] },
      { name: "Café Bombón", desc: "Espresso mit Kondensmilch¹¹", prices: [{ price: 3.90 }] },
      { name: "Café con leche", desc: "Milchkaffee¹¹", prices: [{ price: 4.00 }] },
      { name: "Latte Macchiato¹¹", prices: [{ price: 4.00 }] },
      { name: "Cappuccino¹¹", prices: [{ price: 4.00 }] },
      { name: "Tee", desc: "versch. Sorten", prices: [{ price: 3.00 }] },
    ]
  },
  {
    id: "refrescos",
    title: "Refrescos",
    subtitle: "Alkoholfreie Getränke",
    items: [
      { name: "Teinacher Gourmet Mineralwasser", desc: "Classic | Medium | Naturell", prices: [{ volume: "0,25 l", price: 3.20 }, { volume: "0,5 l", price: 4.50 }] },
      { name: "Paulaner Limo | Cola", prices: [{ volume: "0,33 l", price: 3.90 }] },
      { name: "Hausgemachte Holunderblütenlimo", prices: [{ volume: "0,33 l", price: 4.90 }] },
      { name: "Hausgemachte Ingwerlimo", prices: [{ volume: "0,33 l", price: 4.90 }] },
      { name: "Teinacher Genuss Limonade", desc: "Zitrone | Mango-Maracuja-Orange | Orange-Mandarine | Johannisbeer-Holunder", prices: [{ volume: "0,33 l", price: 4.00 }] },
      { 
        name: "Cola | Cola Zero | Fanta", 
        prices: [
          { volume: "0,2 l", price: 3.20 }, 
          { volume: "0,4 l", price: 4.50 }
        ] 
      },
      { name: "Schweppes Tonic Water¹⁰", prices: [{ volume: "0,2 l", price: 3.50 }] },
      { name: "Schweppes Ginger Ale²", prices: [{ volume: "0,2 l", price: 3.50 }] },
      { name: "Schweppes Bitter Lemon³,¹⁰", prices: [{ volume: "0,2 l", price: 3.50 }] },
      { name: "Fruchtsaft", desc: "Apfel naturtrüb | Orange | Rhabarber | Johannisbeere", prices: [{ volume: "0,2 l", price: 2.90 }, { volume: "0,4 l", price: 3.90 }] },
      { name: "Fruchtsaftschorle", desc: "Apfel naturtrüb | Orange | Rhabarber | Johannisbeere", prices: [{ volume: "0,2 l", price: 3.50 }, { volume: "0,4 l", price: 4.50 }] },
    ]
  },
  {
    id: "cava_y_mas",
    title: "Cava y Mas",
    subtitle: "Sekt & Mehr",
    items: [
      { name: "Tinto de Verano", prices: [{ volume: "0,25 l", price: 6.90 }, { volume: "0,5 l", price: 8.00 }] },
      { name: "Weinschorle sauer", prices: [{ volume: "0,2 l", price: 4.00 }] },
      { name: "Weinschorle süß | rot | rot süß", prices: [{ volume: "0,2 l", price: 4.50 }] },
      { name: "Cava REXACH BAQUÉS Brut Impérial Reserva", prices: [{ volume: "0,1 l", price: 6.90 }] },
    ]
  },
  {
    id: "cerveza_de_barril",
    title: "Cerveza de Barril",
    subtitle: "Biere vom Fass",
    items: [
      { name: "Fürstenberg Pils", prices: [{ volume: "0,3 l", price: 3.80 }, { volume: "0,5 l", price: 4.90 }] },
      { name: "Radler süß | sauer", prices: [{ volume: "0,3 l", price: 3.60 }, { volume: "0,5 l", price: 4.70 }] },
      { name: "Paulaner Hefe-Weißbier", prices: [{ volume: "0,3 l", price: 3.80 }, { volume: "0,5 l", price: 4.90 }] },
      { name: "Chiemseer Hell", prices: [{ volume: "0,3 l", price: 3.80 }, { volume: "0,5 l", price: 4.90 }] },
    ]
  },
  {
    id: "cerveza_embotellada",
    title: "Cerveza Embotellada",
    subtitle: "Flaschenbiere",
    items: [
      { name: "San Miguel", prices: [{ volume: "0,33 l", price: 4.50 }] },
      { name: "Fürstenberg alkoholfrei", prices: [{ volume: "0,33 l", price: 3.70 }] },
      { name: "Paulaner Hefe alkoholfrei", prices: [{ volume: "0,5 l", price: 4.70 }] },
      { name: "Hoepfner Kräusen", prices: [{ volume: "0,5 l", price: 4.90 }] },
    ]
  },
  {
    id: "vinos_blancos",
    title: "Vinos Blancos",
    subtitle: "Weissweine",
    items: [
      { name: "D.O. Almansa — SANTA CRUZ Verdejo", desc: "Pampelmuse, grüne Früchte, duftig", prices: [{ volume: "0,2 l", price: 6.90 }] },
      { name: "Affentaler Winzer — Monkey Mountain", desc: "Riesling & Weissburgunder & Sauvignon Blanc vereint", prices: [{ volume: "0,2 l", price: 6.90 }] },
      { name: "Affentaler Winzer — Rivaner feinherb", desc: "Filigraner Charakter, erfrischender Geschmack", prices: [{ volume: "0,2 l", price: 6.50 }] },
      { name: "Ramirez de la Piscina Blanco — Chardonnay, Malvasia, Viura", desc: "strohgelb; Birne, Pfirsichkern, Zitrus, weiße Blüten; trocken und strukturiert, kernige Zitrus und Kernobst, Nuancen von Honig und Fenchel; frischer Abgang, florale Länge.", prices: [{ volume: "0,2 l", price: 7.90 }] },
      { name: "D.O.Ca Rioja — BODEGAS PALACIO Nivarius 2023", desc: "100 % Tempranillo blanco. Fruchtige Aromen nach Litchi und Birne, sehr frisch mit eleganter Säure", prices: [{ volume: "0,75 l", price: 30.00 }] },
    ]
  },
  {
    id: "vinos_rosados",
    title: "Vinos Rosados",
    subtitle: "Roséweine",
    items: [
      { name: "D.O. Almansa — SANTA CRUZ Syrah Rosado", desc: "Erdbeerbonbon, süffig, trocken", prices: [{ volume: "0,2 l", price: 6.90 }] },
      { name: "Affentaler Winzer — Monkey Mountain", desc: "Merlot & Cabernet Dorsa vereint zu einer perfekten Weinkomposition", prices: [{ volume: "0,2 l", price: 6.90 }] },
      { name: "Ramirez de la Piscina Rosado — Viura, Garnacha", desc: "hellrosa mit Veilchenreflexen; frische rote Beeren, Gras, Erdbeere und Kräuter; leicht, gut eingebundene Säure, süffig-trocken — typischer Rioja-Rosé zum Aperitif.", prices: [{ volume: "0,2 l", price: 7.90 }] },
    ]
  },
  {
    id: "vinos_tintos",
    title: "Vinos Tintos",
    subtitle: "Rotweine",
    items: [
      { name: "D.O. Almansa — SANTA CRUZ Garnacha Tintorera Roble", desc: "Schwarze Beeren, Schokolade, Kakao", prices: [{ volume: "0,2 l", price: 5.90 }] },
      { name: "D.O.Ca Rioja — COVILA Crianza 12 meses", desc: "Weich, geschmeidig, süffig", prices: [{ volume: "0,2 l", price: 7.50 }] },
      { name: "PAGO Arínzano — Hacienda de Arínzano Tinto 14 meses", desc: "Dunkle Waldbeeren, cremig, elegant", prices: [{ volume: "0,2 l", price: 7.90 }] },
      { name: "Affentaler Winzer — Monkey Mountain", desc: "Merlot & Regent vereint zu einer perfekten Weinkomposition", prices: [{ volume: "0,2 l", price: 7.90 }] },
      { name: "D.O.Ca Rioja — LEZA GARCIA Reserva 2019", desc: "Die Reserva für den Rioja Liebhaber", prices: [{ volume: "0,75 l", price: 30.00 }] },
      { name: "D.O.Ca Rioja — OSTATU Escobal bio 2021", desc: "Fruchtig, fleischig, frisch", prices: [{ volume: "0,75 l", price: 32.00 }] },
      { name: "D.O.Ca Rioja — OSTATU Gloria 2018", desc: "Top Rioja der Spitzenklasse", prices: [{ volume: "0,75 l", price: 69.00 }] },
      { name: "D.O. Ribera del Duero — RAÍZ DE GUZMÁN Crianza 2021", desc: "100 % Tempranillo, 12–14 Monate in Eiche. Schwarze und rote Beeren, fleischig elegant, zarte Note von Veilchen", prices: [{ volume: "0,75 l", price: 39.00 }] },
      { name: "D.O. Ribera del Duero — PAGO DE INA Selección 2018", desc: "Frische, rote Frucht, elegant, lang", prices: [{ volume: "0,75 l", price: 44.00 }] },
      { name: "D.O. Ribera del Duero — PAGO DE INA Vendimia Seleccionada 2012", desc: "Schwarze Johannisbeere, Rosinen, Kaffee, Schokolade", prices: [{ volume: "0,75 l", price: 59.00 }] },
      { name: "D.O. Campo de Borja — BODEGAS MORCA Godina 2021", desc: "100 % Garnacha fina. Rote und dunkle Früchte, dicht und fleischig, kraftvoll, würzig", prices: [{ volume: "0,75 l", price: 47.00 }] },
    ]
  }
];
