// Supabase Edge Function: subsidiecheck
//
// De productie-databrug naar de Energiesubsidiewijzer van Verbeterjehuis
// (RVO/Milieu Centraal, CC-0). In DEV praat de frontend rechtstreeks met de
// Vite-proxy `/esw`; in PRODUCTIE praat 'ie met déze function, die:
//   1. de resultatenlijst per postcode serverside ophaalt + parset,
//   2. elke regeling verrijkt met bedrag/voorwaarde/officiële bron
//      (detailpagina's — N+1, met een beleefde concurrency-limiet),
//   3. het resultaat per postcode cachet (in-memory, TTL) tegen latency en
//      onnodige load op de bron,
//   4. het al verrijkt als JSON teruggeeft, met open CORS (data is publiek).
//
// Zo blijft het scrapen serverside (geen CORS in de browser, één plek om de
// User-Agent en caching te beheren). De parser is een kopie van
// src/lib/subsidies/energiesubsidiewijzer.ts (zie de header daar).
//
// Geen secrets nodig; deze function raakt de database niet. verify_jwt = false
// (zie config.toml) omdat de checker publiek en anoniem te gebruiken is.

import { parseDetail, parseResultaten, verrijk, type RegelingDetail } from "./energiesubsidiewijzer.ts";
import type { SubsidieRegeling } from "./types.ts";

const BRON = "https://www.verbeterjehuis.nl";
// Een echte browser-UA: de bron levert server-rendered HTML en kan kale
// bots weren. Zelfde UA als de Vite-dev-proxy (vite.config.ts).
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// PC6, bijv. 9742HJ. We normaliseren (hoofdletters, geen spatie) en valideren.
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;
// Max detail-fetches tegelijk — beleefd tegen de bron, toch vlot.
const DETAIL_CONCURRENCY = 6;
// Hoe lang een geparset + verrijkt resultaat per postcode geldig blijft.
const LIJST_TTL_MS = 12 * 60 * 60 * 1000; // 12 uur
// Detailpagina's veranderen zelden en zijn deelbaar tussen postcodes.
const DETAIL_TTL_MS = 24 * 60 * 60 * 1000; // 24 uur
// Harde timeout per fetch, zodat één trage detailpagina de hele request niet ophangt.
const FETCH_TIMEOUT_MS = 12000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory caches. Overleven zolang de isolate warm is (Supabase houdt functies
// een tijd warm); bij een cold start wordt opnieuw opgehaald. Voldoende voor het
// verkeersvolume; een duurzame DB-cache is een latere upgrade indien nodig.
type LijstCacheItem = { regelingen: SubsidieRegeling[]; at: number };
const lijstCache = new Map<string, LijstCacheItem>();

type DetailCacheItem = { detail: RegelingDetail; at: number };
const detailCache = new Map<string, DetailCacheItem>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

async function fetchTekst(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function haalDetail(bronUrl: string): Promise<RegelingDetail> {
  // Normaliseer naar een pad-key, zodat relatieve en absolute hrefs samenvallen.
  const pad = new URL(bronUrl, BRON).pathname;
  const bestaand = detailCache.get(pad);
  if (bestaand && Date.now() - bestaand.at < DETAIL_TTL_MS) return bestaand.detail;

  const html = await fetchTekst(`${BRON}${pad}`);
  const detail = html ? parseDetail(html) : {};
  detailCache.set(pad, { detail, at: Date.now() });
  return detail;
}

// Verrijk alle regelingen met een concurrency-limiet (simpele worker-pool).
async function verrijkAlles(regelingen: SubsidieRegeling[]): Promise<SubsidieRegeling[]> {
  const uit: SubsidieRegeling[] = new Array(regelingen.length);
  let index = 0;

  async function worker() {
    while (index < regelingen.length) {
      const i = index++;
      const r = regelingen[i];
      try {
        uit[i] = verrijk(r, await haalDetail(r.bronUrl));
      } catch {
        uit[i] = r; // detail faalde → toon de basisregeling
      }
    }
  }

  const workers = Array.from({ length: Math.min(DETAIL_CONCURRENCY, regelingen.length) }, worker);
  await Promise.all(workers);
  return uit;
}

async function haalRegelingen(cacheKey: string, bronQuery: string): Promise<SubsidieRegeling[]> {
  const cached = lijstCache.get(cacheKey);
  if (cached && Date.now() - cached.at < LIJST_TTL_MS) return cached.regelingen;

  const html = await fetchTekst(`${BRON}/energiesubsidiewijzer?${bronQuery}`);
  // fetch mislukt (bron onbereikbaar) → gooien, zodat de client op de mock
  // terugvalt. Een lege-maar-geldige pagina (0 kaarten voor deze situatie) is
  // géén fout: die geeft gewoon een lege lijst → de UI toont de "geen
  // regelingen"-staat i.p.v. voorbeelddata.
  if (html === null) throw new Error("Energiesubsidiewijzer niet bereikbaar");

  const basis = parseResultaten(html);
  const verrijkt = basis.length > 0 ? await verrijkAlles(basis) : [];
  lijstCache.set(cacheKey, { regelingen: verrijkt, at: Date.now() });
  return verrijkt;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "GET") return json({ error: "Alleen GET" }, 405);

  const url = new URL(req.url);
  const raw = url.searchParams.get("postalcode") ?? url.searchParams.get("postcode") ?? "";
  const postcode = normalizePostcode(raw);
  if (!POSTCODE_RE.test(postcode)) {
    return json({ error: "Ongeldige postcode. Verwacht een PC6, bijv. 9742HJ." }, 400);
  }

  // Forward het bewonertype (type-of-resident) en de maatregel-filters naar de
  // bron, zodat Verbeterjehuis server-side filtert (exact als hun eigen tool).
  const bron = new URLSearchParams();
  bron.set("postalcode", postcode);
  const resident = url.searchParams.get("type-of-resident");
  if (resident) bron.set("type-of-resident", resident);
  const filters = url.searchParams.getAll("filter").sort(); // sorteren → stabiele cachesleutel
  for (const f of filters) bron.append("filter", f);
  const cacheKey = `${postcode}|${resident ?? ""}|${filters.join(",")}`;

  try {
    const regelingen = await haalRegelingen(cacheKey, bron.toString());
    return json({ postcode, regelingen, bron: "Energiesubsidiewijzer" });
  } catch (err) {
    // De frontend valt bij een fout stil terug op de mock (zie de provider),
    // dus een 502 hier is prima en informatief in de logs.
    return json({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
});
