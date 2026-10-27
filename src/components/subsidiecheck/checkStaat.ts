import { huisnummerGeldig, stadGeldig, straatGeldig, toevoegingGeldig } from "@/lib/adresVelden";
import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import { SITE_URL } from "@/lib/site";

// Het adres van de subsidiecheck staat niet meer in de URL.
//
// Tot oktober 2026 leefde de hele check-state in de querystring
// (?pc=…&hn=…&tv=…&type=…&m=…). Handig voor de back-knop en een herlaad, maar de
// URL gaat met elk meetmoment mee naar wie er meekijkt. GA4 kon in GTM worden
// geschoond; de Meta-pixel niet, die stuurt altijd `window.location.href` mee. Met
// een advertentiecampagne erbij zou Meta dus bij elke lead postcode en huisnummer
// ontvangen.
//
// Nu staat het adres in de state van de history-entry (`location.state`, via de
// `state`-optie van navigate/setSearchParams). Die hoort bij precies één
// history-entry, net als een querystring: terug en vooruit geven het adres van
// dát moment terug, een herlaad houdt het vast (de browser bewaart history.state),
// en geen enkele tracker leest het. Wat er in de URL blijft (type, m, edit, sit)
// zegt niets over wie de bezoeker is.
//
// Een link mét adres (de overzichtsmail, een oude bladwijzer) werkt nog steeds:
// het inline script bovenaan index.html haalt pc/hn/tv/str/pl uit de URL vóórdat
// GTM laadt en zet ze klaar in `window.__scAdresUitUrl`. AdresUitUrl.tsx (in
// App.tsx) zet ze in de history-state. Komen ze toch in de URL binnen (een
// client-side navigatie, of een omgeving zonder dat script), dan haalt
// AdresUitUrl ze er meteen weg, vóór de effects die meten.
//
// Regel voor elke link of navigatie binnen de site naar de check: het adres gaat
// mee als `state: metAdres(…)`, nooit in de URL. Alleen bouwOverzichtUrl (de link
// voor in een mail) zet het adres in een URL.

/** Querystring-sleutels die bij het adres horen en dus nooit in de URL mogen blijven. */
export const ADRES_SLEUTELS = ["pc", "hn", "tv", "str", "pl"] as const;

/** Sleutels die de check zelf beheert; de rest (utm-tags, fbclid, test) laat hij staan. */
export const CHECK_SLEUTELS = [...ADRES_SLEUTELS, "type", "m", "edit", "sit"] as const;

/**
 * Het adres zoals de bezoeker het invulde. Ongecontroleerd: de pagina toetst het
 * (paramsGeldig, handmatig), net als vroeger de queryparameters.
 */
export type CheckAdres = { pc: string; hn: string; tv: string; str: string; pl: string };

/** Bovengrens per veld: ruim boven de invoervelden, alleen tegen rommel. */
const VELD_MAX = 200;

const leeg = (): CheckAdres => ({ pc: "", hn: "", tv: "", str: "", pl: "" });

function uitRecord(bron: Record<string, unknown>): CheckAdres | null {
  const adres = leeg();
  let iets = false;
  for (const sleutel of ADRES_SLEUTELS) {
    const waarde = bron[sleutel];
    if (typeof waarde === "string" && waarde.length <= VELD_MAX) {
      adres[sleutel] = waarde;
      if (waarde) iets = true;
    }
  }
  return iets ? adres : null;
}

/** Het adres uit `location.state`, of null. */
export function adresUitState(state: unknown): CheckAdres | null {
  if (typeof state !== "object" || state === null) return null;
  const adres = (state as { scAdres?: unknown }).scAdres;
  if (typeof adres !== "object" || adres === null) return null;
  return uitRecord(adres as Record<string, unknown>);
}

/**
 * Het adres zoals het contactformulier het kan voorinvullen ("Liever even
 * bellen?" op stap 1), of null als er (nog) geen bruikbare postcode en
 * huisnummer staan. Een half adres gaat niet mee: het contactformulier zou er
 * meteen een foutmelding op geven, terwijl het adres daar optioneel is. Straat en
 * plaats alleen samen en binnen de grenzen van adresVelden.ts.
 */
export function adresVoorContact(ruw: CheckAdres): CheckAdres | null {
  const pc = ruw.pc.trim();
  const hn = ruw.hn.trim();
  const tv = ruw.tv.trim();
  if (!POSTCODE_RE.test(pc) || !huisnummerGeldig(hn) || !toevoegingGeldig(tv)) return null;
  const str = ruw.str.trim();
  const pl = ruw.pl.trim();
  const metStraat = !!str && !!pl && straatGeldig(str) && stadGeldig(pl);
  return { pc: normalizePostcode(pc), hn, tv, str: metStraat ? str : "", pl: metStraat ? pl : "" };
}

/** De state voor een navigatie binnen de check. */
export function metAdres(adres: CheckAdres | null): { scAdres: CheckAdres } | null {
  return adres ? { scAdres: adres } : null;
}

/** Het pad van de check, met of zonder slash erachter (net als het script in index.html). */
export const isCheckPad = (pad: string) => pad === "/subsidiecheck" || pad === "/subsidiecheck/";

/** Staat er een adresparameter in de querystring, ook een lege of onbruikbare? */
export const heeftAdresParams = (params: URLSearchParams) => ADRES_SLEUTELS.some((s) => params.has(s));

/** Het adres uit een querystring, of null als er geen bruikbare adresparameter in staat. */
export function adresUitParams(params: URLSearchParams): CheckAdres | null {
  if (!heeftAdresParams(params)) return null;
  const bron: Record<string, string> = {};
  for (const sleutel of ADRES_SLEUTELS) bron[sleutel] = params.get(sleutel) ?? "";
  return uitRecord(bron);
}

/** Een kopie van de querystring zonder adresparameters. */
export function zonderAdres(params: URLSearchParams): URLSearchParams {
  const schoon = new URLSearchParams(params);
  for (const sleutel of ADRES_SLEUTELS) schoon.delete(sleutel);
  return schoon;
}

/**
 * De nieuwe querystring van de check: wat er nu staat zonder de eigen sleutels,
 * plus de nieuwe keuzes. Zo blijven utm-tags en fbclid staan; de Meta-pixel leest
 * de fbclid uit de URL op het moment dat hij laadt, en dat kan pas zijn als de
 * bezoeker halverwege de check toestemming geeft.
 */
export function checkParams(huidig: URLSearchParams, keuzes: Record<string, string>): URLSearchParams {
  const volgende = new URLSearchParams(huidig);
  for (const sleutel of CHECK_SLEUTELS) volgende.delete(sleutel);
  for (const [sleutel, waarde] of Object.entries(keuzes)) {
    if ((ADRES_SLEUTELS as readonly string[]).includes(sleutel)) continue; // nooit het adres
    volgende.set(sleutel, waarde);
  }
  return volgende;
}

declare global {
  interface Window {
    /** Gezet door het inline script in index.html; opgeruimd door AdresUitUrl.tsx. */
    __scAdresUitUrl?: Record<string, unknown>;
  }
}

/** Het adres dat het inline script in index.html uit de URL haalde, of null. */
export function adresUitIndexHtml(): CheckAdres | null {
  if (typeof window === "undefined") return null;
  const ruw = window.__scAdresUitUrl;
  return ruw && typeof ruw === "object" ? uitRecord(ruw) : null;
}

/**
 * Ruimt het adres uit index.html op zodra het in de history-state gaat, zodat
 * een latere navigatie het niet opnieuw oppakt. Los van het lezen: een render
 * mag het niet al kwijtmaken, alleen het effect in AdresUitUrl.
 */
export function vergeetAdresUitIndexHtml(): void {
  if (typeof window !== "undefined") delete window.__scAdresUitUrl;
}

/**
 * De link naar dit overzicht, voor de overzichtsmail ("Bekijk of deel je
 * overzicht online") en de teammail. Hier staat het adres wél in: zonder kan de
 * link het overzicht niet tonen. Die link gaat alleen per mail naar de bezoeker
 * zelf en naar het team, en wie erop klikt komt binnen via een volledige
 * paginalading: dan haalt index.html het adres eruit voordat GTM iets meet.
 */
export function bouwOverzichtUrl(adres: CheckAdres, keuzes: { type?: string | null; m?: string | null }): string {
  const params = new URLSearchParams({ pc: adres.pc, hn: adres.hn });
  if (adres.tv.trim()) params.set("tv", adres.tv.trim());
  if (adres.str && adres.pl) {
    params.set("str", adres.str);
    params.set("pl", adres.pl);
  }
  if (keuzes.type) params.set("type", keuzes.type);
  if (keuzes.m !== null && keuzes.m !== undefined) params.set("m", keuzes.m);
  return `${SITE_URL}/subsidiecheck?${params.toString()}`;
}
