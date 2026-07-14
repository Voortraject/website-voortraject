// Gedeelde PDOK Locatieserver-lookup (Kadaster, gratis, geen API-key).
// Gebruikt door het contactformulier én de subsidiecheck: postcode + huisnummer
// → geverifieerd adres. Levert naast straat/plaats ook gemeente en provincie,
// zodat de subsidiecheck regionale regelingen kan filteren.

export const POSTCODE_RE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

export const normalizePostcode = (s: string) => s.replace(/\s+/g, "").toUpperCase();

/** Weergavevorm met spatie: "9742HJ" → "9742 HJ". Ongeldige invoer blijft ongemoeid. */
export const displayPostcode = (s: string) => {
  const pc = normalizePostcode(s);
  return /^[1-9][0-9]{3}[A-Z]{2}$/.test(pc) ? `${pc.slice(0, 4)} ${pc.slice(4)}` : s;
};

export type PdokAdres = {
  straatnaam: string;
  woonplaatsnaam: string;
  gemeentenaam: string;
  provincienaam: string;
  /**
   * Middelpunt van het adres in RD (EPSG:28992), meters. Optioneel: alleen
   * aanwezig als PDOK het meelevert. Gebruikt om een luchtfoto-uitsnede rond de
   * woning te bouwen (zie src/lib/luchtfoto.ts).
   */
  centroideRd?: { x: number; y: number };
};

/**
 * Parset een PDOK-WKT-punt "POINT(x y)" naar `{ x, y }` (spatie-gescheiden, x
 * eerst). Geeft `undefined` bij ontbrekende of onparsebare invoer.
 */
export function parseRdPoint(wkt?: string): { x: number; y: number } | undefined {
  const m = wkt?.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!m) return undefined;
  const x = Number(m[1]);
  const y = Number(m[2]);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
}

/**
 * Zoekt een adres op bij PDOK. Geeft `null` terug bij geen match of
 * netwerkfout — de aanroeper beslist hoe daarmee om te gaan (Contact laat de
 * gebruiker het adres handmatig invullen; de subsidiecheck toont een melding).
 * `toevoeging` (bijv. "A" of "2") verfijnt de match voor appartementen.
 */
export async function zoekAdres(
  postcode: string,
  huisnummer: string,
  toevoeging?: string,
): Promise<PdokAdres | null> {
  const pc = normalizePostcode(postcode);
  const hn = huisnummer.trim();
  const tv = toevoeging?.trim() ?? "";
  if (!POSTCODE_RE.test(postcode) || !/^[0-9]/.test(hn)) return null;

  try {
    const q = [pc, hn, tv].filter(Boolean).map(encodeURIComponent).join("+");
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${q}&fq=type:adres&fl=straatnaam,woonplaatsnaam,gemeentenaam,provincienaam,postcode,huisnummer,centroide_rd&rows=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data?.response?.docs?.[0];
    if (doc?.straatnaam && doc?.woonplaatsnaam) {
      // De free-search is fuzzy en geeft ALTIJD een best-effort match — ook voor
      // niet-bestaande adressen, mét een andere postcode. Valideer daarom dat de
      // gevonden postcode + huisnummer matchen met de invoer; anders: niet gevonden.
      const invoerHn = hn.match(/\d+/)?.[0] ?? hn;
      if (normalizePostcode(doc.postcode ?? "") !== pc || String(doc.huisnummer ?? "") !== invoerHn) {
        return null;
      }
      return {
        straatnaam: doc.straatnaam,
        woonplaatsnaam: doc.woonplaatsnaam,
        gemeentenaam: doc.gemeentenaam ?? "",
        provincienaam: doc.provincienaam ?? "",
        centroideRd: parseRdPoint(doc.centroide_rd),
      };
    }
    return null;
  } catch (err) {
    console.error("PDOK lookup failed", err);
    return null;
  }
}
