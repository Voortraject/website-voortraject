// Pure logica achter voortraject.nl/adviesgesprek/{token} (functions/adviesgesprek/[token].js):
// de webversie van de samenvattingsmail van het adviesgesprek. Los van de Pages Function, zodat
// vitest het kan testen (src/test/samenvattingspagina.test.ts).
//
// ─── LET OP: DIT IS EEN KOPIE ─────────────────────────────────────────────────────────────────
// De pagina moet tot in detail gelijk zijn aan de mail die de bewoner kreeg. Die mail wordt
// opgemaakt in n8n, workflow "BoldSign — 3. Offerte versturen naar bewoner" (WF3, id
// kf351AN7RUXX4kzf), node "E-mail opmaken (Resend)". Daaruit komen hier, letterlijk:
//   * saneerHtml (de allowlist waar de mailtekst doorheen gaat),
//   * knopHtml / opschrift (de okergele ondertekenknop),
//   * TEAM, handtekeningHtml en splitsAfzenderBlok (de handtekening),
//   * de omslag: logobalk, inhoudscel en voettekst.
// In de CRM-repo staan dezelfde kopieën in src/lib/mailShell.ts (bouwMailVoorbeeld) en
// src/lib/mailHandtekening.ts; daar bewaakt een test ze tegen WF3. Verandert de mail in WF3,
// dan moeten die twee CRM-bestanden EN dit bestand mee veranderen. De kernonderdelen liggen vast
// in src/test/samenvattingspagina.test.ts. Gelezen uit de live workflow op 08-10-2026.
//
// Wat hier BEWUST anders is dan in de mail (en nergens anders):
//   * de ondertekenknoppen komen niet uit de mail van toen maar live uit de database: de
//     offertes die NU openstaan (zie samenvatting_openen in de CRM-repo);
//   * staat er niets meer open, dan komt er een korte regel op de plek van de knop (STAND_TEKST);
//   * de regel "Werkt de knop niet? Gebruik dan deze link" ({{ONDERTEKENLINK_TEKST}}) vervalt;
//   * onder de handtekening het blok "Liever even overleggen?" met de knop "Bel me terug";
//   * een paar regels CSS voor de telefoon (zie STIJL).
// De kleuren staan als hex in de HTML, net als in de mail: dit is de mail, niet de website-app,
// dus de Tailwind-tokens gelden hier niet.
//
// Afhankelijk van de CRM-database (project lfelnfukbrxznkevnevr), migratie
// 20261008150000_samenvattingspagina_terugbelverzoek in de CRM-repo. Verwachte signaturen:
//
//   public.samenvatting_openen(p_token text, p_tellen boolean default true) returns jsonb
//     -> {"samenvatting": null}  of
//        {"samenvatting": {"mail_tekst": text, "term": "offerte"|"prijsindicatie",
//                          "stand": "open"|"getekend"|"verlopen"|"geen",
//                          "knoppen": [{"uitvoerder": text|null, "link": text}]}}
//   public.terugbelverzoek(p_token text) returns jsonb -> {"ok": boolean, "nieuw"?: boolean}
//
// EXECUTE voor anon. Bestaat een functie (nog) niet, dan geeft PostgREST een 404 en toont de
// pagina de contactpagina (lezen) of een foutregel bij de belknop (terugbellen).
import { BOLDSIGN_LINK, TELEFOON, TELEFOON_LINK, esc } from "./offertelink.js";

// ─── Kopie uit WF3: saneren ──────────────────────────────────────────────────────────────────
const TOEGESTANE_TAGS = new Set([
  "b", "strong", "i", "em", "u", "br", "p", "div", "ul", "ol", "li", "a", "hr",
  "table", "thead", "tbody", "tr", "td", "th",
]);
const MAAT = /^\d{1,4}%?$/;
const GETAL = /^\d{1,3}$/;
const STIJL_ATTR = /^(?:\s*(?:background-color|border-radius|color|display|font-size|font-weight|line-height|margin|padding|text-align|text-decoration)\s*:\s*[a-zA-Z0-9 .,%#-]+\s*;?)+$/;
const TOEGESTANE_ATTR = {
  align: /^(left|center|right)$/i,
  valign: /^(top|middle|bottom)$/i,
  width: MAAT,
  height: MAAT,
  colspan: GETAL,
  bgcolor: /^#[0-9A-Fa-f]{3,8}$/,
  cellpadding: GETAL,
  cellspacing: GETAL,
  border: GETAL,
  style: STIJL_ATTR,
};

export const PLAATSHOUDER = "{{ONDERTEKENLINK}}";
export const PLAATSHOUDER_TEKST = "{{ONDERTEKENLINK_TEKST}}";

const escHtml = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const veiligeLink = (u) => {
  const s = String(u ?? "").trim();
  return /^(https?:\/\/|mailto:)/i.test(s) ? s.replace(/"/g, "&quot;") : null;
};

function schoneAttributen(attrs) {
  const uit = [];
  const re = /([a-zA-Z]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(attrs)) !== null) {
    const naam = m[1].toLowerCase();
    const patroon = TOEGESTANE_ATTR[naam];
    if (!patroon) continue;
    const waarde = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5];
    if (patroon.test(String(waarde).trim())) {
      uit.push(naam + '="' + escHtml(String(waarde).trim()) + '"');
    }
  }
  return uit.length ? " " + uit.join(" ") : "";
}

export function saneerHtml(vuil) {
  let s = String(vuil ?? "");
  s = s.replace(/<(script|style|iframe|object|embed|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, "");
  s = s.replace(/<(script|style|iframe|object|embed|template|noscript|link|meta|base|form|input|button)\b[^>]*>/gi, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (heel, slash, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!TOEGESTANE_TAGS.has(t)) return "";
    if (slash) return "</" + t + ">";
    if (t === "br" || t === "hr") return "<" + t + ">";
    if (t === "ul" || t === "ol") return "<" + t + ' style="margin:0;padding-left:24px">';
    if (t !== "a") return "<" + t + schoneAttributen(attrs) + ">";
    const m = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = m ? (m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4]) : "";
    const veilig = veiligeLink(href);
    return veilig ? '<a href="' + veilig + '" target="_blank" rel="noopener noreferrer">' : "<a>";
  });
  return s;
}

// ─── Kopie uit WF3: de ondertekenknop ────────────────────────────────────────────────────────
export const knopHtml = (href, tekst) =>
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
  '<td align="center" bgcolor="#E8B547" style="border-radius:999px;padding:18px 24px;">' +
  '<a href="' + href + '" target="_blank" style="color:#152C4E;font-weight:700;font-size:16px;text-decoration:none;display:block;">' +
  tekst + "</a></td></tr></table>";

const KNOP_TUSSENRUIMTE = '<div style="line-height:12px">&nbsp;</div>';

// ─── Kopie uit WF3: de handtekening ──────────────────────────────────────────────────────────
const MAIL_ASSETS = "https://voortraject.nl/mail/";
const KANTOOR_TELEFOON = "050 211 26 89";

export const TEAM = [
  { naam: "Michael Kruizenga", functie: "Verduurzamingsspecialist", foto: "michael-foto.png",
    mobiel: "06 43 42 08 95", email: "michael@voortraject.nl" },
  { naam: "Tim Niemeijer", functie: "Bewonersadviseur", foto: "tim-foto.png",
    mobiel: "06 12 07 02 15", email: "tim@voortraject.nl" },
  { naam: "Wouter Niemeijer", functie: "Bewonersadviseur", foto: "wouter-foto.png",
    mobiel: "06 10 17 24 68", email: "wouter@voortraject.nl" },
  { naam: "Christian Moltmaker", functie: "Subsidiespecialist", foto: "christian-foto.png",
    mobiel: "06 40 24 83 71", email: "christian@voortraject.nl" },
];

const teamlidVan = (naam) => TEAM.find((l) => l.naam === String(naam ?? "").trim()) ?? null;
const telLink = (nummer) => "tel:" + nummer.replace(/\s/g, "").replace(/^0/, "+31");

const handtekeningRij = (label, waarde, href) =>
  `<tr><td width="62" style="width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;">${label}</td>` +
  `<td style="font-size:13px;line-height:20px;padding:0;">` +
  `<a href="${href}" style="color:#152C4E;text-decoration:none;">${waarde}</a></td></tr>`;

export const handtekeningHtml = (lid) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#152C4E;"><tr>` +
  `<td width="132" align="center" style="width:132px;vertical-align:middle;padding:0 22px 0 0;">` +
  `<img src="${MAIL_ASSETS}${lid.foto}" width="110" height="110" alt="${lid.naam}" style="display:block;width:110px;height:110px;border:0;border-radius:55px;margin:0 auto;">` +
  `</td>` +
  `<td style="vertical-align:middle;padding:4px 0 4px 22px;border-left:2px solid #E8B547;">` +
  `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">` +
  `<tr><td colspan="2" style="font-size:17px;line-height:22px;font-weight:bold;color:#152C4E;padding:0;">${lid.naam}</td></tr>` +
  `<tr><td colspan="2" style="font-size:13px;line-height:18px;color:#5C6B80;padding:0 0 12px 0;">${lid.functie}</td></tr>` +
  handtekeningRij("Mobiel", lid.mobiel, telLink(lid.mobiel)) +
  handtekeningRij("Kantoor", KANTOOR_TELEFOON, telLink(KANTOOR_TELEFOON)) +
  handtekeningRij("E-mail", lid.email, "mailto:" + lid.email) +
  handtekeningRij("Website", "voortraject.nl", "https://voortraject.nl") +
  `</table></td></tr></table>`;

export const splitsAfzenderBlok = (tekstHtml) => {
  const leeg = "(?:\\s|&nbsp;|<br\\s*/?>)*";
  const regel = "<div>" + leeg + "([^<]+?)" + leeg + "</div>";
  const m = tekstHtml.match(new RegExp(regel + leeg + regel + "(?:" + leeg + "<div>" + leeg + "</div>)*" + leeg + "$"));
  if (!m) return { tekst: tekstHtml, lid: null };
  const schoon = (s) => s.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const lid = teamlidVan(schoon(m[1]));
  if (!lid || !/^[0-9+][0-9\s()+-]{7,}$/.test(schoon(m[2]))) return { tekst: tekstHtml, lid: null };
  return { tekst: tekstHtml.slice(0, m.index), lid };
};

// ─── Kopie uit WF3: de omslag ────────────────────────────────────────────────────────────────
// Alleen de class-attributen (shell, kaart, inhoud) en de rij "bel" zijn toegevoegd, voor de
// CSS op de telefoon. Inline stijlen zijn letterlijk die van WF3.
export const LOGO_URL = "https://voortraject.nl/mail/voortraject-logo-mail.png?v=1";

const omslag = (body, belRij) =>
  `<table class="shell" role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FBFAF7; padding: 32px 16px; font-family: 'Inter', Arial, sans-serif;"> <tr><td align="center"> <table class="kaart" role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;"> <tr><td style="background-color: #152C4E; background-image: linear-gradient(#152C4E,#152C4E); padding: 32px 24px; text-align: center;"> <img src="${LOGO_URL}" alt="voortraject" width="216" height="60" style="height:60px;width:216px;display:inline-block;border:0;outline:none;text-decoration:none;color:#FFFFFF;font-size:24px;font-weight:700;font-family:Arial,Helvetica,sans-serif;"> </td></tr> <tr><td class="inhoud" style="padding: 40px 32px; color: #152C4E; line-height: 1.6; font-size: 16px;"> ${body} </td></tr>${belRij} <tr><td style="background-color: #FBFAF7; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB;"> <p style="font-size: 12px; color: #6B7280; margin: 0; line-height: 1.6;"> <strong style="color: #152C4E;">Voortraject</strong><br> info@voortraject.nl<br> </p> </td></tr> </table> </td></tr> </table>`;

// ─── Wat de webpagina anders doet ────────────────────────────────────────────────────────────

/**
 * Het RPC-antwoord controleren. Alles wat niet klopt wordt null (= contactpagina). Knoppen
 * zonder BoldSign-link vallen weg: dezelfde allowlist als /offerte/{token}.
 */
export function kiesSamenvatting(data) {
  const s = data && typeof data === "object" ? data.samenvatting : null;
  if (!s || typeof s.mail_tekst !== "string" || !s.mail_tekst.trim()) return null;
  const knoppen = (Array.isArray(s.knoppen) ? s.knoppen : [])
    .filter((k) => k && typeof k.link === "string" && BOLDSIGN_LINK.test(k.link.trim()))
    .map((k) => ({
      link: k.link.trim(),
      uitvoerder: typeof k.uitvoerder === "string" && k.uitvoerder.trim() ? k.uitvoerder.trim() : "",
    }));
  const term = s.term === "prijsindicatie" ? "prijsindicatie" : "offerte";
  const stand = knoppen.length ? "open" : ["getekend", "verlopen"].includes(s.stand) ? s.stand : "geen";
  return { mailTekst: s.mail_tekst, term, stand, knoppen };
}

const telefoonLink = `<a href="${TELEFOON_LINK}" style="color:#152C4E;font-weight:600;">${TELEFOON}</a>`;

/**
 * Wat er op de plek van de knop komt als er niets meer openstaat. Eén regel, je-vorm, en de
 * vraag "Ga je akkoord met de offerte?" erboven en "Daarna nemen wij het over." eronder gaan
 * dan weg, want die kloppen niet meer.
 *   getekend: alles uit deze samenvatting is ondertekend (de meeste bezoeken, 59 van 102 op
 *             08-10-2026). Geen aantal: "al ondertekend" klopt bij één en bij drie offertes.
 *   verlopen: er is iets wat nog getekend kan worden, maar de link is verlopen of ontbreekt.
 *   geen:     geweigerd, afgeboekt, dossier gestopt, of de samenvatting ging niet over een
 *             offerte. Dan beloven we niets, maar wijzen we de weg.
 */
export const STAND_TEKST = {
  getekend: "Je hebt al ondertekend. Dank je wel, wij nemen het vanaf hier over.",
  verlopen: `De link om te ondertekenen is verlopen. Bel ons op ${telefoonLink}, dan sturen we je een nieuwe.`,
  geen: `Er staat op dit moment niets voor je klaar om te ondertekenen. Vragen? Bel ons op ${telefoonLink}.`,
};

// Een <div> zonder geneste <div>: het blok waar een zin in staat.
const ZONDER_DIV = "(?:(?!<\\/?div)[\\s\\S])*";
const LEGE_REGEL = "<div>\\s*<br>\\s*<\\/div>\\s*";
const TERUGVAL_REGEL = new RegExp(
  `(?:${LEGE_REGEL})?<div[^>]*>${ZONDER_DIV}\\{\\{ONDERTEKENLINK_TEKST\\}\\}${ZONDER_DIV}<\\/div>`,
  "g",
);
const KNOP_REGEL = /<div>\s*\{\{ONDERTEKENLINK\}\}\s*<\/div>/;
const VRAAG_ERBOVEN = new RegExp(`<div>(${ZONDER_DIV})<\\/div>\\s*(?:${LEGE_REGEL})?$`);
const NA_TEKENEN_ERONDER = new RegExp(
  `^\\s*(?:${LEGE_REGEL})?<div>\\s*(?:Daarna|Na het ondertekenen)\\s+nemen\\s+wij\\s+het\\s+over\\.?\\s*<\\/div>`,
  "i",
);

/**
 * De binnenkant van de inhoudscel: precies de stappen van WF3 (saneren, afzenderblok eraf,
 * knoppen invullen, handtekening eronder), met de drie afwijkingen van de webpagina.
 */
export function bouwInhoud({ mailTekst, term, stand, knoppen }) {
  const afzender = splitsAfzenderBlok(saneerHtml(mailTekst));
  // De vangnetregel onder de knop is voor mailclients die de knop niet tekenen. Op de webpagina
  // werkt de knop altijd, dus de regel gaat weg, met de lege regel ervoor.
  let body = afzender.tekst.replace(TERUGVAL_REGEL, "").split(PLAATSHOUDER_TEKST).join("");

  const t = term === "prijsindicatie" ? "prijsindicatie" : "offerte";
  const links = (knoppen ?? [])
    .map((k) => ({ link: veiligeLink(k && k.link), uitvoerder: escHtml((k && k.uitvoerder) || "") }))
    .filter((k) => k.link);

  if (links.length) {
    // Kopie uit WF3.
    const opschrift = (k) =>
      links.length === 1 || !k.uitvoerder
        ? "Bekijk of onderteken je " + t
        : "Bekijk of onderteken je " + t + " - " + k.uitvoerder;
    const knopHtmlAlles = links.map((k) => knopHtml(k.link, opschrift(k))).join(KNOP_TUSSENRUIMTE);
    const heeftKnop = body.indexOf(PLAATSHOUDER) !== -1;
    if (heeftKnop) body = body.split(PLAATSHOUDER).join(knopHtmlAlles);
    else body += '<p style="margin:32px 0 0;">' + knopHtmlAlles + "</p>";
  } else if (body.indexOf(PLAATSHOUDER) !== -1) {
    const melding = STAND_TEKST[stand] ?? STAND_TEKST.geen;
    const m = body.match(KNOP_REGEL);
    if (m) {
      let voor = body.slice(0, m.index);
      let na = body.slice(m.index + m[0].length);
      // De vraag erboven ("Ga je akkoord met de offerte? …") hoort bij de knop.
      const vraag = voor.match(VRAAG_ERBOVEN);
      if (vraag && /akkoord/i.test(vraag[1])) voor = voor.slice(0, vraag.index);
      na = na.replace(NA_TEKENEN_ERONDER, "");
      body = voor + "<div>" + melding + "</div>" + na;
    }
    body = body.split(PLAATSHOUDER).join(melding);
  }

  if (afzender.lid) body += '<div style="line-height:24px">&nbsp;</div>' + handtekeningHtml(afzender.lid);
  return body;
}

// ─── Het belblok ─────────────────────────────────────────────────────────────────────────────
// Dezelfde pil als de ondertekenknop, maar donkerblauw met witte tekst. Een <button> in een
// <form>, zodat hij ook zonder JavaScript werkt (gewone POST, dan een 303 terug naar de pagina).
const pil = (bg, kleur, inhoud) =>
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
  `<td align="center" bgcolor="${bg}" style="border-radius:999px;padding:18px 24px;color:${kleur};font-weight:700;font-size:16px;">` +
  inhoud + "</td></tr></table>";

export const BEL_GELUKT = pil("#E3F1E8", "#1B6B3F", "Gelukt. We bellen je vandaag of de volgende werkdag.");
export const BEL_MISLUKT = pil(
  "#FBFAF7",
  "#152C4E",
  `Dat lukte niet. Bel ons op <a href="${TELEFOON_LINK}" style="color:#152C4E;">${TELEFOON}</a>.`,
);

const belKnop = (actie) =>
  `<form id="belform" method="post" action="${esc(actie)}" style="margin:0;">` +
  pil(
    "#152C4E",
    "#FFFFFF",
    '<button type="submit" style="all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;color:#FFFFFF;font-weight:700;font-size:16px;line-height:1.6;font-family:inherit;text-align:center;">Bel me terug</button>',
  ) +
  "</form>";

/** De extra rij in de kaart, tussen inhoud en voettekst. `toestand`: null, "gelukt" of "mislukt". */
export function belRij(actie, toestand) {
  const vak = toestand === "gelukt" ? BEL_GELUKT : toestand === "mislukt" ? BEL_MISLUKT : belKnop(actie);
  return `
      <tr><td class="bel" style="padding: 0 32px 40px; color:#152C4E; line-height:1.6; font-size:16px;">
        <div style="border-top:1px solid #E5E7EB; padding-top:32px;">
          <div><strong>Liever even overleggen?</strong></div>
          <div>Tik op de knop, dan bellen we je vandaag of de volgende werkdag terug.</div>
          <div style="line-height:16px">&nbsp;</div>
          <div id="belvak" aria-live="polite">${vak}</div>
          <div style="text-align:center;margin-top:12px;font-size:14px;color:#6B7280;">Of bel zelf: <a href="${TELEFOON_LINK}" style="color:#152C4E;font-weight:600;">${TELEFOON}</a></div>
        </div>
      </td></tr>`;
}

// Met JavaScript: geen paginawissel, de knop wordt ter plekke de groene pil.
const belScript = `<script>
(function () {
  var f = document.getElementById("belform");
  if (!f || !window.fetch) return;
  var vak = document.getElementById("belvak");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var b = f.querySelector("button");
    if (b) { b.disabled = true; b.textContent = "Even geduld…"; }
    fetch(f.action, { method: "POST", headers: { Accept: "application/json" }, credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : { ok: false }; })
      .then(function (d) { vak.innerHTML = d && d.ok ? ${JSON.stringify(BEL_GELUKT)} : ${JSON.stringify(BEL_MISLUKT)}; })
      .catch(function () { vak.innerHTML = ${JSON.stringify(BEL_MISLUKT)}; });
  });
})();
</script>`;

// De telefoon (≤600px): geen rand om de kaart, rechte hoeken, 20px zijruimte, 28px boven en
// onder; bedragen breken nooit af; 8px tussen label en waarde in de handtekening. Tablet en
// desktop: kaart van max. 640px met wat lucht eromheen.
const STIJL = `
:root{color-scheme:light}
body{margin:0;background:#FBFAF7}
.inhoud td[align="right"]{white-space:nowrap}
@media (max-width:600px){
  .shell{padding:0 !important}
  .kaart{border-radius:0 !important}
  .kaart > tbody > tr > td, .kaart > tr > td{padding-left:20px !important;padding-right:20px !important}
  .inhoud{padding-top:28px !important;padding-bottom:28px !important}
  .bel{padding-bottom:28px !important}
  .inhoud td[width="62"]{padding-right:8px !important}
}
#belform button:focus-visible{outline:3px solid #E8B547 !important;outline-offset:4px !important}
@media (min-width:601px){ .shell{padding:40px 24px !important} }
`;

/**
 * De hele pagina. `actie` is het eigen pad (/adviesgesprek/{token}) voor de belknop.
 * `toestand` is null, of "gelukt"/"mislukt" na een POST zonder JavaScript.
 */
export function samenvattingHtml(samenvatting, actie, toestand = null) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>Je adviesgesprek | Voortraject</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>${STIJL}</style>
</head>
<body>
${omslag(bouwInhoud(samenvatting), belRij(actie, toestand))}
${toestand ? "" : belScript}
</body>
</html>
`;
}

/**
 * Wat een linkvoorbeeld (WhatsApp, Slack, …) te zien krijgt: geen naam, geen adres, geen
 * bedragen. Alleen een titel, zodat het voorbeeld in de chat er netjes uitziet.
 */
export function voorbeeldHtml() {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>Je adviesgesprek | Voortraject</title>
<meta property="og:title" content="Je adviesgesprek">
<meta property="og:description" content="De samenvatting van je adviesgesprek met Voortraject.">
<meta property="og:site_name" content="Voortraject">
</head>
<body></body>
</html>
`;
}
