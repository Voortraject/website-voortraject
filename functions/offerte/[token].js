// Cloudflare Pages Function voor /offerte/{token}: de persoonlijke offertelink achter de
// WhatsApp-knop "Bekijk de offertes".
//
// Het token hoort bij een bewoner in het CRM (bewoners.offerte_token). We vragen het CRM via de
// publieke RPC offertelink_openen welke offertes er openstaan (zie functions/_lib/offertelink.js
// voor de verwachte signatuur) en dan:
//   * precies één offerte  -> 302 naar de BoldSign-ondertekenlink;
//   * meer dan één         -> een korte keuzepagina met een knop per offerte;
//   * geen, ongeldig, fout -> een contactpagina (status 200), nooit een technische foutmelding.
//
// Linkvoorbeelden (HEAD, of een crawler die een gedeelde link uitklapt) tellen niet als klik.
// De anon-key komt uit de Pages-omgevingsvariabele CRM_SUPABASE_ANON_KEY als die er is, anders
// uit de publieke fallback in de code. De service_role-key hoort hier nooit.
import {
  CRM_ANON_KEY_FALLBACK,
  CRM_SUPABASE_URL,
  HEADERS,
  contactHtml,
  isLinkvoorbeeld,
  kiesUitkomst,
  lijstHtml,
  normaliseerToken,
} from "../_lib/offertelink.js";

const TIMEOUT_MS = 6000;

function html(body, methode) {
  return new Response(methode === "HEAD" ? null : body, {
    status: 200,
    headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}

async function haalOffertes(token, tellen, env) {
  const key = (env && env.CRM_SUPABASE_ANON_KEY) || CRM_ANON_KEY_FALLBACK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${CRM_SUPABASE_URL}/rest/v1/rpc/offertelink_openen`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_token: token, p_tellen: tellen }),
      signal: controller.signal,
    });
    if (!res.ok) {
      // Fail naar de contactpagina, maar niet stil: dit komt in de Pages-log.
      console.error(`offertelink_openen gaf HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`offertelink_openen mislukt: ${e && e.name ? e.name : "onbekend"}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequest(context) {
  const { request, params, env } = context;
  const methode = request.method.toUpperCase();

  if (methode !== "GET" && methode !== "HEAD") {
    return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "GET, HEAD" } });
  }

  const token = normaliseerToken(params && params.token);
  // Een ongeldig token raakt de database niet.
  if (!token) return html(contactHtml(), methode);

  const tellen = !isLinkvoorbeeld(methode, request.headers.get("user-agent"));
  const uitkomst = kiesUitkomst(await haalOffertes(token, tellen, env));

  if (uitkomst.soort === "door") {
    return new Response(null, { status: 302, headers: { ...HEADERS, Location: uitkomst.link } });
  }
  if (uitkomst.soort === "lijst") return html(lijstHtml(uitkomst.offertes), methode);
  return html(contactHtml(), methode);
}
