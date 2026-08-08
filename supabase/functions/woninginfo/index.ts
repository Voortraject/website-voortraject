// Supabase Edge Function: woninginfo
//
// Server-side brug naar het geregistreerde energielabel van een woning via de
// EP-Online API (RVO). De API-key is een secret en mag nooit client-side staan,
// dus doet deze function de call en levert genormaliseerde JSON met open CORS.
//
// Zelfde stramien als `subsidiecheck`: in-memory cache per adres (TTL), harde
// fetch-timeout, verify_jwt = false (publiek/anoniem te gebruiken). Het label is
// NIET-kritiek voor het subsidieoverzicht: bij een ontbrekende key, een fout of
// een adres zonder label geven we altijd `200 { energielabel: null }` terug,
// zodat de frontend gewoon geen label toont i.p.v. te breken.
//
// Benodigde secret (Supabase → Edge Functions → Secrets):
//   EP_ONLINE_API_KEY — de EP-Online API-key (productie), persoonsgebonden.
//
// Fase 2 breidt deze function uit met oppervlaktes (3D BAG) via de pand-ID.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { bouwModel, decodeer3dBag, kiesBuren } from "./model3d.ts";
import { normaliseerEpOnline, normaliseerGebouw } from "./normaliseer.ts";
import type { Model3d, WoningInfo } from "./types.ts";

const EP_ONLINE = "https://public.ep-online.nl/api/v5/PandEnergielabel/Adres";
// 3D BAG-items (CityJSON). Geen CORS → daarom serverside.
const BAG_3D = "https://api.3dbag.nl/collections/pand/items";
// PDOK BAG WFS (snel) om de buur-pand-ID's te vinden.
const BAG_WFS = "https://service.pdok.nl/lv/bag/wfs/v2_0";
// Straal (m) rond het adres om de buurpanden mee te nemen (grijs, als context).
const BUURT_STRAAL = 42;

// PC6, bijv. 9742HJ. Normaliseren (hoofdletters, geen spatie) en valideren.
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;
// Label verandert zelden; ruim cachen tegen onnodige EP-Online-load.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 uur
const FETCH_TIMEOUT_MS = 15000;

// Een 3D-model per pand is in de praktijk statisch (gebouwen veranderen niet).
// Cache-headers laten de browser (en terug-navigatie / gedeelde links) het model
// hergebruiken i.p.v. het trage, wisselvallige api.3dbag.nl opnieuw te bevragen.
// Een gevonden model mag lang blijven staan; een leeg model (3dbag hikte) juist
// kort, zodat een volgende poging snel weer echt ophaalt.
const MODEL_CACHE_GEVULD = "public, max-age=86400, stale-while-revalidate=2592000";
const MODEL_CACHE_LEEG = "public, max-age=60";

// Persistente cache (Postgres-tabel `pand_3d_cache` in dit CRM-project). Naast de
// in-memory Map (per instance, vluchtig) bewaart die het gedecodeerde model over
// instances én bezoekers heen: een adres dat één keer is opgehaald, laadt daarna
// direct en overleeft 3dbag-storingen. Best-effort: ontbreekt de tabel of de
// service-key, dan valt alles stil terug op in-memory + 3dbag (zie leesModelCache).
// `MODEL_VERSION` in de sleutel: bump 'm als de decoder-vorm wijzigt, dan worden
// oude rijen vanzelf genegeerd i.p.v. verkeerd-gevormde modellen te serveren.
const MODEL_VERSION = "v1";
const MODEL_CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 dagen; gebouwen wijzigen zelden

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CacheItem = { info: WoningInfo; at: number };
const cache = new Map<string, CacheItem>();

type Model3dCacheItem = { model: Model3d | null; at: number };
const model3dCache = new Map<string, Model3dCacheItem>();

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders },
  });
}

// 3D-model-antwoord met de juiste cache-header (lang bij een gevuld model, kort
// bij een leeg model). Zowel de cache-hit als een verse fetch gaan hierlangs.
function model3dResponse(model: Model3d | null): Response {
  return json({ model3d: model }, 200, {
    "Cache-Control": model ? MODEL_CACHE_GEVULD : MODEL_CACHE_LEEG,
  });
}

// Supabase-client voor de persistente modelcache (service_role, auto-geïnjecteerd).
// Eén keer opgezet en hergebruikt; `null` als de env ontbreekt → cache uit.
let modelDbClient: SupabaseClient | null | undefined;
function getModelDb(): SupabaseClient | null {
  if (modelDbClient !== undefined) return modelDbClient;
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  modelDbClient = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;
  return modelDbClient;
}

const dbSleutel = (cacheKey: string) => `${MODEL_VERSION}:${cacheKey}`;

// Leest het model uit de persistente cache. `null` bij een miss, verlopen entry
// of welke hapering dan ook (tabel bestaat niet, geen client, netwerkfout) —
// de aanroeper haalt dan gewoon vers op. We bewaren alleen niet-lege modellen,
// dus een rij = een echt model.
async function leesModelCache(cacheKey: string): Promise<Model3d | null> {
  const db = getModelDb();
  if (!db) return null;
  try {
    const { data, error } = await db
      .from("pand_3d_cache")
      .select("model, updated_at")
      .eq("cache_key", dbSleutel(cacheKey))
      .maybeSingle();
    if (error || !data?.model) return null;
    if (Date.now() - new Date(data.updated_at as string).getTime() > MODEL_CACHE_TTL_MS) return null;
    return data.model as Model3d;
  } catch {
    return null;
  }
}

// Schrijft (upsert) een niet-leeg model naar de persistente cache. Best-effort:
// een schrijffout mag de respons nooit blokkeren.
async function schrijfModelCache(cacheKey: string, model: Model3d): Promise<void> {
  const db = getModelDb();
  if (!db) return;
  try {
    await db
      .from("pand_3d_cache")
      .upsert({ cache_key: dbSleutel(cacheKey), model, updated_at: new Date().toISOString() }, { onConflict: "cache_key" });
  } catch {
    /* cache is best-effort */
  }
}

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// Eén EP-Online GET met timeout. Retourneert de geparste JSON, of null bij welke
// hapering dan ook (geen key, netwerkfout, non-ok, timeout, geen label).
async function fetchJson(url: string, timeout = FETCH_TIMEOUT_MS): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// api.3dbag.nl hikt af en toe met een 502/timeout. Voor de subject (kritiek:
// zonder subject geen model) proberen we het kort opnieuw i.p.v. de client de
// héle call (incl. WFS + buren) te laten herhalen. Buren hebben dit niet nodig:
// die zijn optionele context en mogen wegvallen.
async function fetchItemMetRetry(url: string, pogingen = 2, timeout = 8000): Promise<unknown> {
  for (let poging = 1; poging <= pogingen; poging++) {
    const data = await fetchJson(url, timeout);
    if (data) return data;
  }
  return null;
}

// Draait taken met een concurrency-limiet. api.3dbag.nl wordt onbetrouwbaar bij
// te veel gelijktijdige item-requests; een kleine pool is beleefd én stabiel.
async function metLimiet<T, R>(items: T[], limiet: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const uit: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      uit[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limiet, items.length) }, worker));
  return uit;
}

// Haalt het 3D-model op: het subject-pand als 3D BAG-item (vol detail) en — met
// geldige RD-coördinaten — de dichtstbijzijnde buurpanden óók als echte 3D-items
// (voor de viewer-look). Buur-ID's via de snelle BAG WFS; de items met beperkte
// concurrency + korte timeout, zodat trage/onbereikbare buren wegvallen i.p.v.
// de call op te houden. Het trage 3D BAG bbox-endpoint mijden we.
async function haal3dBag(pandid: string, x: number, y: number): Promise<Model3d | null> {
  const itemUrl = (id: string) => `${BAG_3D}/NL.IMBAG.Pand.${id}`;
  const heeftCoord = Number.isFinite(x) && Number.isFinite(y);
  const wfsUrl =
    `${BAG_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeNames=bag:pand` +
    `&outputFormat=application/json&srsName=EPSG:28992&count=40` +
    `&bbox=${x - BUURT_STRAAL},${y - BUURT_STRAAL},${x + BUURT_STRAAL},${y + BUURT_STRAAL},urn:ogc:def:crs:EPSG::28992`;

  // Subject (kritiek, met korte retry) en buren lopen zoveel mogelijk parallel.
  // De buur-id's komen uit de snelle WFS (~0,1s), dus we starten het ophalen van
  // de buur-items zodra die binnen is i.p.v. te wachten op de trage subject-fetch
  // (~2s). Piek-concurrency op api.3dbag.nl blijft 3 (1 subject + pool van 2
  // buren), binnen de grens waarbinnen de 3dbag-API betrouwbaar blijft.
  const subjectP = fetchItemMetRetry(itemUrl(pandid));
  const burenP = (heeftCoord ? fetchJson(wfsUrl) : Promise.resolve(null)).then((wfs) => {
    const buurIds = wfs ? kiesBuren(wfs as Parameters<typeof kiesBuren>[0], pandid, x, y) : [];
    return metLimiet(buurIds, 2, (id) => fetchJson(itemUrl(id), 8000));
  });

  const [subjectItem, buurItems] = await Promise.all([subjectP, burenP]);
  if (!subjectItem) return null;
  return (
    bouwModel(subjectItem as Parameters<typeof bouwModel>[0], buurItems as Parameters<typeof bouwModel>[1]) ??
    decodeer3dBag(subjectItem as Parameters<typeof decodeer3dBag>[0])
  );
}

async function haalEpOnline(url: string, apiKey: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // De EP-Online-swagger gebruikt header `Authorization` met de kale key.
    // Sommige omgevingen verwachten een `Bearer `-prefix; daarom vallen we bij
    // 401/403 terug op Bearer, zodat de exacte prefix niet blokkerend is.
    let res = await fetch(url, {
      headers: { Authorization: apiKey, Accept: "application/json" },
      signal: controller.signal,
    });
    if ((res.status === 401 || res.status === 403) && !apiKey.startsWith("Bearer ")) {
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        signal: controller.signal,
      });
    }
    if (!res.ok) return null; // incl. 404/204 = geen label → nette lege staat
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "GET") return json({ error: "Alleen GET" }, 405);

  const url = new URL(req.url);

  // Tak 2: 3D-model op basis van de BAG-pand-ID (16 cijfers). Aparte input dan
  // het label, dus een eigen aanroep met ?pandid=… (zelfde function/URL).
  const pandid = url.searchParams.get("pandid");
  if (pandid) {
    if (!/^\d{16}$/.test(pandid)) return json({ error: "Ongeldige pand-id." }, 400);
    const x = Number(url.searchParams.get("x"));
    const y = Number(url.searchParams.get("y"));
    const cacheKey = Number.isFinite(x) && Number.isFinite(y) ? `${pandid}@${Math.round(x)},${Math.round(y)}` : pandid;
    // 1) In-memory (per instance, snelst): dekt herhaalde hits binnen deze instance.
    const cached = model3dCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return model3dResponse(cached.model);

    // 2) Persistente cache (gedeeld over instances én bezoekers, immuun voor 3dbag):
    // een adres dat ooit is opgehaald, komt hier direct uit i.p.v. langs het trage
    // 3dbag. Alleen bevraagd bij een in-memory miss, dus geen extra last op hits.
    const uitDb = await leesModelCache(cacheKey);
    if (uitDb) {
      model3dCache.set(cacheKey, { model: uitDb, at: Date.now() });
      return model3dResponse(uitDb);
    }

    // 3) Vers ophalen bij 3dbag en beide caches vullen. Alleen een niet-leeg model
    // bewaren we persistent: een lege uitkomst (3dbag hikte) mag geen "geen model"
    // vastzetten, zodat een volgende poging het gewoon opnieuw probeert.
    const model = await haal3dBag(pandid, x, y);
    model3dCache.set(cacheKey, { model, at: Date.now() });
    if (model) await schrijfModelCache(cacheKey, model);
    return model3dResponse(model);
  }

  // Tak 1: energielabel op basis van adres.
  const postcode = normalizePostcode(url.searchParams.get("postcode") ?? "");
  const huisnummer = (url.searchParams.get("huisnummer") ?? "").trim();
  const toevoeging = (url.searchParams.get("toevoeging") ?? "").trim();

  if (!POSTCODE_RE.test(postcode) || !/^[0-9]+$/.test(huisnummer)) {
    return json({ error: "Ongeldig adres. Verwacht postcode (PC6) + huisnummer." }, 400);
  }

  const cacheKey = `${postcode}|${huisnummer}|${toevoeging}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return json(cached.info);

  const leeg: WoningInfo = { energielabel: null, gebouw: null };

  const apiKey = Deno.env.get("EP_ONLINE_API_KEY");
  if (!apiKey) {
    console.warn("EP_ONLINE_API_KEY ontbreekt — geen label opgehaald.");
    return json(leeg);
  }

  // Adresparameters. Eén losse letter = huisletter; anders huisnummertoevoeging.
  const params = new URLSearchParams({ postcode, huisnummer });
  if (toevoeging) {
    if (/^[A-Za-z]$/.test(toevoeging)) params.set("huisletter", toevoeging.toUpperCase());
    else params.set("huisnummertoevoeging", toevoeging);
  }

  const rows = await haalEpOnline(`${EP_ONLINE}?${params.toString()}`, apiKey);
  const info: WoningInfo = { energielabel: normaliseerEpOnline(rows), gebouw: normaliseerGebouw(rows) };

  cache.set(cacheKey, { info, at: Date.now() });
  return json(info);
});
