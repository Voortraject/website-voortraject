// Cloudflare Pages Function voor /adviesgesprek/{token}: de webversie van de samenvattingsmail
// van het adviesgesprek, achter de WhatsApp-knop "Samenvatting bekijken".
//
// Het token hoort bij een bewoner in het CRM (bewoners.offerte_token, hetzelfde token als
// /offerte/{token}). Zie functions/_lib/samenvattingspagina.js voor de verwachte RPC's en
// voor waarom de HTML een kopie is van de mail uit n8n.
//
//   GET   geldig token met verstuurde samenvatting -> de pagina (telt als bezoek);
//         al het andere (ongeldig, onbekend, geen samenvatting, fout) -> contactpagina (200).
//   HEAD  en linkvoorbeelden (WhatsApp, Slack, …) -> een kale pagina zonder persoonsgegevens;
//         de database wordt dan niet eens gevraagd, en het telt niet als bezoek.
//   POST  de knop "Bel me terug" -> RPC terugbelverzoek. Met JavaScript (Accept: JSON) een
//         JSON-antwoord {ok}; zonder JavaScript een 303 terug naar de pagina met de uitkomst.
//
// Persoonsgegevens (naam, adres, bedragen, advies): alleen met een geldig token, nooit in de
// cache (no-store), niet in zoekmachines (noindex + robots.txt), geen referrer, en het token
// komt niet in onze logregels. De anon-key komt uit CRM_SUPABASE_ANON_KEY als die er is, anders
// uit de publieke fallback; de service_role-key hoort hier nooit.
import {
  CRM_ANON_KEY_FALLBACK,
  CRM_SUPABASE_URL,
  HEADERS,
  contactHtml,
  isLinkvoorbeeld,
  normaliseerToken,
} from "../_lib/offertelink.js";
import { kiesSamenvatting, samenvattingHtml, voorbeeldHtml } from "../_lib/samenvattingspagina.js";

const TIMEOUT_MS = 6000;

function html(body, methode) {
  return new Response(methode === "HEAD" ? null : body, {
    status: 200,
    headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function rpc(naam, body, env) {
  const key = (env && env.CRM_SUPABASE_ANON_KEY) || CRM_ANON_KEY_FALLBACK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${CRM_SUPABASE_URL}/rest/v1/rpc/${naam}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      // Niet stil: dit komt in de Pages-log, zonder token.
      console.error(`${naam} gaf HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`${naam} mislukt: ${e && e.name ? e.name : "onbekend"}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Een POST van een andere site (een formulier elders dat hierheen post) weigeren we. */
function vanEigenSite(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(request.url).origin === origin;
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const { request, params, env } = context;
  const methode = request.method.toUpperCase();

  if (methode !== "GET" && methode !== "HEAD" && methode !== "POST") {
    return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "GET, HEAD, POST" } });
  }

  const token = normaliseerToken(params && params.token);
  const wilJson = (request.headers.get("accept") || "").includes("application/json");

  if (methode === "POST") {
    if (!token || !vanEigenSite(request)) {
      return wilJson ? json({ ok: false }, 400) : html(contactHtml(), methode);
    }
    const uitkomst = await rpc("terugbelverzoek", { p_token: token }, env);
    const ok = !!(uitkomst && uitkomst.ok === true);
    if (wilJson) return json({ ok });
    return new Response(null, {
      status: 303,
      headers: { ...HEADERS, Location: `/adviesgesprek/${token}?teruggebeld=${ok ? "ja" : "nee"}` },
    });
  }

  // Een ongeldig token raakt de database niet.
  if (!token) return html(contactHtml(), methode);

  // HEAD en linkvoorbeelden: geen persoonsgegevens, geen databasevraag, geen bezoek.
  if (isLinkvoorbeeld(methode, request.headers.get("user-agent"))) return html(voorbeeldHtml(), methode);

  const samenvatting = kiesSamenvatting(await rpc("samenvatting_openen", { p_token: token, p_tellen: true }, env));
  if (!samenvatting) return html(contactHtml(), methode);

  const teruggebeld = new URL(request.url).searchParams.get("teruggebeld");
  const toestand = teruggebeld === "ja" ? "gelukt" : teruggebeld === "nee" ? "mislukt" : null;
  return html(samenvattingHtml(samenvatting, `/adviesgesprek/${token}`, toestand), methode);
}
