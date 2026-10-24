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
//
// Benodigde databasefunctie (levert het CRM, niet deze repo):
//
//   public.rem_publieke_route(p_ip text, p_doel text) returns void
//
// Telt de aanvraag mee in `publieke_inzendingen` en gooit SQLSTATE 'PT429' zodra
// de grens is bereikt. `p_ip` is het ruwe adres; de functie hasht het zelf met
// dezelfde salt als `rem_publieke_lead_inserts`, zodat de subsidiecheck en de
// contactformulieren één emmer per bezoeker delen in plaats van twee losse.
//
// Waarom dit nodig is: deze function schrijft met service_role en valt daarmee
// buiten de trigger `rem_publieke_lead_inserts` (die slaat service_role over,
// zodat n8n niet in zijn eigen rem loopt). Zonder deze aanroep is de
// subsidiecheck de enige publieke schrijfroute zónder rem, en dat is meteen de
// belangrijkste leadroute. Bestaat de functie nog niet, dan valt deze function
// terug op een ruime rem in het geheugen van de isolate en logt dat.

//
// Beveiliging tegen misbruik (oktober 2026, na een Spamhaus-listing; zie
// beveiliging.ts en tasks/formulieren-misbruik-2026-10.md). Volgorde in de handler:
//   honeypot en te snel ingevuld → stil 200, niets opslaan, niets mailen;
//   ongeldig of systeemadres     → 400;
//   volumerem per IP              → 429;
//   domein zonder mailserver      → 400;
//   al een overzicht in 24 uur    → stil 200 met het bestaande lead-id, geen mail;
//   Turnstile geweigerd           → lead wel opslaan (de lead is leidend), geen mail.
// In de mail aan de bezoeker komt geen tekst uit de request: regelingen uit onze
// eigen bron, straat en plaats uit de BAG (zie overzichtMail.ts).
//
// Optionele secret: TURNSTILE_SECRET_KEY. Ontbreekt hij, dan staat die controle
// uit en logt de function dat bij elke inzending.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  controleerTurnstile,
  emailSyntaxGeldig,
  escapeIlike,
  heeftMailserver,
  isSysteemadres,
  naarMailRegeling,
  schoonEventId,
  schoonHerkomst,
  schoonOverzichtUrl,
  teSnelIngevuld,
  VENSTER_PER_ADRES_MS,
  type MailRegeling,
} from "./beveiliging.ts";
import { insertLead } from "./leadInsert.ts";
import { escapeHtml, maakOverzichtMail, type BagAdres } from "./overzichtMail.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const DEFAULT_FROM = "Voortraject <noreply@voortraject.nl>";
const DEFAULT_REPLY_TO = "info@voortraject.nl";


const NAME_RE = /^[\p{L}\s'-]+$/u;
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Zelfde limiet als het berichtveld op het contactformulier. */
const MAX_BERICHT = 1000;

// Bovengrens op het hele `notities`-veld van een lead. Ruim: er kunnen meerdere
// vragen van de bezoeker in staan én notities van het team zelf. Wordt die grens
// geraakt, dan laten we het veld met rust in plaats van andermans tekst af te
// kappen; zie de update-route hieronder.
const MAX_NOTITIES = 8000;

// Grenzen op de adresvelden die ongewijzigd de CRM-database in gaan. Deno kan
// niets uit src/ importeren, dus dit is een kopie van `ADRES_MAX` in
// src/lib/adresVelden.ts; `src/test/adresVelden.test.ts` bewaakt dat de twee
// gelijk blijven. De waarden zijn gelijk aan de `maxLength` op de invoervelden,
// dus een normale inzending raakt ze nooit.
const ADRES_MAX = { straat: 150, stad: 100, huisnummer: 5, toevoeging: 10 } as const;

/**
 * Trimt de waarde en geeft "" terug zodra hij buiten de grens valt of een `<` of
 * `>` bevat. Weren in plaats van afkappen: een half afgekapte straatnaam ziet er
 * geloofwaardig uit en is dan juist misleidend in het CRM.
 */
function binnenGrens(waarde: string | undefined, max: number): string {
  const schoon = (waarde ?? "").trim();
  if (schoon.length > max || /[<>]/.test(schoon)) return "";
  return schoon;
}

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
  "asbest",
] as const;
// Bewonertype uit stap 1 van de check. Exact de codes van `Bewonertype` in
// src/lib/subsidies/types.ts (ook de waarden achter `?type=` in de deel-link) en
// exact wat de CHECK op `leads_bewoners.subsidiecheck_type_bewoner` toelaat.
// Deno kan src/ niet importeren, dus dit is een kopie: pas ze samen aan. Iets
// anders dan deze vier laat de insert falen, dus onbekende invoer → NULL.
const BEWONERTYPES = ["woningeigenaar", "huurder", "vve", "verhuurder"] as const;

// De schrijfwijze van Milieu Centraal zelf, gelijk aan MAATREGEL_LABELS in
// src/lib/subsidies/types.ts. Deno kan src/ niet importeren, dus dit is een
// kopie: pas ze samen aan en deploy deze function mee. Kent deze kopie een
// maatregel nog niet, dan valt hij weg uit de interesses in plaats van als
// "undefined" in het CRM te belanden.
const MAATREGEL_LABELS: Record<string, string> = {
  isolatie: "Isolatie en glas",
  warmtepomp: "Warmtepomp",
  zonnepanelen: "Zonnepanelen",
  zonneboiler: "Zonneboiler",
  ventilatie: "Ventilatie",
  warmtenet: "Warmtenet-aansluiting",
  "elektrisch-koken": "Koken op elektriciteit",
  thuisbatterij: "Thuisbatterij",
  asbest: "Asbest verwijderen",
};

// ---- Volumerem ----
//
// De echte rem zit in de database, in `public.rem_publieke_route` (geleverd door
// het CRM). Waarom daar en niet hier: deze function schrijft met service_role en
// valt daarmee buiten de trigger `rem_publieke_lead_inserts` die de rem op de
// contactformulieren doet. Zonder deze aanroep is de subsidiecheck, de
// belangrijkste leadroute, dus de enige publieke route zónder rem.
//
// De teller hoort niet in het geheugen van een edge-isolate te zitten: die
// overleeft geen herstart en geldt per isolate, dus als rem telt hij niet. Door
// dezelfde databasefunctie aan te roepen die de contactformulieren al begrenzen,
// deelt de subsidiecheck één emmer met de rest van de site in plaats van er een
// eigen naast te zetten.
const REM_FUNCTIE = "rem_publieke_route";

// Terugval voor de periode dat `rem_publieke_route` nog niet bestaat, en voor het
// geval de aanroep hapert. Bewust ruim: dit is een vangnet, niet het beleid.
const TERUGVAL_VENSTER_MS = 10 * 60 * 1000;
const TERUGVAL_MAX = 6;
const rateHits = new Map<string, number[]>();

// `letOp` is de uitzondering die de bron zelf als "Let op" markeert (zeldzaam,
// dus zwaar); `looptAfOp` staat er alleen als de einddatum binnen drie maanden valt.
type Regeling = MailRegeling;

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
  /** Hoe lang het formulier open stond (ms). Korter dan MIN_INVULTIJD_MS → genegeerd. */
  duurMs?: number;
  /** Token van de onzichtbare Turnstile-controle op de gegevensstap. */
  turnstileToken?: string;
  input?: {
    postcode?: string;
    huisnummer?: string;
    toevoeging?: string;
    bewonertype?: string;
    maatregelen?: string[];
  };
  adres?: { straatnaam?: string; woonplaatsnaam?: string };
  // De site stuurt ook nog `regelingen` mee (voor een oudere versie van deze
  // function). Bewust niet in dit type: die lijst wordt nergens meer gelezen.
  /** Deelbare URL van het volledige resultaat op de site (voor de online-link). */
  overzichtUrl?: string;
  /**
   * utm-tags en fbclid waarmee de bezoeker binnenkwam (zie src/lib/herkomst.ts).
   * Alleen voor de database, nooit voor een mail; zie schoonHerkomst.
   */
  herkomst?: unknown;
  /** Id van het `subsidiecheck_lead`-event in de dataLayer, voor latere deduplicatie bij Meta. */
  eventId?: unknown;
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


function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// Kopje boven een vraag die de bezoeker zelf heeft getypt, met datum en tijd.
//
// Op verzoek van de CRM-kant (10-08-2026). `notities` is een gedeeld veld: het
// team schrijft er zelf in en de subsidietool schrijft er onderaan bij. Zonder
// kopje staat de tekst van een bezoeker kaal onder die van een collega en is in
// het CRM niet meer te zien wie wat heeft geschreven. Leesbaarheid, geen
// veiligheid.
//
// Tijd in Europe/Amsterdam, want dit leest een mens in Groningen, niet UTC.
function vraagKopje(op: Date): string {
  const wanneer = op.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Vraag van de bezoeker via de subsidietool (${wanneer}):`;
}

/** Terugvalrem in het geheugen van deze isolate. Alleen als de database het niet doet. */
function throttled(ip: string): boolean {
  const nu = Date.now();
  const recent = (rateHits.get(ip) ?? []).filter((t) => nu - t < TERUGVAL_VENSTER_MS);
  recent.push(nu);
  rateHits.set(ip, recent);
  return recent.length > TERUGVAL_MAX;
}

/** Het IP zoals de Supabase-edge het aanlevert; de databasefunctie hasht het zelf. */
function bezoekerIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  // Laatste element van x-forwarded-for: dat is het door de edge toegevoegde,
  // betrouwbare adres. Alles daarvoor kan de client zelf hebben meegestuurd.
  const xff = req.headers.get("x-forwarded-for");
  const delen = (xff ?? "").split(",").map((d) => d.trim()).filter(Boolean);
  return delen.length > 0 ? delen[delen.length - 1] : "onbekend";
}

// Alleen het stukje client dat we hier gebruiken, net als LeadClient in leadInsert.ts.
// Let op `PromiseLike` en niet `Promise`: `rpc()` levert een thenable builder op,
// geen kale Promise, en met `Promise` sluit dit type niet aan op de echte client.
type RemClient = {
  rpc: (
    naam: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ error: { code?: string; message?: string } | null }>;
};

/**
 * Vraagt de database of deze aanvraag nog binnen de rem valt.
 *
 * - "ok"       → doorgaan (de databasefunctie heeft de aanvraag geteld)
 * - "te-druk"  → de rem is geraakt (SQLSTATE PT429)
 * - "onbekend" → de rem kon niet worden geraadpleegd
 *
 * Bij "onbekend" gaat de aanroeper door met de terugvalrem hierboven. Dat is
 * bewust fail-open: de functie bestaat nog niet op het moment dat deze code wordt
 * uitgerold (het CRM levert hem apart), en een lead verliezen omdat de rem zelf
 * hapert is erger dan een aanvraag te veel doorlaten.
 */
async function remControle(supabase: RemClient, ip: string): Promise<"ok" | "te-druk" | "onbekend"> {
  try {
    const { error } = await supabase.rpc(REM_FUNCTIE, { p_ip: ip, p_doel: "subsidiecheck-mail" });
    if (!error) return "ok";
    if (error.code === "PT429") return "te-druk";
    console.error(`Volumerem niet raadpleegbaar (${error.code}): ${error.message}`);
    return "onbekend";
  } catch (err) {
    console.error("Volumerem niet raadpleegbaar", err);
    return "onbekend";
  }
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

/**
 * De regelingen uit onze eigen bron: de function `subsidiecheck` in dit project,
 * met exact de aanvraag die de browser ook deed (zie bouwEswFilterQuery). Dat is
 * de lijst die de bezoeker op het scherm zag, en nu ook de enige die in de mail
 * komt. Geeft null als de bron niet antwoordt; dan valt de aanroeper terug.
 */
async function haalEigenRegelingen(postcode: string, filterQuery: string): Promise<Regeling[] | null> {
  const basis = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!basis) return null;
  try {
    const res = await fetch(
      `${basis}/functions/v1/subsidiecheck?postalcode=${encodeURIComponent(postcode)}&${filterQuery}`,
      {
        headers: { Accept: "application/json", ...(anon ? { apikey: anon, Authorization: `Bearer ${anon}` } : {}) },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) {
      console.error(`Eigen bron (subsidiecheck) gaf status ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { regelingen?: unknown };
    if (!Array.isArray(data.regelingen)) return null;
    return data.regelingen
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => naarMailRegeling(r));
  } catch (err) {
    console.error("Eigen bron (subsidiecheck) niet bereikbaar", err);
    return null;
  }
}

// Dezelfde bron als de adreszoeker op de site (src/lib/pdok.ts): de
// Locatieserver van PDOK, met de BAG eronder. Publiek en zonder sleutel.
const PDOK_ADRES = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

/**
 * Straat en plaats bij postcode en huisnummer, uit de BAG. Voor de adresregel
 * in de mail aan de bezoeker, zodat daar nooit de straatnaam uit de request in
 * komt. Geen antwoord of geen adres → null, en dan staat er "postcode …,
 * huisnummer …" (zie mailAdresregel).
 */
async function haalBagAdres(postcode: string, huisnummer: string): Promise<BagAdres | null> {
  try {
    const params = new URLSearchParams({ q: `${postcode} ${huisnummer}`, fl: "straatnaam,woonplaatsnaam,postcode,huisnummer", rows: "1" });
    params.append("fq", "type:adres");
    params.append("fq", `postcode:${postcode}`);
    params.append("fq", `huisnummer:${huisnummer}`);
    const res = await fetch(`${PDOK_ADRES}?${params}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: { docs?: Record<string, unknown>[] } };
    const doc = data.response?.docs?.[0];
    if (!doc || doc.postcode !== postcode || String(doc.huisnummer) !== huisnummer) return null;
    return typeof doc.straatnaam === "string" && typeof doc.woonplaatsnaam === "string"
      ? { straat: doc.straatnaam, plaats: doc.woonplaatsnaam }
      : null;
  } catch (err) {
    console.warn("BAG-adres niet op te halen, adresregel met postcode", err);
    return null;
  }
}

type ZoekClient = {
  from: (tabel: string) => {
    select: (kolommen: string) => {
      eq: (kolom: string, waarde: string) => {
        eq: (kolom: string, waarde: string) => {
          ilike: (kolom: string, patroon: string) => {
            gte: (kolom: string, waarde: string) => {
              order: (kolom: string, opties: { ascending: boolean }) => {
                limit: (n: number) => PromiseLike<{ data: { id?: unknown }[] | null; error: unknown }>;
              };
            };
          };
        };
      };
    };
  };
};

/**
 * Het id van een subsidietool-lead voor dit adres uit de afgelopen 24 uur, of
 * null. Hoofdletterongevoelig, want zo leest een mailserver een adres ook.
 * Faalt de query, dan "geen": fail open, net als de volumerem.
 */
async function eerderOverzicht(supabase: ZoekClient, email: string): Promise<string | null> {
  try {
    const sinds = new Date(Date.now() - VENSTER_PER_ADRES_MS).toISOString();
    const { data, error } = await supabase
      .from("leads_bewoners")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("formulier", "subsidietool")
      .ilike("email", escapeIlike(email))
      .gte("aangemaakt_op", sinds)
      .order("aangemaakt_op", { ascending: false })
      .limit(1);
    if (error) {
      console.error("Limiet per adres niet te controleren", error);
      return null;
    }
    const id = data?.[0]?.id;
    return typeof id === "string" ? id : null;
  } catch (err) {
    console.error("Limiet per adres niet te controleren", err);
    return null;
  }
}

// ---- Handler ----

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Alleen POST" }, 405);

  const ip = bezoekerIp(req);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Ongeldige aanvraag." }, 400);
  }

  // Honeypot: stil "gelukt" teruggeven zodat bots geen signaal krijgen.
  if (payload.honeypot && payload.honeypot.trim() !== "") return json({ ok: true, mailed: false });
  // Te snel ingevuld: zelfde stille reactie. De client houdt een mens al tegen
  // vóór deze grens (met een melding), dus wie hier komt is geen mens.
  if (teSnelIngevuld(payload.duurMs)) return json({ ok: true, mailed: false });

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
  if (!emailSyntaxGeldig(email)) {
    return json({ error: "Dit lijkt geen geldig e-mailadres." }, 400);
  }
  if (isSysteemadres(email)) {
    return json({ error: "Gebruik een persoonlijk e-mailadres." }, 400);
  }
  // De client vraagt het telefoonnummer verplicht op; serverside blijven we
  // mild (bij ontbreken/ongeldig → null) zodat een lead nooit verloren gaat.
  const telefoonRuw = (payload.telefoon ?? "").trim();
  const telefoon = telefoonRuw && validatePhoneNL(telefoonRuw) ? telefoonRuw : null;

  const input = payload.input ?? {};
  const adres = payload.adres ?? {};
  const postcode = normalizePostcode(input.postcode ?? "");
  if (!POSTCODE_RE.test(postcode)) return json({ error: "Ongeldige postcode." }, 400);

  const maatregelen = Array.isArray(input.maatregelen) ? input.maatregelen : [];

  // De adresvelden gaan ongewijzigd de CRM-database in en komen daarna in de
  // mail en de CSV-export terecht. De client begrenst ze al, maar die aanroep is
  // met de publieke anon-key na te bootsen, dus dit is de laag die telt.
  //
  // Mild, net als bij energielabel, bouwjaar en telefoon hierboven: wat niet
  // door de grens komt laten we weg in plaats van de hele aanvraag te weigeren.
  // Een echte bezoeker raakt dit nooit (de grenzen zijn gelijk aan de
  // `maxLength` op de invoervelden), en een lead verliezen om een adresdetail
  // mag niet.
  const straat = binnenGrens(adres.straatnaam, ADRES_MAX.straat);
  const stad = binnenGrens(adres.woonplaatsnaam, ADRES_MAX.stad);
  const huisnummer = binnenGrens(input.huisnummer, ADRES_MAX.huisnummer);
  const toevoeging = binnenGrens(input.toevoeging, ADRES_MAX.toevoeging);
  const adresregel =
    [straat, huisnummer].filter(Boolean).join(" ") + (toevoeging ? ` ${toevoeging}` : "") + (stad ? `, ${stad}` : "");

  // `gewenste_maatregelen` raken we niet aan; de aangevinkte onderwerpen gaan
  // als platte tekst naar `subsidiecheck_interesses`, in de volgorde van de
  // chips op de site — bijv. "Isolatie en glas, Warmtepomp, Thuisbatterij".
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

  // Volumerem. Bewust hier: ná de validatie, dus een kapotte of vervalste
  // aanvraag verbruikt geen ruimte van een echte bezoeker, en vóór beide
  // schrijfroutes (de gewone lead én de vraag-route), zodat er geen pad omheen
  // loopt. De melding is dezelfde die de site bij PT429 toont.
  const rem = await remControle(supabase, ip);
  const teDruk = rem === "te-druk" || (rem === "onbekend" && throttled(ip));
  if (teDruk) {
    return json({ error: "We ontvangen op dit moment veel aanvragen. Probeer het over een uur nog eens." }, 429);
  }

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
    // `status`, `prioriteit` en `toegewezen_aan` sturen we bewust NIET mee. De
    // kolom heeft DEFAULT 'nieuw', dus er verandert niets aan de uitkomst.
    //
    // Let op het verschil met de client: het CRM zet die drie velden terug via
    // de trigger `publieke_lead_velden_vastzetten`, maar die grijpt alleen in
    // bij `auth.role() = 'anon'`. Deze function schrijft met service_role en
    // valt daar dus buiten — reden te meer om ze hier niet te sturen.
  };

  // Herkomst: utm-tags, fbclid en het event-id van de lead, elk streng gecontroleerd
  // (schoonHerkomst, schoonEventId). Alleen voor de database: deze waarden komen uit
  // de request en gaan dus nooit in een mail. insertLead valt terug op een insert
  // zonder deze kolommen zolang de CRM-migratie nog niet gedraaid heeft.
  const herkomst: Record<string, string> = { ...schoonHerkomst(payload.herkomst) };
  const eventId = schoonEventId(payload.eventId);
  if (eventId) herkomst.meta_event_id = eventId;

  const volledigeNaam = [voornaam, tussenvoegsel, achternaam].filter(Boolean).join(" ") || legacyNaam;
  const teamAdres = Deno.env.get("MAIL_TEAM") || Deno.env.get("MAIL_BCC") || DEFAULT_REPLY_TO;
  // Alleen een link naar onze eigen subsidiecheck; zie schoonOverzichtUrl.
  const overzichtUrlSchoon = schoonOverzichtUrl(payload.overzichtUrl);

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

    // De vraag zoals hij in `notities` terechtkomt: kopje met datum, dan de tekst
    // van de bezoeker ongewijzigd. Eén keer opgebouwd, want beide routes
    // hieronder (aanvullen bij een bestaande lead, of een nieuwe lead maken)
    // moeten er identiek uitzien in het CRM.
    const vraagBlok = `${vraagKopje(new Date())}\n${bericht}`;

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
          // Aanvullen, nooit overschrijven: er kan al een eerdere vraag staan, en
          // een medewerker kan er zelf notities bij hebben gezet. Dit veld komt in
          // mails en in de CSV-export terecht, dus er zitten twee harde regels op:
          //
          //  1. nooit leegmaken. `bericht` is hierboven al op niet-leeg
          //     gecontroleerd, maar de regel staat er expliciet zodat een latere
          //     wijziging hem niet per ongeluk weghaalt.
          //  2. nooit inkorten wat er al stond. Past de vraag er niet meer bij
          //     binnen MAX_NOTITIES, dan laten we het veld met rust in plaats van
          //     andermans tekst af te kappen. De vraag gaat sowieso voluit naar het
          //     team per mail, dus er raakt niets zoek.
          const bestaandeNotitie = (bestaand.notities ?? "").trim();
          const nieuweNotitie = bestaandeNotitie ? `${bestaandeNotitie}\n\n${vraagBlok}` : vraagBlok;

          if (!nieuweNotitie.trim()) {
            console.error("Notitie-update overgeslagen: resultaat zou leeg zijn");
          } else if (nieuweNotitie.length > MAX_NOTITIES) {
            console.warn(
              `Notitie-update overgeslagen: ${nieuweNotitie.length} tekens past niet binnen ${MAX_NOTITIES}. ` +
                "De vraag staat wel in de teammail.",
            );
          } else {
            const { error: updateFout } = await supabase
              .from("leads_bewoners")
              .update({ notities: nieuweNotitie })
              .eq("id", bestaand.id);
            if (updateFout) throw updateFout;
          }
          nieuweLead = false;
        }
      }

      if (nieuweLead) {
        // Geen bestaande lead: alles wat we van deze bezoeker weten in één keer,
        // met de hulpvraag uit de poort (indien meegestuurd) boven de vraag. Ook
        // hier het kopje boven de vraag, zodat een lead er in het CRM hetzelfde
        // uitziet of hij nu via deze route of via de update hierboven is ontstaan.
        const notities = [notitie, vraagBlok].filter(Boolean).join("\n\n");
        const { error } = await insertLead(supabase, { ...leadVelden, notities }, verrijking, herkomst);
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

  // ---- Gewone route: lead + overzicht naar het adres dat de bezoeker typte ----
  // Hier gaat mail naar een vreemd adres, dus hier zitten de zwaarste controles.
  // Ná de volumerem, zodat de DNS-vraag en de opzoeking per adres niet
  // onbegrensd door te drukken zijn.

  // Een domein zonder mailserver levert alleen bounces op, en bounces kosten
  // reputatie. Vangt ook typfouten als "gmial.com". Bij twijfel: doorlaten.
  const domein = email.split("@")[1] ?? "";
  const mailserver = await heeftMailserver(domein, (d, t): Promise<unknown[]> =>
    t === "MX" ? Deno.resolveDns(d, "MX") : t === "A" ? Deno.resolveDns(d, "A") : Deno.resolveDns(d, "AAAA"),
  );
  if (mailserver === "nee") {
    return json({ error: "Dit e-mailadres lijkt niet te bestaan. Controleer het even." }, 400);
  }
  if (mailserver === "onbekend") console.warn("Mailserver-check onbeslist, adres doorgelaten");

  // Maximaal één overzicht per adres per 24 uur. Een tweede keer: geen nieuwe
  // lead en geen mail, wel het id van de lead die er al is, zodat een vraag op
  // het resultaat daar terechtkomt. Stil "gelukt": de bezoeker heeft het
  // overzicht al, en een bot leert er niets van.
  const bestaandeLead = await eerderOverzicht(supabase as unknown as ZoekClient, email);
  if (bestaandeLead) return json({ ok: true, mailed: false, leadId: bestaandeLead });

  // Turnstile. Geweigerd → de lead slaan we wél op (de lead is leidend, en een
  // echte bezoeker met een geblokkeerd script mag niet verdwijnen), maar er gaat
  // geen mail naar het ingetypte adres. Het team ziet de lead en volgt op.
  const turnstile = await controleerTurnstile(payload.turnstileToken, Deno.env.get("TURNSTILE_SECRET_KEY"), ip);
  if (turnstile === "uit") console.warn("TURNSTILE_SECRET_KEY ontbreekt: Turnstile-controle staat uit");
  if (turnstile === "onbekend") console.warn("Turnstile niet bereikbaar, inzending doorgelaten");
  if (turnstile === "geweigerd") console.warn("Turnstile geweigerd: lead opgeslagen, geen overzichtsmail");
  const magMailen = turnstile !== "geweigerd";

  let leadId: string | null = null;
  try {
    // `notities` bevat hooguit de kopregel uit de poort (bijv. de termijn waarop
    // de bewoner aan de slag wil); een latere vraag komt er via route "bericht"
    // onder. Het id gaat terug naar de site, zodat die vraag bij déze lead landt
    // in plaats van een tweede aan te maken.
    const { data: nieuweLead, error } = await insertLead(
      supabase,
      { ...leadVelden, notities: notitie },
      verrijking,
      herkomst,
    );
    if (error) throw error;
    leadId = typeof nieuweLead?.id === "string" ? nieuweLead.id : null;
  } catch (err) {
    console.error("Lead-insert faalde", err);
    return json({ error: "Er ging iets mis. Probeer het later opnieuw." }, 500);
  }

  // 2) E-mail versturen (bonus — lead staat al veilig).
  const apiKey = Deno.env.get("RESEND_API_KEY");
  let mailed = false;
  if (apiKey && magMailen) {
    // In deze mail komt geen tekst uit de request: maakOverzichtMail leest zelf
    // alleen de streng gevalideerde velden. Regelingen uit onze eigen bron,
    // straat en plaats uit de BAG. Geen bewonertype of geen antwoord van de
    // bron → een mail zonder lijst, met de link naar het overzicht online.
    const mail = await maakOverzichtMail({
      payload,
      aanhef,
      // Zelfde bouwjaar dat als verrijking bij de lead gaat: een gevalideerd
      // getal, en de zin erover is onze eigen tekst.
      bouwjaar,
      beoordeling: await haalBeoordeling(supabase),
      haalRegelingen: haalEigenRegelingen,
      haalBagAdres,
    });
    if (!mail) {
      console.error("Overzichtsmail niet op te bouwen (postcode of huisnummer ongeldig); lead staat er wel");
    } else {
      if (!mail.metLijst) console.warn("Overzichtsmail zonder lijst: geen bewonertype of eigen bron niet beschikbaar");
      mailed = await verstuurMail({
        apiKey,
        from: Deno.env.get("MAIL_FROM") ?? DEFAULT_FROM,
        to: email,
        bcc: Deno.env.get("MAIL_BCC") || undefined,
        replyTo: Deno.env.get("MAIL_REPLY_TO") ?? DEFAULT_REPLY_TO,
        subject: mail.onderwerp,
        html: mail.html,
      });
    }
  } else if (!apiKey) {
    console.warn("RESEND_API_KEY ontbreekt — lead opgeslagen, geen automatische mail verstuurd.");
  }

  // ok:true zolang de lead is opgeslagen; het team volgt op als de mail faalde.
  // `leadId` mag null zijn: de site gebruikt het alleen om een latere vraag aan
  // deze lead te koppelen en valt anders terug op een nieuwe lead.
  return json({ ok: true, mailed, leadId });
});
