// Supabase Edge Function: subsidiecheck-mail
//
// De zachte conversieroute "Mail mij dit overzicht". Doet twee dingen serverside:
//   1. schrijft de lead naar `leads_bewoners` in het CRM-project (via
//      service_role — dezelfde tabel/kolommen als het contactformulier, alleen
//      bron: "Subsidiecheck"), en
//   2. stuurt de bezoeker het gevonden subsidieoverzicht per e-mail via Resend
//      (API-key blijft server-side geheim), met een kopie naar het team.
//
// De lead-insert gaat eerst en is leidend: een hapering bij Resend mag nooit een
// lead verliezen. Faalt de mail, dan staat de lead er nog en volgt het team op
// (de UI belooft "we sturen het overzicht"; dat blijft waar).
//
// Benodigde secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   — API-key van resend.com (verplicht voor automatische mail)
//   MAIL_FROM        — afzender, bijv. "Voortraject <noreply@voortraject.nl>"
//                      (moet een geverifieerd domein in Resend zijn)
//   MAIL_BCC         — optioneel, teamkopie, bijv. "info@voortraject.nl"
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

// Zelfde NL-nummercheck als de client: 0xxxxxxxxx of +31xxxxxxxxx.
function validatePhoneNL(raw: string): boolean {
  const cleaned = raw.replace(/[\s-]/g, "");
  if (!/^[+0-9]+$/.test(cleaned)) return false;
  return /^0[0-9]{9}$/.test(cleaned) || /^\+31[0-9]{9}$/.test(cleaned);
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
const LOGO_URL =
  "https://lfelnfukbrxznkevnevr.supabase.co/storage/v1/object/public/logos/Logo%20Voortraject%20Wit%20Transparant_Cropped.png";

// (Niveau-kleuren zijn bewust verwijderd: kleur = alleen het type, zie hierboven.)
const TYPE_LABELS: Record<string, string> = { subsidie: "Subsidie", lening: "Lening" };
const BEWONERTYPE_LABELS: Record<string, string> = {
  woningeigenaar: "Woningeigenaar",
  huurder: "Huurder",
  vve: "VvE",
  verhuurder: "Verhuurder",
};
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

function bouwEmailHtml(opts: {
  /** Volledige aanhefregel zonder komma, bijv. "Hallo Jan" of "Beste heer/mevrouw De Vries". */
  aanhef: string;
  adresregel: string;
  regelingen: Regeling[];
  siteBasis: string;
  overzichtUrl?: string;
}): string {
  const { aanhef, adresregel, regelingen, siteBasis, overzichtUrl } = opts;
  const subsidies = regelingen.filter((r) => r.type !== "lening").length;
  const goedNieuws = regelingen.length >= 3 && subsidies >= 1;
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
          <img src="${LOGO_URL}" alt="Voortraject" style="height:60px;display:inline-block;border:0;">
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px;color:${KLEUR.primary};line-height:1.6;">
          <p style="font-size:16px;margin:0 0 20px;">${escapeHtml(aanhef)},</p>
          <p style="font-size:16px;margin:0 0 20px;">Hier is je persoonlijke subsidieoverzicht voor <strong>${escapeHtml(adresregel)}</strong>.</p>

          ${bouwSamenvattingBlok(regelingen)}
          <p style="font-size:15px;margin:0 0 20px;line-height:1.6;">${goedNieuws ? "Dat is meer dan de meeste mensen denken. " : ""}Je hoeft niets te kiezen: veel regelingen zijn te combineren, en wij zoeken gratis voor je uit welke voor jouw woning het meeste opleveren.</p>
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

          <!-- Conversie-blok in huisstijl (oker linkerrand) -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;background:${KLEUR.achtergrond};border-left:4px solid ${KLEUR.accent};border-radius:4px;">
            <tr><td style="padding:20px 24px;">
              <p style="font-size:15px;font-weight:700;color:${KLEUR.primary};margin:0 0 6px;">Gratis advies: wij zoeken het voor je uit</p>
              <p style="font-size:14px;color:${KLEUR.muted};margin:0 0 16px;line-height:1.6;">Subsidies stapelen is ingewikkeld. In een gratis en vrijblijvend gesprek kijken we voor jouw adres welke regelingen je kunt combineren en helpen we je op weg met de aanvraag. Reactie binnen 24 uur.</p>
              <a href="${escapeHtml(siteBasis)}/contact" style="display:inline-block;background:${KLEUR.accent};color:${KLEUR.primary};font-size:15px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px;">Plan een gratis gesprek</a>
            </td></tr>
          </table>

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
  const bewonertype = input.bewonertype ?? "woningeigenaar";
  const maatregelen = Array.isArray(input.maatregelen) ? input.maatregelen : [];

  const straat = (adres.straatnaam ?? "").trim();
  const stad = (adres.woonplaatsnaam ?? "").trim();
  const huisnummer = (input.huisnummer ?? "").trim();
  const toevoeging = (input.toevoeging ?? "").trim();
  const adresregel =
    [straat, huisnummer].filter(Boolean).join(" ") + (toevoeging ? ` ${toevoeging}` : "") + (stad ? `, ${stad}` : "");

  // 1) Lead opslaan (leidend — nooit verliezen).
  const notities = [
    `Subsidiecheck ingevuld: ${regelingen.length} regelingen gevonden.`,
    `Situatie: ${BEWONERTYPE_LABELS[bewonertype] ?? bewonertype}`,
    `Interesse: ${maatregelen.map((m) => MAATREGEL_LABELS[m] ?? m).join(", ")}`,
    `Regelingen: ${regelingen.map((r) => r.titel ?? "").filter(Boolean).join("; ")}`,
    `Verzoek: overzicht per e-mail ontvangen (automatisch verstuurd).`,
  ].join("\n");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // Nieuwe pad: de drie losse delen (kolom `naam` vult de trigger). Legacy pad
    // (oude bundle, alleen `naam`): schrijf zoals voorheen de ene kolom.
    const naamVelden = achternaam
      ? {
          voornaam: voornaam ? escapeHtml(voornaam) : null,
          tussenvoegsel: tussenvoegsel ? escapeHtml(tussenvoegsel) : null,
          achternaam: escapeHtml(achternaam),
        }
      : { naam: escapeHtml(legacyNaam) };
    const { error } = await supabase.from("leads_bewoners").insert({
      tenant_id: TENANT_ID,
      ...naamVelden,
      email,
      telefoon,
      postcode,
      huisnummer,
      toevoeging: toevoeging ? escapeHtml(toevoeging) : null,
      straat: escapeHtml(straat),
      stad: escapeHtml(stad),
      notities,
      bron: "Subsidiecheck",
      status: "nieuw",
    });
    if (error) throw error;
  } catch (err) {
    console.error("Lead-insert faalde", err);
    return json({ error: "Er ging iets mis. Probeer het later opnieuw." }, 500);
  }

  // 2) E-mail versturen (bonus — lead staat al veilig).
  const apiKey = Deno.env.get("RESEND_API_KEY");
  let mailed = false;
  if (apiKey) {
    const siteBasis = (Deno.env.get("SITE_URL") ?? "https://www.voortraject.nl").replace(/\/+$/, "");
    const overzichtUrl =
      typeof payload.overzichtUrl === "string" && /^https?:\/\//i.test(payload.overzichtUrl)
        ? payload.overzichtUrl
        : undefined;
    const html = bouwEmailHtml({
      aanhef,
      adresregel: adresregel || "jouw woning",
      regelingen,
      siteBasis,
      overzichtUrl,
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
  return json({ ok: true, mailed });
});
