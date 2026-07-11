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
};

/**
 * Zoekt een adres op bij PDOK. Geeft `null` terug bij geen match of
 * netwerkfout — de aanroeper beslist hoe daarmee om te gaan (Contact laat de
 * gebruiker het adres handmatig invullen; de subsidiecheck toont een melding).
 */
export async function zoekAdres(postcode: string, huisnummer: string): Promise<PdokAdres | null> {
  const pc = normalizePostcode(postcode);
  const hn = huisnummer.trim();
  if (!POSTCODE_RE.test(postcode) || !/^[0-9]/.test(hn)) return null;

  try {
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(pc)}+${encodeURIComponent(hn)}&fq=type:adres&fl=straatnaam,woonplaatsnaam,gemeentenaam,provincienaam&rows=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data?.response?.docs?.[0];
    if (doc?.straatnaam && doc?.woonplaatsnaam) {
      return {
        straatnaam: doc.straatnaam,
        woonplaatsnaam: doc.woonplaatsnaam,
        gemeentenaam: doc.gemeentenaam ?? "",
        provincienaam: doc.provincienaam ?? "",
      };
    }
    return null;
  } catch (err) {
    console.error("PDOK lookup failed", err);
    return null;
  }
}
