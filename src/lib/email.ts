/**
 * E-mailcontrole voor alle formulieren op de site: syntax, typefout-suggestie en
 * een domeincheck via DNS-over-HTTPS.
 *
 * Doel: bounces voorkomen bij de bron. De meeste adressen die in het CRM terugkaatsen zijn
 * tikfouten van bewoners in een formulier hier ("jan@gmial.com", "jan@hotmail.con").
 *
 * Syntax en suggestie zijn een kopie van het CRM (crm-voortraject, src/lib/email.ts), zodat
 * site en CRM hetzelfde adres hetzelfde vinden. Bewust gekopieerd en niet gedeeld: het zijn
 * twee losse repo's. Pas je de regel of de domeinlijst aan, doe het dan aan beide kanten.
 *
 * FAIL-OPEN is het leidende principe, net als in het CRM. Alleen bij echt bewijs dat er geen
 * mail kan aankomen houden we het versturen tegen. Een storing, een time-out of een vreemd
 * antwoord laat de bezoeker gewoon door: een lead missen is erger dan één bounce.
 */

/** Bewust pragmatisch: streng genoeg voor tikfouten, niet de volledige RFC 5322. Gelijk aan het CRM. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True als het adres qua vorm klopt. Leeg is niet geldig; een optioneel veld test de aanroeper zelf. */
export function isGeldigEmail(waarde: string): boolean {
  return EMAIL_RE.test(waarde.trim());
}

/** Getrimd en lowercase: de vorm waarop we vergelijken en cachen. */
export function normaliseerEmail(waarde: string): string {
  return waarde.trim().toLowerCase();
}

/** Het domeindeel, genormaliseerd. Null als er geen bruikbaar domein in zit. */
export function domeinVan(email: string): string | null {
  const domein = normaliseerEmail(email).split("@")[1];
  return domein && domein.includes(".") ? domein : null;
}

/**
 * Domeinen die we bij bewoners veruit het vaakst zien. De lijst dient alleen om vertypingen
 * te herkennen, niet om "goede" domeinen te definiëren: een domein dat hier niet in staat is
 * dus géén fout. Gelijk aan het CRM.
 */
export const BEKENDE_DOMEINEN: readonly string[] = [
  // Grote internationale providers
  "gmail.com",
  "hotmail.com",
  "hotmail.nl",
  "outlook.com",
  "outlook.nl",
  "live.nl",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "yahoo.com",
  "gmx.com",
  "proton.me",
  "protonmail.com",
  // Nederlandse providers
  "ziggo.nl",
  "kpnmail.nl",
  "home.nl",
  "planet.nl",
  "xs4all.nl",
  "casema.nl",
  "upcmail.nl",
  "chello.nl",
  "telfort.nl",
  "online.nl",
  "hetnet.nl",
  "zeelandnet.nl",
  "solcon.nl",
  "caiway.nl",
  "tele2.nl",
  "quicknet.nl",
];

/** Levenshtein-afstand, met vroege afbreking zodra de drempel overschreden wordt. */
function afstand(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let vorige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const huidige = [i];
    let rijMin = i;
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      const waarde = Math.min(
        vorige[j] + 1, // verwijdering
        huidige[j - 1] + 1, // invoeging
        vorige[j - 1] + kosten, // vervanging
      );
      huidige.push(waarde);
      if (waarde < rijMin) rijMin = waarde;
    }
    // Geen enkele cel in deze rij haalt de drempel nog: verder rekenen is zinloos.
    if (rijMin > max) return max + 1;
    vorige = huidige;
  }
  return vorige[b.length];
}

/**
 * Echte domeinen die te dicht bij een bekend domein liggen en anders een valse suggestie krijgen
 * (gevonden in de review van 12-11-2026: hccnet.nl → hetnet.nl, mail.com → gmail.com). Ze zijn
 * geen kandidaat voor suggesties; ze krijgen er alleen zelf geen.
 */
export const ECHT_ZONDER_SUGGESTIE: readonly string[] = [
  "hccnet.nl",
  "caiway.net",
  "hotmail.be",
  "outlook.be",
  "live.be",
  "telenet.be",
  "skynet.be",
  "mail.com",
  "email.com",
  "gmx.com",
  "gmx.net",
];

/**
 * Stelt een correctie voor bij een waarschijnlijke vertyping in het domein:
 * "jan@gmial.com" → "jan@gmail.com". Retourneert het volledige adres, of null.
 *
 * Bewust conservatief, zoals in het CRM:
 *   - een domein dat exact in de lijst staat levert nooit een suggestie op;
 *   - korte domeinen (≤ 8 tekens) mogen 1 teken afwijken, langere 2, anders gaan echte
 *     kleine bedrijfsdomeinen ten onrechte "lijken op" gmail.com;
 *   - bij meerdere kandidaten wint de kleinste afstand.
 *
 * Eén verschil met het CRM: het deel vóór de @ blijft zoals de bezoeker het typte, ook de
 * hoofdletters. Een suggestie gaat over het domein; aan de rest komen we niet.
 *
 * Altijd een vraag aan de bezoeker ("Bedoelde je …?"), nooit een automatische correctie.
 */
export function domeinSuggestie(email: string): string | null {
  if (!isGeldigEmail(email)) return null;

  const domein = domeinVan(email);
  if (!domein || BEKENDE_DOMEINEN.includes(domein) || ECHT_ZONDER_SUGGESTIE.includes(domein)) return null;

  const drempel = domein.length <= 8 ? 1 : 2;
  let beste: string | null = null;
  let besteAfstand = drempel + 1;

  for (const kandidaat of BEKENDE_DOMEINEN) {
    const d = afstand(domein, kandidaat, drempel);
    if (d > 0 && d <= drempel && d < besteAfstand) {
      beste = kandidaat;
      besteAfstand = d;
    }
  }

  if (!beste) return null;
  const lokaalDeel = email.trim().split("@")[0];
  return `${lokaalDeel}@${beste}`;
}

// ---------- Domeincheck via DNS-over-HTTPS ----------

/**
 * Het oordeel over een domein:
 *   bestaat      -> er kan mail aankomen (MX, of zonder MX een A/AAAA-record)
 *   bestaat_niet -> aantoonbaar niet: NXDOMAIN, een "null MX" (RFC 7505), of geen MX en geen A/AAAA
 *   onbekend     -> niet vast te stellen (storing, time-out, SERVFAIL, vreemd antwoord)
 *
 * Alleen `bestaat_niet` houdt het versturen tegen.
 */
export type DomeinOordeel = "bestaat" | "bestaat_niet" | "onbekend";

/**
 * Cloudflare, omdat de site daar al draait (Pages, Turnstile). De JSON-API stuurt
 * `Access-Control-Allow-Origin: *` mee, en `accept` is een veilige header, dus er is geen
 * preflight nodig. De site heeft geen CSP (public/_headers), dus connect-src hoeft niet mee.
 * Alleen het domein gaat de deur uit, nooit het deel vóór de @.
 */
export const DOH_URL = "https://cloudflare-dns.com/dns-query";

/** Hoe lang de hele controle (MX plus eventueel A/AAAA) mag duren. Daarna: onbekend, dus door. */
export const DOH_WACHT_MS = 2000;

const DNS_NOERROR = 0;
const DNS_NXDOMAIN = 3;
const TYPE_A = 1;
const TYPE_MX = 15;
const TYPE_AAAA = 28;

type DnsAntwoord = { Status?: unknown; Answer?: { type?: unknown; data?: unknown }[] };

async function vraagDns(domein: string, type: "MX" | "A" | "AAAA", signal: AbortSignal): Promise<DnsAntwoord> {
  const r = await fetch(`${DOH_URL}?name=${encodeURIComponent(domein)}&type=${type}`, {
    headers: { accept: "application/dns-json" },
    signal,
  });
  if (!r.ok) throw new Error(`DNS-lookup gaf HTTP ${r.status}`);
  return (await r.json()) as DnsAntwoord;
}

function records(antwoord: DnsAntwoord, type: number): string[] {
  if (!Array.isArray(antwoord.Answer)) return [];
  return antwoord.Answer.filter((a) => a?.type === type).map((a) => String(a.data ?? ""));
}

/** "0 ." is een null MX: het domein zegt zelf dat het geen mail aanneemt. */
const isNullMx = (data: string) => /^\d+\s+\.$/.test(data.trim());

/**
 * IDN-domeinen ("café.nl") als punycode, zoals DNS ze kent. Lukt dat niet, dan is het geen
 * hostnaam waar we iets zinnigs over kunnen zeggen.
 */
function alsHostnaam(domein: string): string | null {
  try {
    return new URL(`http://${domein}`).hostname || null;
  } catch {
    return null;
  }
}

async function bepaalDomein(domein: string): Promise<DomeinOordeel> {
  const hostnaam = alsHostnaam(domein);
  if (!hostnaam) return "onbekend";

  const afbreken = new AbortController();
  const timer = setTimeout(() => afbreken.abort(), DOH_WACHT_MS);
  try {
    const mx = await vraagDns(hostnaam, "MX", afbreken.signal);
    if (mx.Status === DNS_NXDOMAIN) return "bestaat_niet";
    if (mx.Status !== DNS_NOERROR) return "onbekend";

    const mxRecords = records(mx, TYPE_MX);
    if (mxRecords.length) return mxRecords.every(isNullMx) ? "bestaat_niet" : "bestaat";

    // Geen MX: volgens RFC 5321 gaat mail dan naar het A/AAAA-record van het domein zelf.
    // Pas als ook dat ontbreekt, kan er echt niets aankomen.
    const [a, aaaa] = await Promise.all([
      vraagDns(hostnaam, "A", afbreken.signal),
      vraagDns(hostnaam, "AAAA", afbreken.signal),
    ]);
    if (a.Status !== DNS_NOERROR || aaaa.Status !== DNS_NOERROR) return "onbekend";
    return records(a, TYPE_A).length || records(aaaa, TYPE_AAAA).length ? "bestaat" : "bestaat_niet";
  } catch {
    // Netwerk eruit, time-out, geen JSON: geen oordeel, geen blokkade.
    return "onbekend";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sessiecache per domein. De belofte zelf staat erin, zodat een controle die bij het
 * verlaten van het veld start en bij het versturen nog loopt, niet twee keer gaat.
 * `onbekend` wordt niet onthouden: dat is tijdelijk, een volgende poging mag opnieuw.
 */
const domeinCache = new Map<string, Promise<DomeinOordeel>>();

/** Kan er mail aankomen op dit domein? Wordt nooit afgewezen; elke fout is `onbekend`. */
export function controleerDomein(domein: string): Promise<DomeinOordeel> {
  const sleutel = domein.trim().toLowerCase();
  const bekend = domeinCache.get(sleutel);
  if (bekend) return bekend;

  const belofte = bepaalDomein(sleutel).then((oordeel) => {
    if (oordeel === "onbekend") domeinCache.delete(sleutel);
    return oordeel;
  });
  domeinCache.set(sleutel, belofte);
  return belofte;
}

/** Alleen voor tests: de domeincache legen tussen cases. */
export function _leegDomeinCache(): void {
  domeinCache.clear();
}
