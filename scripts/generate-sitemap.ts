// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

import { SUBSIDIECHECK_LIVE } from "../src/config/features";

const BASE_URL = "https://voortraject.nl";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  // De subsidiecheck valt uit de sitemap zolang hij nog niet live is (de pagina
  // staat dan op noindex) — zie src/config/features.ts.
  ...(SUBSIDIECHECK_LIVE
    ? [{ path: "/subsidiecheck", changefreq: "weekly", priority: "0.9" } as SitemapEntry]
    : []),
  { path: "/partners", changefreq: "monthly", priority: "0.9" },

  { path: "/verduurzamen/isolatie", changefreq: "monthly", priority: "0.8" },
  { path: "/verduurzamen/zonnepanelen", changefreq: "monthly", priority: "0.8" },
  { path: "/verduurzamen/warmtepomp", changefreq: "monthly", priority: "0.8" },
  { path: "/verduurzamen/thuisbatterij", changefreq: "monthly", priority: "0.8" },
  { path: "/verduurzamen/airco", changefreq: "monthly", priority: "0.7" },
  { path: "/verduurzamen/laadpaal", changefreq: "monthly", priority: "0.7" },
  { path: "/verduurzamen/onderhoud", changefreq: "monthly", priority: "0.7" },
  { path: "/subsidies/nij-begun", changefreq: "monthly", priority: "0.8" },
  { path: "/subsidies/landelijk", changefreq: "monthly", priority: "0.8" },
  { path: "/subsidies/regionaal", changefreq: "monthly", priority: "0.8" },
  { path: "/over-ons", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
];


function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
