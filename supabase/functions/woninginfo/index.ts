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

import { bouwModel, decodeer3dBag, kiesBuren } from "./model3d.ts";
import { normaliseerEpOnline } from "./normaliseer.ts";
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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CacheItem = { info: WoningInfo; at: number };
const cache = new Map<string, CacheItem>();

type Model3dCacheItem = { model: Model3d | null; at: number };
const model3dCache = new Map<string, Model3dCacheItem>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
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
  const subjectUrl = `${BAG_3D}/NL.IMBAG.Pand.${pandid}`;
  const heeftCoord = Number.isFinite(x) && Number.isFinite(y);
  const wfsUrl =
    `${BAG_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeNames=bag:pand` +
    `&outputFormat=application/json&srsName=EPSG:28992&count=40` +
    `&bbox=${x - BUURT_STRAAL},${y - BUURT_STRAAL},${x + BUURT_STRAAL},${y + BUURT_STRAAL},urn:ogc:def:crs:EPSG::28992`;

  const [subjectItem, wfs] = await Promise.all([
    fetchJson(subjectUrl),
    heeftCoord ? fetchJson(wfsUrl) : Promise.resolve(null),
  ]);
  if (!subjectItem) return null;

  const buurIds = wfs ? kiesBuren(wfs as Parameters<typeof kiesBuren>[0], pandid, x, y) : [];
  const buurItems = await metLimiet(buurIds, 3, (id) => fetchJson(`${BAG_3D}/NL.IMBAG.Pand.${id}`, 8000));
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
    const cached = model3dCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return json({ model3d: cached.model });
    const model = await haal3dBag(pandid, x, y);
    model3dCache.set(cacheKey, { model, at: Date.now() });
    return json({ model3d: model });
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

  const leeg: WoningInfo = { energielabel: null };

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
  const info: WoningInfo = { energielabel: normaliseerEpOnline(rows) };

  cache.set(cacheKey, { info, at: Date.now() });
  return json(info);
});
