// Pure logica achter voortraject.nl/offerte/{token} (functions/offerte/[token].js).
// Los van de Pages Function, zodat vitest het kan testen (src/test/offertelink.test.ts).
//
// Afhankelijk van de CRM-database (project lfelnfukbrxznkevnevr), migratie
// 20261008120000_whatsapp_offertelink in de CRM-repo. Verwachte signatuur:
//
//   public.offertelink_openen(p_token text, p_tellen boolean default true) returns jsonb
//     -> {"offertes": [{"label": text, "uitvoerder": text|null, "link": text}]}
//
// EXECUTE voor anon. Ongeldig of onbekend token geeft {"offertes": []}. Bestaat de functie
// (nog) niet, dan geeft PostgREST een 404 en toont de pagina gewoon de contactpagina.

export const CRM_SUPABASE_URL = "https://lfelnfukbrxznkevnevr.supabase.co";
// Publieke anon-key van het CRM-project (dezelfde als in src/integrations/supabase/external-client.ts;
// src/test/offertelink.test.ts bewaakt dat). Nooit de service_role-key.
export const CRM_ANON_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWxuZnVrYnJ4em5rZXZuZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI3MTQsImV4cCI6MjA5MzIxODcxNH0.jtOD3z4ElwfXSNaZeekWKwfBZGBIXnWRvNl72n9uYQ0";

export const TOKEN_PATROON = /^[0-9a-f]{32}$/;

// Dezelfde allowlist als de opvolgmails in n8n (rX7rA6InKs5tNiwI) en open_offertes_van_bewoner()
// in de CRM-database: alleen een BoldSign-ondertekenlink, nooit een willekeurige URL.
export const BOLDSIGN_LINK = /^https:\/\/(app|app-eu)\.boldsign\.com\/[^\s"'<>]*$/i;

export const TELEFOON = "050 211 26 89";
export const TELEFOON_LINK = "tel:+31502112689";
export const EMAIL = "info@voortraject.nl";

export const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  // _headers geldt niet voor antwoorden van een Function; daarom staan deze hier ook.
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

/** Token uit de URL normaliseren; null als het geen geldig token is. */
export function normaliseerToken(ruw) {
  const token = String(ruw ?? "").trim().toLowerCase();
  return TOKEN_PATROON.test(token) ? token : null;
}

/** Linkvoorbeelden (HEAD of een crawler die een gedeelde link uitklapt) tellen niet als klik. */
export function isLinkvoorbeeld(methode, userAgent) {
  if (String(methode).toUpperCase() === "HEAD") return true;
  return /whatsapp|facebookexternalhit|facebot|bot\b|crawler|spider|preview|slack|telegram|discord|linkedin|skype/i.test(
    String(userAgent ?? ""),
  );
}

/**
 * Bepaalt wat de bewoner te zien krijgt op basis van het RPC-antwoord.
 * `data` is het geparste antwoord, of null bij een fout. Alles wat niet klopt wordt "contact".
 *   { soort: "door", link }            precies één bruikbare offerte
 *   { soort: "lijst", offertes: [...] } meer dan één
 *   { soort: "contact" }               geen, ongeldig, of fout
 */
export function kiesUitkomst(data) {
  const lijst = Array.isArray(data?.offertes) ? data.offertes : [];
  const offertes = lijst
    .filter((o) => o && typeof o.link === "string" && BOLDSIGN_LINK.test(o.link.trim()))
    .map((o) => ({
      label: typeof o.label === "string" && o.label.trim() ? o.label.trim() : "Offerte",
      uitvoerder: typeof o.uitvoerder === "string" && o.uitvoerder.trim() ? o.uitvoerder.trim() : null,
      link: o.link.trim(),
    }));
  if (offertes.length === 1) return { soort: "door", link: offertes[0].link };
  if (offertes.length > 1) return { soort: "lijst", offertes };
  return { soort: "contact" };
}

export function esc(waarde) {
  return String(waarde ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "Offerte van Ensing Isolatie bekijken"; zonder uitvoerder "Offerte 2026-0217 bekijken". */
export function knopTekst(offerte) {
  const soort = /^prijsindicatie\b/i.test(offerte.label) ? "Prijsindicatie" : "Offerte";
  return offerte.uitvoerder ? `${soort} van ${offerte.uitvoerder} bekijken` : `${offerte.label} bekijken`;
}

// De huisstijl van voortraject.nl, als CSS-variabelen (gelijk aan de tokens in src/index.css).
// Deze pagina staat buiten de React-app en Tailwind, dus de waarden staan hier één keer.
const STIJL = `
:root{--primary:#152C4E;--accent:#E8B547;--accent-hover:#D9A538;--background:#FBFAF7;--card:#FFFFFF;--border:#E5E2DB;--foreground:#2B2B2B;--muted:#6B6B6B}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--background);color:var(--foreground);font-family:Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:17px;line-height:1.55}
main{max-width:520px;margin:0 auto;padding:28px 16px 40px}
.logo{display:block;width:150px;height:39px;margin:0 0 32px}
h1{font-family:"Inter Tight",Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--primary);font-size:26px;line-height:1.2;letter-spacing:-0.01em;margin:0 0 12px}
p{margin:0 0 16px}
ul{list-style:none;margin:24px 0 0;padding:0}
li{margin:0 0 12px}
.knop{display:flex;align-items:center;justify-content:center;min-height:52px;padding:14px 20px;border-radius:10px;background:var(--accent);color:var(--primary);font-weight:700;text-align:center;text-decoration:none;overflow-wrap:anywhere}
.knop:hover,.knop:focus-visible{background:var(--accent-hover)}
.knop:focus-visible{outline:3px solid var(--primary);outline-offset:2px}
.label{display:block;color:var(--muted);font-size:14px;margin:0 0 6px}
.contact{margin-top:32px;padding-top:20px;border-top:1px solid var(--border);color:var(--muted);font-size:15px}
a{color:var(--primary)}
`;

function pagina(titel, inhoud) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>${esc(titel)} | Voortraject</title>
<style>${STIJL}</style>
</head>
<body>
<main>
<a href="https://voortraject.nl/"><img class="logo" src="/mail/voortraject-logo-blauw.png" width="150" height="39" alt="Voortraject"></a>
${inhoud}
</main>
</body>
</html>
`;
}

const contactZin = `Bel ons op <a href="${TELEFOON_LINK}">${TELEFOON}</a> of mail <a href="mailto:${EMAIL}">${EMAIL}</a>, dan helpen we je verder.`;

export function contactHtml() {
  return pagina(
    "Deze link werkt niet meer",
    `<h1>Deze link werkt niet meer</h1>
<p>${contactZin}</p>`,
  );
}

export function lijstHtml(offertes) {
  const items = offertes
    .map(
      (o) => `<li><span class="label">${esc(o.label)}</span><a class="knop" href="${esc(o.link)}" rel="noreferrer">${esc(knopTekst(o))}</a></li>`,
    )
    .join("\n");
  return pagina(
    "Je offertes",
    `<h1>Je offertes</h1>
<p>Er staan ${offertes.length} offertes voor je klaar. Kies welke je wilt bekijken.</p>
<ul>
${items}
</ul>
<p class="contact">Vragen? ${contactZin}</p>`,
  );
}
