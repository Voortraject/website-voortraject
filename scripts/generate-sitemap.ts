// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

import { SUBSIDIECHECK_LIVE } from "../src/config/features";

const BASE_URL = "https://voortraject.nl";

interface SitemapEntry {
  path: string;
  /**
   * Datum van de laatste inhoudelijke wijziging (YYYY-MM-DD).
   *
   * Bewust handmatig en niet de builddatum: als élke pagina bij elke deploy
   * "vandaag" claimt, is het signaal waardeloos en gaat Google het negeren.
   * Werk deze datum bij wanneer je de tekst of inhoud van een pagina
   * betekenisvol wijzigt (een styling-tweak telt niet).
   *
   * changefreq en priority staan hier bewust niet meer in: Google gebruikt ze
   * niet, lastmod wél.
   */
  lastmod: string;
}

const entries: SitemapEntry[] = [
  // 2026-11-25: FAQ "Hoe verdienen jullie dan geld?" noemt de vergoeding voor alleen de aanvraag.
  { path: "/", lastmod: "2026-11-25" },
  // De subsidiecheck valt uit de sitemap zolang hij nog niet live is (de pagina
  // staat dan op noindex) — zie src/config/features.ts.
  ...(SUBSIDIECHECK_LIVE ? [{ path: "/subsidiecheck", lastmod: "2026-08-07" } as SitemapEntry] : []),
  { path: "/zakelijk", lastmod: "2026-08-07" },

  { path: "/verduurzamen", lastmod: "2026-08-10" },
  // 2026-08-11: de configurator herzien (spouw en gevel combineerbaar,
  // gevelcijfers per woningtype, terugverdientijd, voortgangsbalk) en het blok
  // over glas verplaatst naar de FAQ. Inhoudelijk, dus lastmod mee.
  { path: "/verduurzamen/isolatie", lastmod: "2026-08-11" },
  { path: "/verduurzamen/zonnepanelen", lastmod: "2026-07-02" },
  { path: "/verduurzamen/warmtepomp", lastmod: "2026-07-02" },
  { path: "/verduurzamen/thuisbatterij", lastmod: "2026-06-12" },
  { path: "/verduurzamen/airco", lastmod: "2026-07-02" },
  { path: "/verduurzamen/laadpaal", lastmod: "2026-06-11" },
  { path: "/verduurzamen/onderhoud", lastmod: "2026-07-03" },
  // 2026-11-25: Nij Begun en landelijk wijzen naar /subsidies/aanvragen (FAQ en een zijpad).
  { path: "/subsidies/nij-begun", lastmod: "2026-11-25" },
  { path: "/subsidies/landelijk", lastmod: "2026-11-25" },
  // 2026-11-25: FAQ "gratis via onze uitvoerders, anders tegen een vergoeding".
  { path: "/subsidies/regionaal", lastmod: "2026-11-25" },
  { path: "/subsidies/stapelen", lastmod: "2026-11-25" },
  // 2026-11-25: nieuw, de subsidiedienst (wij doen de aanvraag).
  { path: "/subsidies/aanvragen", lastmod: "2026-11-25" },
  { path: "/over-ons", lastmod: "2026-07-16" },
  { path: "/contact", lastmod: "2026-08-07" },
  { path: "/privacy", lastmod: "2026-07-14" },
  { path: "/cookieverklaring", lastmod: "2026-06-10" },
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [`  <url>`, `    <loc>${BASE_URL}${e.path}</loc>`, `    <lastmod>${e.lastmod}</lastmod>`, `  </url>`].join("\n"),
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
