// Supabase Edge Function: subsidiecheck-mail
//
// De zachte conversieroute "Mail mij dit overzicht". Doet twee dingen serverside:
//   1. schrijft de lead naar `leads_bewoners` in het CRM-project (via
//      service_role — dezelfde tabel/kolommen als het contactformulier, alleen
//      bron: "Voortraject"), en
//   2. stuurt de bezoeker het gevonden subsidieoverzicht per e-mail via Resend
//      (API-key blijft server-side geheim), met een kopie naar het team.
//
// De lead-insert gaat eerst en is leidend: een hapering bij Resend mag nooit een
// lead verliezen. Faalt de mail, dan staat de lead er nog en volgt het team op
// (de UI belooft "we sturen het overzicht"; dat blijft waar).
//
// Daarnaast is er de route `actie: "bericht"`: een vraag die de bezoeker op het
// resultaat stelt. Die komt in `notities` bij de bestaande lead (via het `leadId`
// dat deze function bij de eerste call teruggeeft) en gaat per mail naar het
// team, met de bezoeker als antwoordadres. Is er nog geen lead, dan maakt de
// function er alsnog een met de vraag erin.
//
// Benodigde secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   — API-key van resend.com (verplicht voor automatische mail)
//   MAIL_FROM        — afzender, bijv. "Voortraject <noreply@voortraject.nl>"
//                      (moet een geverifieerd domein in Resend zijn)
//   MAIL_BCC         — optioneel, teamkopie, bijv. "info@voortraject.nl"
//   MAIL_TEAM        — optioneel, ontvanger van de vraag-mails; valt terug op
//                      MAIL_BCC en daarna op info@voortraject.nl
//   MAIL_REPLY_TO    — optioneel, antwoordadres, standaard info@voortraject.nl
// SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY worden automatisch geïnjecteerd.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const DEFAULT_FROM = "Voortraject <noreply@voortraject.nl>";
const DEFAULT_REPLY_TO = "info@voortraject.nl";

// Huisstijl (institutional B2B). E-mail kan geen CSS-variabelen/Tailwind, dus
// inline hex uit de gedocumenteerde palette (uitzondering op de token-regel).
const KLEUR = {
  primary: "#152C4E",
  accent: "#E8B547",
  achtergrond: "#FBFAF7",
  kaart: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#6B7280",
};

const TELEFOON = "050 211 26 89";
const TELEFOON_LINK = "tel:0502112689";
// Zelfde nummer als de knop op de site (src/lib/whatsapp.ts): zonder + en zonder 0.
const WHATSAPP_NUMMER = "31502112689";
const FONT_STACK = "'Inter',Arial,sans-serif";
// Kleur per TYPE — het beslissende onderscheid: subsidie = groen (geld dat je
// niet terugbetaalt), lening = staalblauw (geld dat je leent). Bewust géén
// rood/oranje: dat leest als "slecht" tegenover groen, terwijl een lening ook
// prima kan zijn. Blauw naast groen leest als twee neutrale categorieën en is
// de conventiekleur voor financiering. Dit is de enige kleurtaal in de lijst;
// het niveau tonen we als tekstkop, niet als kleur, zodat het rustig blijft.
const SUBSIDIE_KLEUR = "#2E7D5B";
const LENING_KLEUR = "#3A6EA5";
// Heel lichte kaart-achtergrond per type (subtiele tint, versterkt het signaal).
const SUBSIDIE_VLAK = "#F0F6F4";
const LENING_VLAK = "#EEF3F9";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'-]+$/u;
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Zelfde limiet als het berichtveld op het contactformulier. */
const MAX_BERICHT = 1000;

// Bewust dezelfde, ruime nummercheck als de client. Deno kan src/ niet
// importeren, dus dit is een kopie van src/lib/telefoon.ts: pas ze samen aan.
// Wijkt deze af, dan zet de check hieronder een geldig nummer op null en raakt
// de lead zijn telefoonnummer kwijt.
const SCHEIDINGSTEKENS = /[\s.–—/()-]/g;

function validatePhoneNL(raw: string): boolean {
  let n = raw.trim().replace(SCHEIDINGSTEKENS, "");
  if (n.startsWith("00")) n = `+${n.slice(2)}`;
  if (!/^\+?[0-9]+$/.test(n)) return false;
  n = n.replace(/^\+310(?=[0-9])/, "+31");

  if (/^0[0-9]{9}$/.test(n)) return true; // NL nationaal: 06…, 050…, 0592…
  if (/^\+31[1-9][0-9]{8}$/.test(n)) return true; // NL met landcode
  if (/^[1-9][0-9]{8}$/.test(n)) return true; // trunk-nul vergeten
  if (n.startsWith("+31")) return false; // NL van de verkeerde lengte
  return /^\+[1-9][0-9]{7,14}$/.test(n); // overig buitenlands nummer
}

const NIVEAU_VOLGORDE = ["rijk", "provincie", "gemeente", "overig"] as const;
type Niveau = (typeof NIVEAU_VOLGORDE)[number];
const NIVEAU_LABELS: Record<Niveau, string> = {
  rijk: "Rijksoverheid",
  provincie: "Provincie",
  gemeente: "Gemeente",
  overig: "Leningen en overig",
};

// Wit-transparant logo (voor de navy header). Publieke Supabase-storage-URL.
// LET OP: bestandsnamen in de bucket `logos` zijn hoofdlettergevoelig en staan
// hier hardcoded. Hernoem of verwijder je iets in de bucket, pas dan ook deze
// regel aan EN de ~28 <img>-tags in de n8n-mailworkflows van het CRM. Precies
// dat ging mis: het oude bestand verdween en deze mail hield een 400 over.
const LOGO_URL =
  "https://lfelnfukbrxznkevnevr.supabase.co/storage/v1/object/public/logos/Voortraject/voortraject-logo-wit--lageKB.png";

// Iconen in de knoppen en bij de Google-score. Deze staan wél op de website
// (`public/mail/`, meegebouwd door Cloudflare Pages) en niet in de storage-bucket
// hierboven: dan horen ze bij de code die ze gebruikt en gaan ze mee met dezelfde
// PR. Ze zijn 96px voor schermen met een hoge pixeldichtheid en worden op 14-16px
// getoond. LET OP: ze bestaan pas op het moment dat de site gedeployed is —
// deploy de site dus vóór deze function, anders staat er in de mail even een
// gebroken plaatje (de alt-tekst vangt dat op).
const ICOON = {
  whatsapp: "https://voortraject.nl/mail/wa.png",
  telefoon: "https://voortraject.nl/mail/tel.png",
  google: "https://voortraject.nl/mail/google.png",
};

// De check zonder adres, om door te sturen naar buren of familie. De utm-tags
// zijn dezelfde als op de site (zie src/components/subsidiecheck/delen.ts), zodat
// doorgestuurde bezoekers in GA4 onder Bron/Medium terugkomen in plaats van als
// direct verkeer.
const DEEL_URL = "https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=mail";

// (Niveau-kleuren zijn bewust verwijderd: kleur = alleen het type, zie hierboven.)
const TYPE_LABELS: Record<string, string> = { subsidie: "Subsidie", lening: "Lening" };
// Volgorde van de chips op de site; bepaalt ook de volgorde in
// `subsidiecheck_interesses` (niet de klikvolgorde van de bezoeker).
const ALLE_MAATREGELEN = [
  "isolatie",
  "warmtepomp",
  "zonnepanelen",
  "zonneboiler",
  "ventilatie",
  "warmtenet",
  "elektrisch-koken",
  "thuisbatterij",
] as const;
// Bewonertype uit stap 1 van de check. Exact de codes van `Bewonertype` in
// src/lib/subsidies/types.ts (ook de waarden achter `?type=` in de deel-link) en
// exact wat de CHECK op `leads_bewoners.subsidiecheck_type_bewoner` toelaat.
// Deno kan src/ niet importeren, dus dit is een kopie: pas ze samen aan. Iets
// anders dan deze vier laat de insert falen, dus onbekende invoer → NULL.
const BEWONERTYPES = ["woningeigenaar", "huurder", "vve", "verhuurder"] as const;

const MAATREGEL_LABELS: Record<string, string> = {
  isolatie: "Isolatie & glas",
  warmtepomp: "Warmtepomp",
  zonnepanelen: "Zonnepanelen",
  zonneboiler: "Zonneboiler",
  ventilatie: "Ventilatie",
  warmtenet: "Warmtenet-aansluiting",
  "elektrisch-koken": "Elektrisch koken",
  thuisbatterij: "Thuisbatterij",
};

// Simpele best-effort throttle per IP (naast de client-honeypot/timing).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 6;
const rateHits = new Map<string, number[]>();

type Regeling = {
  id?: string;
  titel?: string;
  niveau?: string;
  type?: string;
  aanbieder?: string;
  omschrijving?: string;
  bedragIndicatie?: string;
  bronUrl?: string;
};

type Payload = {
  /**
   * "bericht" = een vraag die de bezoeker op het resultaat stelt. Die vult de
   * notitie aan bij de bestaande lead (`leadId`) en gaat per mail naar het team.
   * Zonder actie: de gewone route (lead + subsidieoverzicht naar de bezoeker).
   */
  actie?: string;
  /** Alleen bij actie "bericht": de vraag zelf. */
  bericht?: string;
  /** Alleen bij actie "bericht": lead uit deze sessie, voorkomt een dubbele lead. */
  leadId?: string;
  /** Kopregel voor `notities`, bijv. de gekozen termijn uit de poort. */
  notitie?: string;
  /** Verrijking uit publieke bronnen (EP-Online, BAG): scheelt het team opzoekwerk. */
  energielabel?: string;
  bouwjaar?: number;
  /**
   * Bewijs van toestemming voor opvolging per mail of telefoon (art. 11.7 lid 2
   * Telecommunicatiewet). `toestemmingTekst` is de letterlijke zin die de
   * bezoeker op dat moment zag, niet een versienummer: verandert de copy later,
   * dan blijft bij oude leads staan waar zíj ja tegen zeiden.
   */
  toestemmingOp?: string;
  toestemmingTekst?: string;
  /** Gesplitste naamvelden (huidige site). */
  voornaam?: string;
  tussenvoegsel?: string;
  achternaam?: string;
  /** Legacy: één naamveld, gestuurd door oude gecachte bundles. */
  naam?: string;
  email?: string;
  telefoon?: string;
  honeypot?: string;
  input?: {
    postcode?: string;
    huisnummer?: string;
    toevoeging?: string;
    bewonertype?: string;
    maatregelen?: string[];
  };
  adres?: { straatnaam?: string; woonplaatsnaam?: string };
  regelingen?: Regeling[];
  /** Deelbare URL van het volledige resultaat op de site (voor de online-link). */
  overzichtUrl?: string;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// Alleen voor de mail-HTML hieronder: escapen hoort bij het renderen. Wat we in
// `leads_bewoners` opslaan blijft onbewerkt — precies wat de bezoeker typte.
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function throttled(ip: string): boolean {
  const nu = Date.now();
  const recent = (rateHits.get(ip) ?? []).filter((t) => nu - t < RATE_WINDOW_MS);
  recent.push(nu);
  rateHits.set(ip, recent);
  return recent.length > RATE_MAX;
}

// ---- E-mail opbouwen ----

function regelingRij(r: Regeling): string {
  const typeKleur = r.type === "lening" ? LENING_KLEUR : SUBSIDIE_KLEUR;
  const typeVlak = r.type === "lening" ? LENING_VLAK : SUBSIDIE_VLAK;
  const typeLabel = TYPE_LABELS[r.type ?? "subsidie"] ?? "Subsidie";
  const titel = escapeHtml(r.titel ?? "Regeling");
  const bedrag = r.bedragIndicatie
    ? `<span style="white-space:nowrap;font-weight:700;font-size:15px;color:${KLEUR.primary};">${escapeHtml(r.bedragIndicatie)}</span>`
    : "";
  const omschrijving = r.omschrijving
    ? `<div style="margin-top:4px;font-size:14px;line-height:1.5;color:${KLEUR.muted};">${escapeHtml(r.omschrijving)}</div>`
    : "";
  const bron =
    r.bronUrl && /^https?:\/\//i.test(r.bronUrl)
      ? `<div style="margin-top:8px;font-size:13px;"><a href="${escapeHtml(r.bronUrl)}" style="color:${KLEUR.primary};font-weight:600;">Meer info &rarr;</a></div>`
      : "";

  // Eén kleur per kaart, bepaald door het TYPE (groen = subsidie, terracotta =
  // lening): de gevulde pill én de 4px linkerrand. Verder neutraal (witte kaart,
  // grijze rand), zodat de lijst rustig blijft.
  return `
    <tr>
      <td style="padding:14px 16px;border:1px solid ${KLEUR.border};border-left:4px solid ${typeKleur};border-radius:8px;background:${typeVlak};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;">
            <span style="display:inline-block;padding:2px 9px;border-radius:999px;background:${typeKleur};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${typeLabel}</span>
          </td>
          <td style="vertical-align:top;text-align:right;padding-left:12px;">${bedrag}</td>
        </tr></table>
        <div style="margin-top:6px;font-size:16px;font-weight:700;line-height:1.35;color:${KLEUR.primary};">${titel}</div>
        ${omschrijving}
        ${bron}
      </td>
    </tr>
    <tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`;
}

function groepBlok(niveau: Niveau, regelingen: Regeling[]): string {
  if (regelingen.length === 0) return "";
  const rijen = regelingen.map(regelingRij).join("");
  return `
    <tr><td style="padding:18px 0 10px;">
      <span style="font-size:16px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${KLEUR.primary};">${NIVEAU_LABELS[niveau]}</span>
      <span style="font-size:14px;color:${KLEUR.muted};"> &middot; ${regelingen.length}</span>
    </td></tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rijen}</table>
    </td></tr>`;
}

// Eén legenda-item: gekleurde stip + aantal + label ("● 6 subsidies").
function legendaItem(aantal: number, label: string, kleur: string): string {
  return `<span style="font-size:14px;color:${KLEUR.primary};font-weight:600;white-space:nowrap;"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${kleur};margin-right:7px;vertical-align:middle;"></span>${aantal} ${label}</span>`;
}

// Hero-samenvatting bovenaan (de "piek"), in één omkaderd kaartje zodat het als
// één rustig object leest i.p.v. los tekst op de witte achtergrond. Groot totaal
// + een verhoudingsbalk die de mix subsidies/leningen in één oogopslag toont
// (geen los optelwerk), met een legenda eronder. De per-niveau telling laten we
// hier weg — die komt direct eronder al terug als groepskoppen (dubbel =
// rommelig). Staat vóór de lijst, zodat de kernboodschap altijd zichtbaar is.
function bouwSamenvattingBlok(regelingen: Regeling[]): string {
  const totaal = regelingen.length;
  const leningen = regelingen.filter((r) => r.type === "lening").length;
  const subsidies = totaal - leningen;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";

  // Verhoudingsbalk: groen segment (subsidies) + blauw segment (leningen). Het
  // groene deel rondt af, het blauwe krijgt de rest zodat de som exact 100% is.
  const groenPct = totaal > 0 ? Math.round((subsidies / totaal) * 100) : 0;
  const blauwPct = 100 - groenPct;
  const segment = (pct: number, kleur: string) =>
    pct > 0 ? `<td width="${pct}%" style="background:${kleur};height:12px;line-height:12px;font-size:0;">&nbsp;</td>` : "";
  const balk = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:7px;overflow:hidden;">
      <tr>${segment(groenPct, SUBSIDIE_KLEUR)}${segment(blauwPct, LENING_KLEUR)}</tr>
    </table>`;

  // Legenda: alleen de types die er zijn.
  const legenda = [
    subsidies > 0 ? legendaItem(subsidies, subsidies === 1 ? "subsidie" : "subsidies", SUBSIDIE_KLEUR) : "",
    leningen > 0 ? legendaItem(leningen, leningen === 1 ? "lening" : "leningen", LENING_KLEUR) : "",
  ]
    .filter(Boolean)
    .join(`<span style="display:inline-block;width:18px;"></span>`);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${KLEUR.achtergrond};border:1px solid #EAE4D8;border-radius:14px;overflow:hidden;">
      <tr><td style="height:4px;background:${KLEUR.accent};line-height:4px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:22px 24px;">
        <div style="font-size:13px;font-weight:600;color:${KLEUR.muted};margin:0 0 3px;">We vonden voor jouw woning</div>
        <div style="line-height:1;margin:0 0 16px;">
          <span style="font-size:46px;font-weight:800;color:${KLEUR.primary};">${totaal}</span>
          <span style="font-size:20px;font-weight:700;color:${KLEUR.primary};">&nbsp;${meervoud}</span>
        </div>
        ${balk}
        <div style="margin-top:12px;">${legenda}</div>
      </td></tr>
    </table>`;
}

// De uitspraak over de woningvoorraad bij dit bouwjaar — dezelfde tekst als "de
// eerste stap" op het resultaat. Zie src/components/subsidiecheck/eersteStapTekst.ts
// voor de bronnen (Milieu Centraal) en de grenzen 1975/1992. Bewust gedupliceerd:
// een edge function draait op Deno en kan niets uit src/ importeren. Wijzigt de
// tekst daar, dan hier mee — src/test/eersteStap.test.ts bewaakt dat.
//
// De regel die alles stuurt: nooit een uitspraak over dít huis, alleen over
// woningen uit die bouwperiode. Wat er sindsdien is gedaan weten we niet.
function eersteStapZin(bouwjaar: number | null): string | null {
  if (!bouwjaar || bouwjaar < 1500 || bouwjaar > new Date().getFullYear()) return null;
  const opening = `Jouw huis is uit ${bouwjaar}.`;
  if (bouwjaar >= 1992) {
    return `${opening} Woningen uit die tijd kregen bij de bouw al redelijke isolatie mee. De winst zit dan meestal niet in de schil maar in verwarming en opwek.`;
  }
  const kern =
    bouwjaar >= 1975
      ? "Woningen uit die jaren kregen bij de bouw een dunne laag isolatie, naar de maatstaven van nu bescheiden."
      : "Woningen uit die tijd kregen bij de bouw geen isolatie mee.";
  return `${opening} ${kern} Wat er daarna is gedaan verschilt per woning.`;
}

function bouwEmailHtml(opts: {
  /** Volledige aanhefregel zonder komma, bijv. "Hallo Jan" of "Beste heer/mevrouw De Vries". */
  aanhef: string;
  adresregel: string;
  regelingen: Regeling[];
  overzichtUrl?: string;
  /** Bouwjaar uit de BAG; ontbreekt het, dan blijft de woningvoorraad-zin weg. */
  bouwjaar?: number | null;
  /** Onze echte Google-score; weglaten = geen bewijsregel in de mail. */
  beoordeling?: { score: string; aantal: number | null };
}): string {
  const { aanhef, adresregel, regelingen, overzichtUrl, bouwjaar, beoordeling } = opts;
  const bouwjaarZin = eersteStapZin(bouwjaar ?? null);
  // WhatsApp met het adres al in het bericht: de ontvanger hoeft alleen nog zijn
  // vraag te typen, en wij weten meteen waar het over gaat.
  const waLink = `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(
    `Hallo, ik heb het subsidieoverzicht voor ${adresregel} ontvangen. Ik heb daar een vraag over:`,
  )}`;
  // Binnen een niveaugroep eerst de subsidies, dan de leningen (stabiele sort,
  // dus bronvolgorde binnen één type blijft). Zelfde ordening als de website.
  const typeRang = (t?: string) => (t === "lening" ? 1 : 0);
  const groepen = NIVEAU_VOLGORDE.map((niveau) =>
    groepBlok(
      niveau,
      regelingen
        .filter((r) => (r.niveau ?? "overig") === niveau)
        .sort((a, b) => typeRang(a.type) - typeRang(b.type)),
    ),
  ).join("");

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>Voortraject - Jouw subsidieoverzicht</title></head>
<body style="margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${KLEUR.achtergrond};padding:32px 16px;font-family:${FONT_STACK};">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${KLEUR.kaart};border-radius:12px;overflow:hidden;">

        <!-- Header: gecentreerd wit logo op navy. De linear-gradient is een
             dark-mode-slot: Gmail herkleurt effen achtergrondkleuren in dark
             mode (navy wordt lila), maar laat achtergrond-gradients met rust. -->
        <tr><td style="background-color:${KLEUR.primary};background-image:linear-gradient(${KLEUR.primary},${KLEUR.primary});padding:32px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="voortraject" width="216" height="60" style="height:60px;width:216px;display:inline-block;border:0;outline:none;text-decoration:none;color:#FFFFFF;font-size:24px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px;color:${KLEUR.primary};line-height:1.6;">
          <p style="font-size:16px;margin:0 0 20px;">${escapeHtml(aanhef)},</p>
          <p style="font-size:16px;margin:0 0 20px;">Hier is je persoonlijke subsidieoverzicht voor <strong>${escapeHtml(adresregel)}</strong>.</p>

          ${bouwSamenvattingBlok(regelingen)}
          ${
            // Hieronder stond nog een alinea: "Dat is meer dan de meeste mensen
            // denken. Je hoeft niets te kiezen: veel regelingen zijn te
            // combineren, en wij zoeken gratis voor je uit welke voor jouw
            // woning het meeste opleveren." Eruit op verzoek: het aanbod om mee
            // te kijken staat verderop al in het adviesblok, en hier stond het
            // tussen de uitkomst en de lijst in.
            bouwjaarZin
              ? `<p style="font-size:15px;margin:0 0 20px;line-height:1.6;">${escapeHtml(bouwjaarZin)}</p>`
              : ""
          }
          ${
            overzichtUrl
              ? `<p style="text-align:center;margin:0 0 24px;font-size:14px;"><a href="${escapeHtml(overzichtUrl)}" style="color:${KLEUR.primary};font-weight:600;text-decoration:none;">Bekijk of deel je volledige overzicht online &rarr;</a></p>`
              : ""
          }

          <!-- De belofte: het volledige overzicht in de mail — alle subsidies en
               leningen per niveau onder elkaar. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">${groepen}</table>

          <!-- Scheidslijn: markeert het einde van de regelingenlijst en de
               overgang naar het advies-blok. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
            <tr><td style="border-top:1px solid ${KLEUR.border};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
          </table>

          <!-- Conversie-blok in huisstijl (oker linkerrand). Bewust dezelfde
               drempelloze routes als op het resultaat: antwoorden op deze mail
               (het antwoordadres is info@voortraject.nl), WhatsApp met het adres
               al ingevuld, of bellen. Vroeger stond hier één knop naar /contact,
               een leeg formulier dat de bezoeker al een keer had ingevuld.

               De twee knoppen stonden eerder met hun volle tekst naast elkaar
               ("Stel je vraag via WhatsApp" en "Bel 050 211 26 89"). In de
               mail-app op een telefoon is de kolom nog geen 300px breed, dus
               brak élk label over twee of drie regels en werd het blok een
               kluwen. Nu: één woord per knop plus een icoon, met nowrap, zodat
               ze gegarandeerd naast elkaar op één regel passen. Het nummer is
               niet verdwenen — het staat voluit in de voettekst. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;background:${KLEUR.achtergrond};border-left:4px solid ${KLEUR.accent};border-radius:4px;">
            <tr><td style="padding:20px 24px;">
              <p style="font-size:15px;font-weight:700;color:${KLEUR.primary};margin:0 0 6px;">Gratis advies over jouw overzicht</p>
              <p style="font-size:14px;color:${KLEUR.muted};margin:0 0 16px;line-height:1.6;"><strong style="color:${KLEUR.primary};font-weight:600;">Antwoord op deze mail</strong> met je vraag, of stuur een WhatsApp-bericht. Een van onze adviseurs kijkt dan naar jouw adres. Gratis en vrijblijvend, reactie binnen 24 uur.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="padding-right:10px;">
                  <a href="${escapeHtml(waLink)}" style="display:inline-block;background:${KLEUR.accent};color:${KLEUR.primary};font-size:14px;font-weight:700;text-decoration:none;padding:11px 16px;border-radius:8px;white-space:nowrap;"><img src="${ICOON.whatsapp}" alt="" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;border:0;"> &nbsp;WhatsApp</a>
                </td>
                <td>
                  <a href="${TELEFOON_LINK}" style="display:inline-block;border:1px solid ${KLEUR.primary};color:${KLEUR.primary};font-size:14px;font-weight:700;text-decoration:none;padding:10px 15px;border-radius:8px;white-space:nowrap;"><img src="${ICOON.telefoon}" alt="" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;border:0;"> &nbsp;Bel ons</a>
                </td>
              </tr></table>
              ${
                beoordeling
                  ? // "op Google" wordt het Google-logo zelf. Blokkeert de mail-app
                    // afbeeldingen (Outlook doet dat standaard), dan valt de alt-tekst
                    // "Google" op precies dezelfde plek in — de regel blijft dus in elk
                    // geval leesbaar.
                    `<p style="font-size:13px;color:${KLEUR.muted};margin:14px 0 0;">&#9733;&#9733;&#9733;&#9733;&#9733; <strong style="color:${KLEUR.primary};">${beoordeling.score}</strong> op <img src="${ICOON.google}" alt="Google" width="14" height="14" style="width:14px;height:14px;vertical-align:-2px;border:0;">${beoordeling.aantal ? ` &middot; ${beoordeling.aantal} reviews` : ""}</p>`
                  : ""
              }
            </td></tr>
          </table>

          <!-- Doorgeven aan de buren. De mail is het enige stuk van de check dat
               buiten het scherm van de bezoeker voortleeft: hij wordt bewaard en
               doorgestuurd. Dan hoort er ook een link in te staan waarmee de
               ontvanger zijn éígen adres kan invullen — de rest van deze mail
               gaat over één huis. -->
          <p style="font-size:14px;color:${KLEUR.muted};margin:20px 0 0;line-height:1.6;">Ken je iemand die dit ook moet doen? Huizen uit dezelfde tijd komen vaak voor dezelfde regelingen in aanmerking. Stuur ze <a href="${DEEL_URL}" style="color:${KLEUR.primary};font-weight:600;">de check voor hun eigen adres</a>.</p>

          <p style="font-size:16px;margin:24px 0 4px;">Met vriendelijke groet,</p>
          <p style="font-size:16px;margin:0;font-weight:600;">Team Voortraject</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${KLEUR.achtergrond};padding:24px 32px;text-align:center;border-top:1px solid ${KLEUR.border};">
          <p style="font-size:12px;color:${KLEUR.muted};margin:0 0 8px;line-height:1.6;font-style:italic;">Dit overzicht is een indicatie op basis van de Energiesubsidiewijzer, in samenwerking met voorlichtingsorganisatie Milieu Centraal, en jouw postcode. Aan de bedragen en voorwaarden kunnen geen rechten worden ontleend.</p>
          <p style="font-size:12px;color:${KLEUR.muted};margin:0;line-height:1.6;"><strong style="color:${KLEUR.primary};">Voortraject</strong><br>Vragen? Bel <a href="${TELEFOON_LINK}" style="color:${KLEUR.muted};">${TELEFOON}</a> of reageer op deze mail.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Teammail bij een vraag van de bezoeker. Bewust kaal en informatief: dit is een
// werkmail, geen marketing. Het antwoordadres van deze mail is de bezoeker zelf,
// dus "beantwoorden" komt meteen bij de juiste persoon uit.
function bouwTeamMailHtml(opts: {
  naam: string;
  email: string;
  telefoon: string | null;
  adresregel: string;
  bericht: string;
  interesses: string;
  overzichtUrl?: string;
  nieuweLead: boolean;
}): string {
  const { naam, email, telefoon, adresregel, bericht, interesses, overzichtUrl, nieuweLead } = opts;
  // Kale opmaak, geen huisstijlkaart: dit is een werkmail voor het team zelf. Wel
  // vetgedrukte labels, zodat je in één blik ziet wie het is en wat de vraag is.
  const regel = (label: string, waarde: string) => `<p style="margin:0 0 4px;"><strong>${label}:</strong> ${waarde}</p>`;

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><title>Vraag via de subsidietool</title></head>
<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222;">
  <p style="margin:0 0 12px;"><strong style="font-size:17px;">Vraag via de subsidietool</strong></p>

  ${regel("Naam", escapeHtml(naam))}
  ${regel("Adres", escapeHtml(adresregel || "onbekend"))}
  ${regel("E-mail", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`)}
  ${telefoon ? regel("Telefoon", `<a href="tel:${escapeHtml(telefoon)}">${escapeHtml(telefoon)}</a>`) : regel("Telefoon", "niet opgegeven")}
  ${interesses ? regel("Interesses", escapeHtml(interesses)) : ""}

  <p style="margin:16px 0 4px;"><strong>Vraag:</strong></p>
  <p style="margin:0;white-space:pre-wrap;">${escapeHtml(bericht)}</p>

  ${
    overzichtUrl
      ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(overzichtUrl)}">Bekijk het overzicht dat deze bezoeker zag</a></p>`
      : ""
  }

  <p style="margin:16px 0 0;font-size:13px;color:#666;">
    ${nieuweLead ? "Er is een nieuwe lead aangemaakt in het CRM." : "De vraag staat ook bij de notities van de bestaande lead in het CRM."}
    Antwoorden op deze mail gaat rechtstreeks naar de bezoeker.
  </p>
</body></html>`;
}

async function verstuurMail(opts: {
  apiKey: string;
  from: string;
  to: string;
  bcc?: string;
  replyTo: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const body: Record<string, unknown> = {
    from: opts.from,
    to: [opts.to],
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.bcc) body.bcc = [opts.bcc];

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("Resend-fout", res.status, await res.text());
    return false;
  }
  return true;
}

// Schrijft de lead weg en geeft het nieuwe id terug. De verrijkingskolommen
// (energielabel, bouwjaar) zijn een extraatje: weigert het CRM er een, bijvoorbeeld
// door een CHECK die een labelvorm niet kent, dan proberen we het één keer opnieuw
// zonder die velden. Een lead verliezen om een extraatje mag nooit.
// Alleen het stukje client dat we hier gebruiken; het echte type komt uit een
// Deno-import die de eslint-config van de site niet kent.
type LeadClient = {
  from: (tabel: string) => {
    insert: (rij: Record<string, unknown>) => {
      select: (kolommen: string) => {
        maybeSingle: () => Promise<{ data: { id?: unknown } | null; error: unknown }>;
      };
    };
  };
};

async function insertLead(supabase: LeadClient, basis: Record<string, unknown>, verrijking: Record<string, unknown>) {
  const eerste = await supabase
    .from("leads_bewoners")
    .insert({ ...basis, ...verrijking })
    .select("id")
    .maybeSingle();
  if (!eerste.error || Object.keys(verrijking).length === 0) return eerste;

  console.error("Lead-insert faalde mét verrijking, opnieuw zonder", eerste.error);
  return await supabase.from("leads_bewoners").insert(basis).select("id").maybeSingle();
}

// Onze echte Google-beoordeling uit de tabel die `sync-google-reviews` bijhoudt,
// dezelfde bron als de score op de site. Faalt de query of ontbreekt de rij, dan
// komt er geen bewijsregel in de mail. Liever niets dan een verzonnen cijfer, en
// een hapering hier mag de mail nooit tegenhouden.
type StatsClient = {
  from: (tabel: string) => {
    select: (kolommen: string) => {
      eq: (
        kolom: string,
        waarde: number,
      ) => { maybeSingle: () => Promise<{ data: { rating?: unknown; user_rating_count?: unknown } | null; error: unknown }> };
    };
  };
};

async function haalBeoordeling(supabase: StatsClient): Promise<{ score: string; aantal: number | null } | undefined> {
  try {
    const { data, error } = await supabase
      .from("google_place_stats")
      .select("rating, user_rating_count")
      .eq("id", 1)
      .maybeSingle();
    if (error || typeof data?.rating !== "number") return undefined;
    return {
      score: data.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      aantal: typeof data.user_rating_count === "number" ? data.user_rating_count : null,
    };
  } catch {
    return undefined;
  }
}

// ---- Handler ----

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Alleen POST" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "onbekend";
  if (throttled(ip)) return json({ error: "Te veel verzoeken. Probeer het later opnieuw." }, 429);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400);
  }

  // Honeypot: stil "gelukt" teruggeven zodat bots geen signaal krijgen.
  if (payload.honeypot && payload.honeypot.trim() !== "") return json({ ok: true, mailed: false });

  // Naamvelden: de site stuurt voornaam/tussenvoegsel/achternaam; de database-
  // trigger stelt daar zelf `naam` uit samen. Oude gecachte bundles sturen nog
  // één `naam` — die terugval kan weg zodra `naam` een generated column wordt.
  // Streng op de verplichte achternaam; mild op de optionele delen (ongeldig →
  // weglaten) zodat een lead nooit verloren gaat.
  const voornaamRuw = (payload.voornaam ?? "").trim();
  const voornaam = voornaamRuw && voornaamRuw.length <= 100 && NAME_RE.test(voornaamRuw) ? voornaamRuw : null;
  const tussenvoegselRuw = (payload.tussenvoegsel ?? "").trim();
  const tussenvoegsel =
    tussenvoegselRuw && tussenvoegselRuw.length <= 25 && NAME_RE.test(tussenvoegselRuw) ? tussenvoegselRuw : null;
  const achternaam = (payload.achternaam ?? "").trim();
  const legacyNaam = (payload.naam ?? "").trim();
  if (achternaam) {
    if (achternaam.length < 2 || achternaam.length > 100 || !NAME_RE.test(achternaam)) {
      return json({ error: "Vul een geldige achternaam in." }, 400);
    }
  } else if (legacyNaam.length < 2 || legacyNaam.length > 100 || !NAME_RE.test(legacyNaam)) {
    return json({ error: "Vul een geldige naam in." }, 400);
  }
  // Mail-aanhef (weergave; de database houdt de invoer zoals getypt):
  //   met voornaam    → "Hallo Jan" (informele je-toon van de subsidiecheck)
  //   zonder voornaam → "Beste heer/mevrouw Van der Berg" (geslacht wordt niet
  //     uitgevraagd, dus de gecombineerde nette vorm; tussenvoegsel krijgt een
  //     hoofdletter omdat er geen voornaam voor staat: "meneer De Vries")
  //   legacy (één naamveld) → "Hallo {naam}" zoals voorheen
  const capEerste = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  let aanhef: string;
  if (achternaam) {
    aanhef = voornaam
      ? `Hallo ${capEerste(voornaam)}`
      : `Beste heer/mevrouw ${[tussenvoegsel ? capEerste(tussenvoegsel) : "", capEerste(achternaam)].filter(Boolean).join(" ")}`;
  } else {
    aanhef = `Hallo ${legacyNaam}`;
  }

  const email = (payload.email ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 255) {
    return json({ error: "Dit lijkt geen geldig e-mailadres." }, 400);
  }
  // De client vraagt het telefoonnummer verplicht op; serverside blijven we
  // mild (bij ontbreken/ongeldig → null) zodat een lead nooit verloren gaat.
  const telefoonRuw = (payload.telefoon ?? "").trim();
  const telefoon = telefoonRuw && validatePhoneNL(telefoonRuw) ? telefoonRuw : null;

  const input = payload.input ?? {};
  const adres = payload.adres ?? {};
  const postcode = normalizePostcode(input.postcode ?? "");
  if (!POSTCODE_RE.test(postcode)) return json({ error: "Ongeldige postcode." }, 400);

  // Kap de lijst af tegen misbruik; behoud de volgorde.
  const regelingen = Array.isArray(payload.regelingen) ? payload.regelingen.slice(0, 60) : [];
  const maatregelen = Array.isArray(input.maatregelen) ? input.maatregelen : [];

  const straat = (adres.straatnaam ?? "").trim();
  const stad = (adres.woonplaatsnaam ?? "").trim();
  const huisnummer = (input.huisnummer ?? "").trim();
  const toevoeging = (input.toevoeging ?? "").trim();
  const adresregel =
    [straat, huisnummer].filter(Boolean).join(" ") + (toevoeging ? ` ${toevoeging}` : "") + (stad ? `, ${stad}` : "");

  // `gewenste_maatregelen` raken we niet aan; de aangevinkte onderwerpen gaan
  // als platte tekst naar `subsidiecheck_interesses`, in de volgorde van de
  // chips op de site — bijv. "Isolatie & glas, Warmtepomp, Thuisbatterij".
  const interesses = ALLE_MAATREGELEN.filter((m) => maatregelen.includes(m))
    .map((m) => MAATREGEL_LABELS[m])
    .join(", ");

  // Bewonertype gaat naar de eigen kolom. Mild bij onbekende of ontbrekende
  // invoer (→ null, kolom valt weg): de CHECK zou een andere waarde weigeren en
  // dan raken we de hele lead kwijt.
  const typeBewoner = BEWONERTYPES.find((t) => t === input.bewonertype) ?? null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Nieuwe pad: de drie losse delen (kolom `naam` vult de trigger). Legacy pad
  // (oude bundle, alleen `naam`): schrijf zoals voorheen de ene kolom.
  const naamVelden = achternaam
    ? {
        voornaam: voornaam || null,
        tussenvoegsel: tussenvoegsel || null,
        achternaam,
      }
    : { naam: legacyNaam };

  // Verrijking uit publieke bronnen. Mild valideren: onbruikbare invoer laten we
  // gewoon weg, want dit is een extraatje en mag nooit een lead kosten.
  const labelRuw = (payload.energielabel ?? "").trim().toUpperCase();
  const energielabel = /^[A-G]\+{0,5}$/.test(labelRuw) ? labelRuw : null;
  const bouwjaarRuw = Number(payload.bouwjaar);
  const bouwjaar =
    Number.isInteger(bouwjaarRuw) && bouwjaarRuw > 1000 && bouwjaarRuw <= new Date().getFullYear() + 5
      ? bouwjaarRuw
      : null;
  const verrijking: Record<string, string | number> = {};
  if (energielabel) verrijking.energielabel = energielabel;
  if (bouwjaar) verrijking.bouwjaar = bouwjaar;

  // Toestemming voor opvolging. Rijdt mee op `verrijking` en dus op dezelfde
  // terugval: weigert het CRM deze kolommen, dan valt de insert terug op de
  // basisvelden en gaat de lead gewoon door. Dat was ooit onschadelijk omdat het
  // bewijs ook als regel in `notities` stond; die dubbeling is er sinds
  // 2026-08-10 uit (de kolommen bestaan en vullen aantoonbaar). Gaat dit pad nu
  // aan, dan is het bewijs weg — zie de console.error in insertLead.
  //
  // Alleen een echte ISO-datum wordt overgenomen: een onzinwaarde in een
  // timestamptz-kolom laat de hele insert falen, en dan kost een detail een lead.
  const toestemmingOp = typeof payload.toestemmingOp === "string" ? Date.parse(payload.toestemmingOp) : NaN;
  const toestemmingTekst = (payload.toestemmingTekst ?? "").trim().slice(0, MAX_BERICHT);
  if (Number.isFinite(toestemmingOp) && toestemmingTekst) {
    verrijking.toestemming_op = new Date(toestemmingOp).toISOString();
    verrijking.toestemming_tekst = toestemmingTekst;
  }

  // Kopregel voor `notities` (bijv. "Wil aan de slag: Binnen 3 maanden").
  const notitie = (payload.notitie ?? "").trim().slice(0, MAX_BERICHT) || null;

  // Vaste kolommen van een subsidietool-lead. Gedeeld door de gewone route en de
  // berichtroute, zodat een lead er in beide gevallen identiek uitziet.
  const leadVelden = {
    tenant_id: TENANT_ID,
    ...naamVelden,
    email,
    telefoon,
    postcode,
    huisnummer,
    toevoeging: toevoeging || null,
    straat,
    stad,
    subsidiecheck_interesses: interesses,
    subsidiecheck_type_bewoner: typeBewoner,
    formulier: "subsidietool",
    bron: "Voortraject",
    status: "nieuw",
  };

  const volledigeNaam = [voornaam, tussenvoegsel, achternaam].filter(Boolean).join(" ") || legacyNaam;
  const teamAdres = Deno.env.get("MAIL_TEAM") || Deno.env.get("MAIL_BCC") || DEFAULT_REPLY_TO;
  const overzichtUrlSchoon =
    typeof payload.overzichtUrl === "string" && /^https?:\/\//i.test(payload.overzichtUrl)
      ? payload.overzichtUrl
      : undefined;

  // ---- Route "bericht": een vraag die de bezoeker op het resultaat stelt ----
  // De vraag komt in `notities` op de lead en gaat per mail naar het team. Kwam de
  // bezoeker net door de gegevens-poort, dan hebben we zijn lead-id en vullen we
  // die lead aan; anders maken we er alsnog een. Een dubbele lead is vervelend,
  // een verloren vraag is erger.
  if (payload.actie === "bericht") {
    const bericht = (payload.bericht ?? "").trim();
    if (!bericht) return json({ error: "Vul je vraag in." }, 400);
    if (bericht.length > MAX_BERICHT) return json({ error: "Je vraag is te lang." }, 400);

    const leadId = typeof payload.leadId === "string" && UUID_RE.test(payload.leadId) ? payload.leadId : null;
    let nieuweLead = true;

    try {
      if (leadId) {
        // Bijwerken mag alleen als id én e-mailadres bij elkaar horen. Een uuid
        // raden is al onbegonnen werk; het bijpassende e-mailadres raden maakt
        // schrijven bij een vreemde lead praktisch onmogelijk.
        const { data: bestaand, error: leesFout } = await supabase
          .from("leads_bewoners")
          .select("id, notities")
          .eq("id", leadId)
          .eq("tenant_id", TENANT_ID)
          .eq("email", email)
          .maybeSingle();
        if (leesFout) console.error("Lead ophalen faalde", leesFout);
        if (bestaand) {
          // Aanvullen, nooit overschrijven: er kan al een eerdere vraag staan.
          const bestaandeNotitie = (bestaand.notities ?? "").trim();
          const notities = bestaandeNotitie ? `${bestaandeNotitie}\n\n${bericht}` : bericht;
          const { error: updateFout } = await supabase
            .from("leads_bewoners")
            .update({ notities })
            .eq("id", bestaand.id);
          if (updateFout) throw updateFout;
          nieuweLead = false;
        }
      }

      if (nieuweLead) {
        // Geen bestaande lead: alles wat we van deze bezoeker weten in één keer,
        // met de termijn (indien meegestuurd) boven de vraag.
        const notities = [notitie, bericht].filter(Boolean).join("\n");
        const { error } = await insertLead(supabase, { ...leadVelden, notities }, verrijking);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Vraag opslaan faalde", err);
      return json({ error: "Er ging iets mis. Probeer het later opnieuw." }, 500);
    }

    // Mail naar het team (de vraag staat al veilig in het CRM).
    const apiKeyTeam = Deno.env.get("RESEND_API_KEY");
    let mailed = false;
    if (apiKeyTeam) {
      mailed = await verstuurMail({
        apiKey: apiKeyTeam,
        from: Deno.env.get("MAIL_FROM") ?? DEFAULT_FROM,
        to: teamAdres,
        // Antwoorden gaat rechtstreeks naar de bezoeker.
        replyTo: email,
        subject: `Vraag via subsidietool: ${adresregel || postcode}`,
        html: bouwTeamMailHtml({
          naam: volledigeNaam,
          email,
          telefoon,
          adresregel,
          bericht,
          interesses,
          overzichtUrl: overzichtUrlSchoon,
          nieuweLead,
        }),
      });
    } else {
      console.warn("RESEND_API_KEY ontbreekt — vraag opgeslagen, geen teammail verstuurd.");
    }

    return json({ ok: true, mailed, nieuweLead });
  }

  let leadId: string | null = null;
  try {
    // `notities` bevat hooguit de kopregel uit de poort (bijv. de termijn waarop
    // de bewoner aan de slag wil); een latere vraag komt er via route "bericht"
    // onder. Het id gaat terug naar de site, zodat die vraag bij déze lead landt
    // in plaats van een tweede aan te maken.
    const { data: nieuweLead, error } = await insertLead(supabase, { ...leadVelden, notities: notitie }, verrijking);
    if (error) throw error;
    leadId = typeof nieuweLead?.id === "string" ? nieuweLead.id : null;
  } catch (err) {
    console.error("Lead-insert faalde", err);
    return json({ error: "Er ging iets mis. Probeer het later opnieuw." }, 500);
  }

  // 2) E-mail versturen (bonus — lead staat al veilig).
  const apiKey = Deno.env.get("RESEND_API_KEY");
  let mailed = false;
  if (apiKey) {
    const html = bouwEmailHtml({
      aanhef,
      adresregel: adresregel || "jouw woning",
      regelingen,
      overzichtUrl: overzichtUrlSchoon,
      // Zelfde bouwjaar dat als verrijking bij de lead gaat (BAG, via de site).
      bouwjaar,
      beoordeling: await haalBeoordeling(supabase),
    });
    mailed = await verstuurMail({
      apiKey,
      from: Deno.env.get("MAIL_FROM") ?? DEFAULT_FROM,
      to: email,
      bcc: Deno.env.get("MAIL_BCC") || undefined,
      replyTo: Deno.env.get("MAIL_REPLY_TO") ?? DEFAULT_REPLY_TO,
      subject: `Je subsidieoverzicht: ${regelingen.length} ${regelingen.length === 1 ? "regeling" : "regelingen"} voor je woning`,
      html,
    });
  } else {
    console.warn("RESEND_API_KEY ontbreekt — lead opgeslagen, geen automatische mail verstuurd.");
  }

  // ok:true zolang de lead is opgeslagen; het team volgt op als de mail faalde.
  // `leadId` mag null zijn: de site gebruikt het alleen om een latere vraag aan
  // deze lead te koppelen en valt anders terug op een nieuwe lead.
  return json({ ok: true, mailed, leadId });
});
