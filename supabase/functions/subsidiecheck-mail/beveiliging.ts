// Beveiliging van subsidiecheck-mail, als puur bestand naast de function zodat
// vitest het rechtstreeks kan importeren (src/test/subsidiecheckMailBeveiliging.test.ts).
// Zelfde patroon als woninginfo/cachesleutel.ts.
//
// Aanleiding: van 9 tot 12 oktober 2026 stond voortraject.nl op de Spamhaus DBL.
// Deze function is de enige publieke route die mail stuurt naar een adres dat een
// bezoeker zelf intypt, en hij zette tot dan toe tekst en links uit de request
// ongecontroleerd in die mail. Wat hier staat, sluit dat af. Zie
// tasks/formulieren-misbruik-2026-10.md.
//
// Deno kan niets uit src/ importeren, dus een paar dingen hieronder zijn kopieën.
// De test bewaakt dat ze gelijk blijven aan het origineel.

// ---- Tijdscontrole ----

/** Een mens vult naam, mail en telefoon niet sneller in. Gelijk aan MIN_INVULTIJD_MS in de client. */
export const MIN_INVULTIJD_MS = 3000;

/**
 * True als het formulier aantoonbaar te snel is ingevuld. Ontbreekt de duur, dan
 * is het géén bewijs: een oude, nog gecachete browserbundle stuurt hem niet mee,
 * en een echte lead stilletjes weggooien is erger dan een bot doorlaten (die
 * daarna nog langs de rem, de limiet per adres en Turnstile moet).
 */
export function teSnelIngevuld(duurMs: unknown): boolean {
  return typeof duurMs === "number" && Number.isFinite(duurMs) && duurMs < MIN_INVULTIJD_MS;
}

// ---- Mailadres ----

// Strenger dan "iets@iets.iets": alleen tekens die in een echt adres voorkomen,
// geen punt aan het begin of eind van het lokale deel, geen twee punten achter
// elkaar, en domeinlabels zonder streepje aan de randen. Een `+` mag
// (info+test@...), net als alle andere tekens die RFC 5322 in een lokaal deel
// toestaat. Kopie: EMAIL_RE in src/components/subsidiecheck/leadFormulier.ts.
export const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}(?<!\.)@(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

/** Maximale lengte van een adres (RFC 5321). */
export const EMAIL_MAX = 254;

export function emailSyntaxGeldig(email: string): boolean {
  return email.length <= EMAIL_MAX && EMAIL_RE.test(email);
}

// Adressen van systemen, niet van mensen. Mail daarheen is per definitie
// ongevraagd, en abuse@ en postmaster@ zijn precies waar klachten over spam
// binnenkomen. Bewust níet info@: veel huishoudens gebruiken info@achternaam.nl.
// Kopie: SYSTEEMADRESSEN in src/components/subsidiecheck/leadFormulier.ts.
export const SYSTEEMADRESSEN = ["abuse", "postmaster", "noreply", "no-reply", "mailer-daemon"] as const;

/** True voor abuse@, postmaster@ enz., ook met een +label erachter. */
export function isSysteemadres(email: string): boolean {
  const lokaal = email.split("@")[0]?.split("+")[0]?.toLowerCase() ?? "";
  return (SYSTEEMADRESSEN as readonly string[]).includes(lokaal);
}

/** Antwoord van een DNS-opzoeking, in de vorm van Deno.resolveDns. */
export type DnsOpzoeker = (domein: string, type: "MX" | "A" | "AAAA") => Promise<unknown[]>;

/** Fout van Deno.resolveDns bij een domein of record dat niet bestaat. */
function isNietGevonden(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { name?: unknown }).name === "NotFound";
}

/**
 * Heeft dit domein een mailserver? "nee" alleen als de DNS dat zeker zegt:
 * geen MX en ook geen A- of AAAA-record (dan is er volgens RFC 5321 nergens om
 * af te leveren). Elke andere fout, of een time-out, is "onbekend": dan laten
 * we het adres door, want een hapering bij DNS mag geen lead kosten.
 */
export async function heeftMailserver(
  domein: string,
  opzoeken: DnsOpzoeker,
  timeoutMs = 2500,
): Promise<"ja" | "nee" | "onbekend"> {
  const metGrens = <T>(p: Promise<T>) =>
    Promise.race([p, new Promise<never>((_, weg) => setTimeout(() => weg(new Error("time-out")), timeoutMs))]);

  const probeer = async (type: "MX" | "A" | "AAAA"): Promise<"ja" | "nee" | "onbekend"> => {
    try {
      const records = await metGrens(opzoeken(domein, type));
      return records.length > 0 ? "ja" : "nee";
    } catch (err) {
      return isNietGevonden(err) ? "nee" : "onbekend";
    }
  };

  const mx = await probeer("MX");
  if (mx !== "nee") return mx;
  const [a, aaaa] = await Promise.all([probeer("A"), probeer("AAAA")]);
  if (a === "ja" || aaaa === "ja") return "ja";
  if (a === "onbekend" || aaaa === "onbekend") return "onbekend";
  return "nee";
}

/** Escapet `%`, `_` en `\` voor een ilike-vergelijking, zodat een adres zichzelf matcht en niets anders. */
export function escapeIlike(waarde: string): string {
  return waarde.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ---- Limiet per adres ----

/** Maximaal één overzicht per adres binnen dit venster. */
export const VENSTER_PER_ADRES_MS = 24 * 60 * 60 * 1000;

// ---- Link naar het overzicht ----

const SITE_HOSTS = new Set(["voortraject.nl", "www.voortraject.nl"]);

/**
 * Alleen een link naar onze eigen subsidiecheck mag in de mail. Wat de browser
 * aanlevert, bouwen we opnieuw op vanaf de vaste basis: dan kan er hooguit een
 * andere querystring in staan, en die toont onze eigen pagina. Al het andere
 * (een andere host, een ander pad, http, gebruikersnaam in de URL) → geen link.
 */
export function schoonOverzichtUrl(ruw: unknown): string | undefined {
  if (typeof ruw !== "string" || ruw.length > 2000) return undefined;
  let url: URL;
  try {
    url = new URL(ruw);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" || !SITE_HOSTS.has(url.hostname) || url.port || url.username || url.password) {
    return undefined;
  }
  if (url.pathname !== "/subsidiecheck" && url.pathname !== "/subsidiecheck/") return undefined;
  return `https://voortraject.nl/subsidiecheck${url.search}`;
}

// ---- Herkomst: utm-tags, fbclid en event-id ----
//
// Waar een lead vandaan kwam, voor de CRM-kolommen utm_source t/m utm_content,
// fbclid en meta_event_id op `leads_bewoners`. Dit komt uit de request en is dus
// door iedereen te verzinnen. Daarom twee harde regels:
//
//  1. alleen waarden van tekens die in een campagnenaam of Meta-macro voorkomen
//     (HERKOMST_RE), binnen de grens; al het andere valt weg, zonder melding;
//  2. deze velden gaan alleen naar de database, nooit in een mail. Ook niet in de
//     teammail: daar staat al een link naar het overzicht, en het CRM toont de
//     herkomst bij de lead.
//
// Kopie van HERKOMST_VELDEN, HERKOMST_RE, HERKOMST_MAX en FBCLID_MAX in
// src/lib/herkomst.ts; src/test/herkomst.test.ts bewaakt dat ze gelijk blijven.

export const HERKOMST_VELDEN = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
] as const;

export const HERKOMST_RE = /^[A-Za-z0-9_.\-{}:|]+$/;
export const HERKOMST_MAX = 150;
export const FBCLID_MAX = 500;

/** De geldige herkomstvelden uit de request, met de kolomnaam als sleutel. Onbruikbaar → weg. */
export function schoonHerkomst(ruw: unknown): Record<string, string> {
  const schoon: Record<string, string> = {};
  if (typeof ruw !== "object" || ruw === null || Array.isArray(ruw)) return schoon;
  for (const veld of HERKOMST_VELDEN) {
    // Eigen sleutels alleen, net als bij bouwEswFilterQuery: geen prototype-waarden.
    if (!Object.prototype.hasOwnProperty.call(ruw, veld)) continue;
    const waarde = (ruw as Record<string, unknown>)[veld];
    if (typeof waarde !== "string") continue;
    const getrimd = waarde.trim();
    const max = veld === "fbclid" ? FBCLID_MAX : HERKOMST_MAX;
    if (getrimd && getrimd.length <= max && HERKOMST_RE.test(getrimd)) schoon[veld] = getrimd;
  }
  return schoon;
}

const EVENT_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Het event-id van de lead (een uuid uit de browser), of undefined. */
export function schoonEventId(ruw: unknown): string | undefined {
  return typeof ruw === "string" && EVENT_ID_RE.test(ruw) ? ruw.toLowerCase() : undefined;
}

// ---- De regelingen zelf ----

// Kopie van BEWONERTYPE_RESIDENT en MAATREGEL_FILTER_ID in src/lib/subsidies/types.ts.
// Daarmee bouwt deze function exact dezelfde aanvraag als de browser, zodat de
// mail dezelfde lijst toont als het scherm.
export const BEWONERTYPE_RESIDENT: Record<string, string> = {
  woningeigenaar: "Woningeigenaar",
  vve: "Vereniging van Eigenaren",
  huurder: "Huurder",
  verhuurder: "Particuliere woningverhuurder",
};

export const MAATREGEL_FILTER_ID: Record<string, string> = {
  isolatie: "1503",
  warmtepomp: "1564",
  zonnepanelen: "1571",
  zonneboiler: "1584",
  ventilatie: "1581",
  warmtenet: "1594",
  "elektrisch-koken": "1601",
  thuisbatterij: "1602",
  asbest: "1613",
};

/**
 * Kopie van bouwEswFilterQuery in src/lib/subsidies/types.ts. Lege lijst = alle
 * maatregelen ("Alles"). Onbekende maatregelen vallen weg, net als daar.
 * Geeft null bij een onbekend bewonertype: dan kunnen we de lijst niet zelf ophalen.
 */
export function bouwEswFilterQuery(bewonertype: string | null, maatregelen: string[]): string | null {
  // Eigen sleutels alleen: een gewone lookup vindt ook "toString" op het prototype.
  const resident =
    bewonertype && Object.prototype.hasOwnProperty.call(BEWONERTYPE_RESIDENT, bewonertype)
      ? BEWONERTYPE_RESIDENT[bewonertype]
      : undefined;
  if (!resident) return null;
  const gekozen = maatregelen.length > 0 ? maatregelen : Object.keys(MAATREGEL_FILTER_ID);
  const params = new URLSearchParams();
  params.set("type-of-resident", resident);
  for (const m of gekozen) {
    const id = Object.prototype.hasOwnProperty.call(MAATREGEL_FILTER_ID, m) ? MAATREGEL_FILTER_ID[m] : undefined;
    if (id) params.append("filter", id);
  }
  return params.toString();
}

/** Wat de mail van een regeling gebruikt. */
export type MailRegeling = {
  titel?: string;
  niveau?: string;
  type?: string;
  bedragIndicatie?: string;
  omschrijving?: string;
  letOp?: string;
  looptAfOp?: string;
  bronUrl?: string;
};

/** Kopie van looptBinnenkortAf in src/lib/subsidies/types.ts (drie maanden). */
export function looptBinnenkortAf(iso: string | undefined, nu = new Date()): boolean {
  if (!iso) return false;
  const eind = new Date(iso);
  if (Number.isNaN(eind.getTime()) || eind <= nu) return false;
  const grens = new Date(nu);
  grens.setMonth(grens.getMonth() + 3);
  return eind <= grens;
}

const tekst = (v: unknown, max: number): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

/**
 * Een regeling uit onze eigen bron (de function `subsidiecheck`) in de vorm van
 * de mail. Precies de velden en de deadline-regel die de browser tot nu toe
 * meestuurde, zodat de mail er hetzelfde uitziet.
 */
export function naarMailRegeling(r: Record<string, unknown>, nu = new Date()): MailRegeling {
  const looptAfOp = typeof r.looptAfOp === "string" && looptBinnenkortAf(r.looptAfOp, nu) ? r.looptAfOp : undefined;
  return {
    titel: tekst(r.titel, 300),
    niveau: tekst(r.niveau, 20),
    type: tekst(r.type, 20),
    bedragIndicatie: tekst(r.bedragIndicatie, 300),
    omschrijving: tekst(r.omschrijving, 2000),
    letOp: tekst(r.letOp, 2000),
    looptAfOp,
    bronUrl: typeof r.bronUrl === "string" && /^https?:\/\//i.test(r.bronUrl) ? r.bronUrl : undefined,
  };
}

// ---- Turnstile ----

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Controleert het Turnstile-token bij Cloudflare.
 *
 * - "ok"        → echt een browser
 * - "geweigerd" → Cloudflare zegt nee, of er is geen token terwijl de controle aan staat
 * - "uit"       → geen secret ingesteld; de controle staat (nog) niet aan
 * - "onbekend"  → Cloudflare niet bereikbaar
 *
 * De aanroeper laat bij "uit" en "onbekend" door en logt het: zo kunnen site en
 * function los van elkaar live, en een storing bij Cloudflare kost geen lead.
 */
export async function controleerTurnstile(
  token: unknown,
  secret: string | undefined,
  ip: string,
  // Via een eigen pijlfunctie en niet `= fetch`: zo wordt fetch altijd op
  // globalThis aangeroepen, hoe de runtime hem ook heeft ingericht.
  doeFetch: typeof fetch = (invoer, opties) => globalThis.fetch(invoer, opties),
): Promise<"ok" | "geweigerd" | "uit" | "onbekend"> {
  const sleutel = secret?.trim();
  if (!sleutel) return "uit";
  if (typeof token !== "string" || !token || token.length > 2048) return "geweigerd";
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 5000);
  try {
    const body = new URLSearchParams({ secret: sleutel, response: token });
    if (ip && ip !== "onbekend") body.set("remoteip", ip);
    const res = await doeFetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: body.toString(),
      signal: stop.signal,
    });
    if (!res.ok) {
      // Tot oktober 2026 stond hier een kale `return`, en daardoor bleef
      // onzichtbaar dat de controle live nooit slaagde. Status en antwoord horen
      // in de log; het token en de secret niet.
      console.error(`Turnstile siteverify gaf HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return "onbekend";
    }
    const data = (await res.json()) as { success?: unknown; "error-codes"?: unknown };
    if (data.success === true) return "ok";
    const codes = Array.isArray(data["error-codes"]) ? data["error-codes"].map(String) : [];
    // Een fout in ónze sleutel is geen bot. Weigeren zou dan elke echte bezoeker
    // zijn mail kosten, dus doorlaten en luid loggen, net als bij een storing.
    if (codes.some((c) => c === "invalid-input-secret" || c === "missing-input-secret")) {
      console.error(`Turnstile: de secret wordt niet geaccepteerd (${codes.join(", ")})`);
      return "onbekend";
    }
    console.warn(`Turnstile weigert het token (${codes.join(", ") || "geen code"})`);
    return "geweigerd";
  } catch (err) {
    console.error("Turnstile siteverify niet bereikbaar", err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    return "onbekend";
  } finally {
    clearTimeout(timer);
  }
}
