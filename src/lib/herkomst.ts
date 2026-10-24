// Herkomst van een bezoeker: de utm-tags en de fbclid waarmee hij binnenkwam.
//
// Die gaan mee met een lead uit de subsidiecheck, zodat in het CRM te zien is uit
// welke campagne een aanvraag kwam. Zonder dit is een lead uit een Meta-advertentie
// niet te onderscheiden van iemand die zelf naar de site kwam: de check herschrijft
// zijn querystring bij elke stap, en de homepage-CTA navigeert zonder herlading,
// dus aan het eind van de check is van de oorspronkelijke URL niets meer over.
//
// Eén keer uitlezen bij binnenkomst, op élke pagina (zie main.tsx): een advertentie
// kan ook op de homepage landen. Daarna in `sessionStorage`, first touch: de eerste
// herkomst in dit tabblad blijft staan, een latere klik op een andere campagne
// overschrijft hem niet. Weg zodra het tabblad sluit.
//
// Geen persoonsgegevens en geen vrije tekst: alleen waarden die voldoen aan
// HERKOMST_RE, de rest valt weg. De edge function doet dezelfde controle nog een
// keer (supabase/functions/subsidiecheck-mail/beveiliging.ts, schoonHerkomst); dat
// is de laag die telt. src/test/herkomst.test.ts bewaakt dat de twee gelijk zijn.

export const HERKOMST_VELDEN = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
] as const;

export type HerkomstVeld = (typeof HERKOMST_VELDEN)[number];
export type Herkomst = Partial<Record<HerkomstVeld, string>>;

/** Toegestane tekens: wat in campagnenamen en Meta-macro's als {{ad.id}} voorkomt. Geen spaties. */
export const HERKOMST_RE = /^[A-Za-z0-9_.\-{}:|]+$/;

/** Bovengrens per utm-tag. */
export const HERKOMST_MAX = 150;

/**
 * Bovengrens voor de fbclid. Ruimer dan de utm-tags: een fbclid van Meta is
 * sinds 2024 vaak langer dan 150 tekens (met een `_aem_`-deel erachter), en een
 * afgekapte of geweigerde fbclid is voor de koppeling met een advertentie waardeloos.
 */
export const FBCLID_MAX = 500;

const SLEUTEL = "sc_herkomst";

/** Eén waarde, of undefined als hij niet door de controle komt. */
export function schoonHerkomstWaarde(veld: HerkomstVeld, ruw: unknown): string | undefined {
  if (typeof ruw !== "string") return undefined;
  const waarde = ruw.trim();
  const max = veld === "fbclid" ? FBCLID_MAX : HERKOMST_MAX;
  if (!waarde || waarde.length > max || !HERKOMST_RE.test(waarde)) return undefined;
  return waarde;
}

/** De geldige herkomstvelden uit een querystring; leeg object als er niets bruikbaars in staat. */
export function herkomstUitParams(params: URLSearchParams): Herkomst {
  const herkomst: Herkomst = {};
  for (const veld of HERKOMST_VELDEN) {
    const waarde = schoonHerkomstWaarde(veld, params.get(veld));
    if (waarde) herkomst[veld] = waarde;
  }
  return herkomst;
}

/**
 * Bewaart de herkomst uit de huidige URL, als er nog geen herkomst voor dit
 * tabblad is. Faalt stil: zonder opslag gaat de lead gewoon zonder herkomst.
 */
export function bewaarHerkomstUitUrl(): void {
  if (typeof window === "undefined") return;
  const herkomst = herkomstUitParams(new URLSearchParams(window.location.search));
  if (Object.keys(herkomst).length === 0) return;
  try {
    if (sessionStorage.getItem(SLEUTEL)) return;
    sessionStorage.setItem(SLEUTEL, JSON.stringify(herkomst));
  } catch {
    /* private mode of volle opslag */
  }
}

/** De bewaarde herkomst van dit tabblad, opnieuw gecontroleerd; leeg object als er niets is. */
export function leesHerkomst(): Herkomst {
  try {
    const ruw = sessionStorage.getItem(SLEUTEL);
    if (!ruw) return {};
    const data = JSON.parse(ruw) as Record<string, unknown>;
    const herkomst: Herkomst = {};
    for (const veld of HERKOMST_VELDEN) {
      const waarde = schoonHerkomstWaarde(veld, data?.[veld]);
      if (waarde) herkomst[veld] = waarde;
    }
    return herkomst;
  } catch {
    return {};
  }
}

/**
 * Een willekeurig id voor één meetmoment (`event_id` in de dataLayer). Meta
 * gebruikt het om een browser-event en een later server-event (Conversions API)
 * als één te tellen. Geen persoonsgegevens: puur toeval.
 */
export function maakEventId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* geen veilige context */
  }
  // Terugval voor oude browsers: zelfde vorm als een uuid v4, minder sterk toeval.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
