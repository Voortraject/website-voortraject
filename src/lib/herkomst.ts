// Herkomst van een lead: via welke flyer, welk bord, welke partner of welke
// gedeelde link kwam deze bezoeker binnen?
//
// HET GAT DAT DIT DICHT
// Elk formulier zette `bron` vast op "Voortraject". De flyer (het grootste kanaal)
// en elke verwijzer waren daardoor in het CRM niet te onderscheiden van iemand die
// ons zelf vond; het CRM raadt een flyerlead achteraf op gebied en datum. Een
// eigen link per kanaal (`/subsidiecheck?via=flyer`) legt het vast in plaats van
// het te raden.
//
// ALLEEN BEKENDE CODES
// De waarde gaat als `bron` naar `leads_bewoners`. Een bezoeker mag met een
// verzonnen `?via=` nooit een eigen bronwaarde aanmaken, en ook niet zomaar een
// bestaande CRM-code als `ingekochte_lead` kiezen. Daarom een vaste lijst hier, en
// niet "alles wat in `lead_bronnen` staat": die tabel is voor een anonieme
// bezoeker niet leesbaar (geen SELECT-grant voor `anon`), en dat hoort zo.
// Onbekend of leeg → gewoon "Voortraject", zoals voorheen.
//
// De CRM-trigger `normaliseer_lead_bron` accepteert een bestaande code
// rechtstreeks. Een code die daar (nog) niet bestaat, wordt NIET geweigerd maar
// valt terug op `website`. Elke code hieronder moet dus eerst als rij in
// `lead_bronnen` staan (tenant 1) vóór deze lijst live gaat.
//
// De edge function `subsidiecheck-mail` draait op Deno en kan dit bestand niet
// importeren; daar staat dezelfde lijst nog een keer (`HERKOMST_CODES`), en die
// controleert opnieuw, want haar aanroep is met de publieke anon-key na te
// bootsen. src/test/herkomst.test.ts houdt de twee lijsten gelijk.

export const HERKOMST_CODES = [
  // Eigen kanalen.
  "flyer",
  "bord",
  "deel",
  // Partners, met de code die ze in `lead_bronnen` al hebben.
  "050energielabels",
  "duurzaam_aankopen",
  "enerma",
  "subsidieloket",
  "klaas_koop_hypotheken",
] as const;

export type HerkomstCode = (typeof HERKOMST_CODES)[number];

/** Wat de lead krijgt zonder bekende herkomst: onze eigen site. */
export const STANDAARD_BRON = "Voortraject";

const SLEUTEL = "vt_herkomst";

/**
 * Maakt van een ruwe parameterwaarde een bekende code, of null. Vergevingsgezind
 * in de vorm (hoofdletters, spaties, een streepje in plaats van een liggend
 * streepje op een gedrukte QR), streng in de inhoud.
 */
export function herkomstCode(ruw: string | null | undefined): HerkomstCode | null {
  if (!ruw) return null;
  const code = ruw.trim().toLowerCase().replace(/-/g, "_");
  return (HERKOMST_CODES as readonly string[]).includes(code) ? (code as HerkomstCode) : null;
}

/**
 * De herkomst uit een querystring. `via` wint; anders telt `utm_source` als die
 * een bekende code is. Dat laatste is er voor de deelknop: die zet al sinds zijn
 * begin `utm_source=deel`, en de links die al in WhatsApp-groepen rondgaan tellen
 * zo ook mee, zonder de deellink langer te maken.
 */
export function herkomstUitQuery(search: string): HerkomstCode | null {
  const params = new URLSearchParams(search);
  return herkomstCode(params.get("via")) ?? herkomstCode(params.get("utm_source"));
}

/**
 * Onthoudt de herkomst uit de landings-URL voor de rest van de sessie. Eén keer
 * aanroepen bij het laden van de site: de subsidiecheck herschrijft zijn
 * queryparameters bij elke stap, en een bezoeker die van de homepage doorklikt
 * naar het contactformulier heeft de parameter ook niet meer in de URL.
 *
 * Een onbekende waarde overschrijft een eerder onthouden code niet.
 */
export function onthoudHerkomst(search: string): void {
  const code = herkomstUitQuery(search);
  if (!code) return;
  try {
    sessionStorage.setItem(SLEUTEL, code);
  } catch {
    /* geen opslag (private mode) → leadBron() valt terug op de huidige URL */
  }
}

/** De onthouden herkomst, opnieuw tegen de lijst gehouden; of null. */
export function onthoudenHerkomst(): HerkomstCode | null {
  let opgeslagen: string | null = null;
  try {
    opgeslagen = sessionStorage.getItem(SLEUTEL);
  } catch {
    /* geen opslag */
  }
  const huidigeUrl = typeof window === "undefined" ? "" : window.location.search;
  return herkomstCode(opgeslagen) ?? herkomstUitQuery(huidigeUrl);
}

/** De waarde voor `leads_bewoners.bron`: een bekende code, anders "Voortraject". */
export function leadBron(): string {
  return onthoudenHerkomst() ?? STANDAARD_BRON;
}
