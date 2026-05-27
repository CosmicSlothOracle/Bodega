import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/speisekarte", changeFrequency: "monthly", priority: 0.9 },
  { path: "/events", changeFrequency: "weekly", priority: 0.85 },
  { path: "/galerie", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ueber-uns", changeFrequency: "monthly", priority: 0.7 },
  { path: "/reservierung", changeFrequency: "weekly", priority: 0.95 },
  { path: "/to-go", changeFrequency: "monthly", priority: 0.7 },
  { path: "/kontakt", changeFrequency: "monthly", priority: 0.8 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.3 },
  { path: "/datenschutz", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
