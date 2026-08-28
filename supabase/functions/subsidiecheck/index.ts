// Supabase Edge Function: subsidiecheck
//
// De productie-databrug naar de Energiesubsidiewijzer van Milieu Centraal. In
// DEV praat de frontend via een Vite-proxy rechtstreeks met de bron; in
// PRODUCTIE praat 'ie met déze function, die de regelingen per postcode ophaalt,
// naar onze types vertaalt, cachet en als JSON teruggeeft met open CORS.
//
// Twee routes naar dezelfde uitkomst:
//   1. OFFICIËLE API (`ESW_API_KEY` gezet). Eén request per postcode en
//      bewonertype; het antwoord bevat al bedrag, voorwaarden, officiële bron en
//      de maatregelen per regeling. Filteren op maatregelen doen we hier, op de
//      `Tags` uit dat antwoord.
//   2. OUDE ROUTE (geen key, of de API valt uit). De scrape van hun publieke
//      site: lijstpagina parsen en per regeling een detailpagina ophalen. Blijft
//      staan als vangnet tijdens de overstap en gaat daarna weg (tasks/todo.md).
//
// Het contract naar de frontend is in beide gevallen identiek — zelfde
// queryparameters, zelfde JSON — zodat ook een oude, nog gecachete browserbundle
// blijft werken en de overstap onzichtbaar is. Het veld `via` in het antwoord
// zegt welke route het is geworden; dat is puur voor onze eigen verificatie.
//
// Secret: ESW_API_KEY (Milieu Centraal). Deze function raakt de database niet.
// verify_jwt = false (zie config.toml) omdat de checker publiek en anoniem te
// gebruiken is.

import { parseDetail, parseResultaten, verrijk, type RegelingDetail } from "./energiesubsidiewijzer.ts";
import {
  filterOpFilterIds,
  naarRegeling,
  type EswApiRegeling,
} from "./energiesubsidiewijzerApi.ts";
import type { SubsidieRegeling } from "./types.ts";

const BRON = "https://www.verbeterjehuis.nl";
const API_ZOEKEN = `${BRON}/api/v1/regulation/search`;
const API_FILTERS = `${BRON}/api/v1/regulation/getfilters`;
// Ontbreekt de key, dan draait de function gewoon op de oude route. Zo kunnen we
// deployen vóór de secret bestaat, en met het weghalen van de secret terugrollen
// zonder release.
const API_KEY = Deno.env.get("ESW_API_KEY") ?? "";
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

// De API-cache bewaart het rúwe antwoord per postcode en bewonertype. Het
// filteren op maatregelen gebeurt daarna, dus één opgehaald antwoord bedient
// alle 255 maatregelcombinaties in plaats van één. Dat scheelt fors in
// cache-missers ten opzichte van de oude route.
type ApiCacheItem = { regelingen: EswApiRegeling[]; at: number };
const apiCache = new Map<string, ApiCacheItem>();

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

// --- Route 1: de officiële API ---
// `cityId` accepteert volgens de API Guide een gemeente-id, een plaatsnaam óf
// een postcode; wij sturen de PC6 die de bezoeker invulde.
async function haalViaApi(postcode: string, resident: string): Promise<EswApiRegeling[]> {
  const cacheKey = `${postcode}|${resident}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.at < LIJST_TTL_MS) return cached.regelingen;

  const zoek = new URL(API_ZOEKEN);
  zoek.searchParams.set("cityId", postcode);
  if (resident) zoek.searchParams.set("targetGroup", resident);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(zoek, {
      headers: { apiKey: API_KEY, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Energiesubsidiewijzer-API gaf status ${res.status}`);
    const data = await res.json();
    // Een lege lijst is een geldig antwoord ("geen regelingen voor deze
    // situatie"); iets anders dan een lijst is dat niet.
    if (!Array.isArray(data)) throw new Error("Energiesubsidiewijzer-API gaf geen lijst terug");
    const regelingen = data as EswApiRegeling[];
    apiCache.set(cacheKey, { regelingen, at: Date.now() });
    return regelingen;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "GET") return json({ error: "Alleen GET" }, 405);

  const url = new URL(req.url);

  // `?meta=filters` geeft de filterlijst van de bron door. Publieke informatie
  // (ze staat op hun eigen site), en het bespaart een tweede kopie van de
  // API-key: de wekelijkse controle in GitHub Actions vraagt het hier op in
  // plaats van rechtstreeks aan Milieu Centraal. Zie
  // scripts/controleer-esw-filters.mjs.
  if (url.searchParams.get("meta") === "filters") {
    if (!API_KEY) return json({ error: "Geen ESW_API_KEY ingesteld" }, 503);
    try {
      const res = await fetch(API_FILTERS, { headers: { apiKey: API_KEY, Accept: "application/json" } });
      if (!res.ok) return json({ error: `Energiesubsidiewijzer-API gaf status ${res.status}` }, 502);
      return json(await res.json());
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : String(err) }, 502);
    }
  }

  const raw = url.searchParams.get("postalcode") ?? url.searchParams.get("postcode") ?? "";
  const postcode = normalizePostcode(raw);
  if (!POSTCODE_RE.test(postcode)) {
    return json({ error: "Ongeldige postcode. Verwacht een PC6, bijv. 9742HJ." }, 400);
  }

  // Het bewonertype (`type-of-resident`) en de maatregel-filters komen binnen in
  // de waarden van de bron zelf, dus we geven ze onvertaald door.
  const bron = new URLSearchParams();
  bron.set("postalcode", postcode);
  const resident = url.searchParams.get("type-of-resident");
  if (resident) bron.set("type-of-resident", resident);
  const filters = url.searchParams.getAll("filter").sort(); // sorteren → stabiele cachesleutel
  for (const f of filters) bron.append("filter", f);
  const cacheKey = `${postcode}|${resident ?? ""}|${filters.join(",")}`;

  // Route 1. Faalt de API, dan gaan we door naar de oude route in plaats van de
  // bezoeker een foutmelding te geven: een storing bij hen mag ons niet stilzetten.
  if (API_KEY) {
    try {
      const ruw = await haalViaApi(postcode, resident ?? "");
      const regelingen = filterOpFilterIds(ruw, filters).map(naarRegeling);
      return json({ postcode, regelingen, bron: "Energiesubsidiewijzer", via: "api" });
    } catch (err) {
      console.error("Energiesubsidiewijzer-API mislukt, terug naar de oude route:", err);
    }
  }

  // Route 2 (vangnet).
  try {
    const regelingen = await haalRegelingen(cacheKey, bron.toString());
    return json({ postcode, regelingen, bron: "Energiesubsidiewijzer", via: "scrape" });
  } catch (err) {
    // Beide routes plat. De frontend toont dan de eerlijke foutstaat met
    // "Opnieuw proberen" (geen voorbeelddata, zie de provider), dus een 502 is
    // hier het juiste antwoord en informatief in de logs.
    return json({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
});
