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
// niet terugbetaalt), lening = terracotta (geld dat je leent). Dit is de enige
// kleurtaal in de lijst; het niveau tonen we als tekstkop, niet als kleur, zodat
// het rustig blijft i.p.v. een bonte mix.
const SUBSIDIE_KLEUR = "#2E7D5B";
const LENING_KLEUR = "#B4532A";
// Heel lichte kaart-achtergrond per type (subtiele tint, versterkt het signaal).
const SUBSIDIE_VLAK = "#F0F6F4";
const LENING_VLAK = "#FAF3F0";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'-]+$/u;
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;

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
  naam?: string;
  email?: string;
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
            <div style="margin-top:6px;font-size:16px;font-weight:700;line-height:1.35;color:${KLEUR.primary};">${titel}</div>
          </td>
          <td style="vertical-align:top;text-align:right;padding-left:12px;">${bedrag}</td>
        </tr></table>
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
    <tr><td style="padding:16px 0 10px;">
      <span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${KLEUR.primary};">${NIVEAU_LABELS[niveau]}</span>
      <span style="font-size:12px;color:${KLEUR.muted};"> &middot; ${regelingen.length}</span>
    </td></tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rijen}</table>
    </td></tr>`;
}

// Hero-samenvatting bovenaan (de "piek"): groot aantal + subsidie/lening-split +
// per-niveau telling. Staat vóór de lijst, zodat de kernboodschap altijd zichtbaar
// is (ook als een mailclient de lange lijst inkort).
function bouwSamenvattingBlok(regelingen: Regeling[]): string {
  const totaal = regelingen.length;
  const leningen = regelingen.filter((r) => r.type === "lening").length;
  const subsidies = totaal - leningen;
  // "Goed nieuws" alleen tonen als het dat ook echt is — niet bij 0 subsidies
  // (enkel leningen) of een handjevol regelingen. Anders neutraal het getal.
  const goedNieuws = totaal >= 3 && subsidies >= 1;

  // Split, met leningen in terracotta (zelfde signaal als de kaart-pill).
  const splitParts = [
    subsidies > 0
      ? `<span style="color:${SUBSIDIE_KLEUR};">${subsidies} ${subsidies === 1 ? "subsidie" : "subsidies"}</span>`
      : "",
    leningen > 0
      ? `<span style="color:${LENING_KLEUR};">${leningen} ${leningen === 1 ? "lening" : "leningen"}</span>`
      : "",
  ].filter(Boolean);
  const split = splitParts.join(` <span style="color:#C9CDD4;">&middot;</span> `);

  // Rechterkolom: per niveau een regel met gekleurd blokje + aantal.
  const rijen = NIVEAU_VOLGORDE.map((niveau) => ({
    niveau,
    aantal: regelingen.filter((r) => (r.niveau ?? "overig") === niveau).length,
  }))
    .filter((g) => g.aantal > 0)
    .map(
      (g) =>
        `<div style="font-size:13px;color:${KLEUR.muted};margin:0 0 6px;line-height:1.3;">${NIVEAU_LABELS[g.niveau]} <span style="color:${KLEUR.primary};font-weight:700;">${g.aantal}</span></div>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${KLEUR.achtergrond};border-radius:8px;">
      <tr>
        <td width="40%" valign="middle" style="padding:18px 12px;text-align:center;border-right:1px solid ${KLEUR.border};">
          ${goedNieuws ? `<div style="width:24px;height:3px;background:${KLEUR.accent};border-radius:2px;margin:0 auto 9px;"></div><div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${KLEUR.primary};margin:0 0 6px;">Goed nieuws</div>` : ""}
          <div style="font-size:48px;font-weight:800;color:${KLEUR.primary};line-height:1;">${totaal}</div>
          <div style="font-size:13px;color:${KLEUR.muted};margin:7px 0 0;line-height:1.3;">regelingen voor<br>jouw woning</div>
        </td>
        <td valign="middle" style="padding:16px 18px;">
          ${split ? `<div style="font-size:14px;font-weight:700;margin:0 0 12px;">${split}</div>` : ""}
          ${rijen}
        </td>
      </tr>
    </table>`;
}

function bouwEmailHtml(opts: {
  naam: string;
  adresregel: string;
  regelingen: Regeling[];
  siteBasis: string;
  overzichtUrl?: string;
}): string {
  const { naam, adresregel, regelingen, siteBasis, overzichtUrl } = opts;
  const subsidies = regelingen.filter((r) => r.type !== "lening").length;
  const goedNieuws = regelingen.length >= 3 && subsidies >= 1;
  const groepen = NIVEAU_VOLGORDE.map((niveau) =>
    groepBlok(
      niveau,
      regelingen.filter((r) => (r.niveau ?? "overig") === niveau),
    ),
  ).join("");

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Voortraject - Jouw subsidieoverzicht</title></head>
<body style="margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${KLEUR.achtergrond};padding:32px 16px;font-family:${FONT_STACK};">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${KLEUR.kaart};border-radius:12px;overflow:hidden;">

        <!-- Header: gecentreerd wit logo op navy -->
        <tr><td style="background:${KLEUR.primary};padding:32px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="Voortraject" style="height:60px;display:inline-block;border:0;">
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px;color:${KLEUR.primary};line-height:1.6;">
          <p style="font-size:16px;margin:0 0 20px;">Hallo ${escapeHtml(naam)},</p>
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
          <p style="font-size:12px;color:${KLEUR.muted};margin:0 0 8px;line-height:1.6;font-style:italic;">Dit overzicht is een indicatie op basis van de Energiesubsidiewijzer en jouw postcode. Aan de bedragen en voorwaarden kunnen geen rechten worden ontleend.</p>
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

  const naam = (payload.naam ?? "").trim();
  const email = (payload.email ?? "").trim();
  if (naam.length < 2 || naam.length > 100 || !NAME_RE.test(naam)) {
    return json({ error: "Vul een geldige naam in." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    return json({ error: "Dit lijkt geen geldig e-mailadres." }, 400);
  }

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
    const { error } = await supabase.from("leads_bewoners").insert({
      tenant_id: TENANT_ID,
      naam: escapeHtml(naam),
      email,
      telefoon: null,
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
      naam,
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
      subject: `Je subsidieoverzicht — ${regelingen.length} ${regelingen.length === 1 ? "regeling" : "regelingen"} voor je woning`,
      html,
    });
  } else {
    console.warn("RESEND_API_KEY ontbreekt — lead opgeslagen, geen automatische mail verstuurd.");
  }

  // ok:true zolang de lead is opgeslagen; het team volgt op als de mail faalde.
  return json({ ok: true, mailed });
});
