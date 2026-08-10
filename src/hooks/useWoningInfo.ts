import { useQuery } from "@tanstack/react-query";

import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import { haalWoningInfo, type WoningInfo } from "@/lib/woninginfo";

/** Alleen een volledige postcode + een huisnummer dat met een cijfer begint. */
export function woningInfoGeldig(postcode: string, huisnummer: string): boolean {
  return POSTCODE_RE.test(postcode) && /^[0-9]/.test(huisnummer.trim());
}

// De queryopties los van de hook, zodat de gegevens-poort bij het verzenden
// exact dezelfde sleutel en dezelfde functie kan gebruiken (`fetchQuery`). Zou
// die sleutel daar afwijken, dan zou hetzelfde adres een tweede keer worden
// opgehaald en zou de cache van deze hook niets waard zijn.
export function woningInfoOpties(postcode: string, huisnummer: string, toevoeging = "") {
  return {
    queryKey: ["woninginfo", normalizePostcode(postcode), huisnummer.trim(), toevoeging.trim()],
    queryFn: () => haalWoningInfo(postcode, huisnummer, toevoeging),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  };
}

// Woninginfo (energielabel) met caching: bij herladen of terug-navigeren binnen
// de subsidiecheck wordt hetzelfde adres niet opnieuw opgevraagd. Mirror van
// useSubsidieCheck / usePdokAdres.
export function useWoningInfo(postcode: string, huisnummer: string, toevoeging = "") {
  return useQuery<WoningInfo>({
    ...woningInfoOpties(postcode, huisnummer, toevoeging),
    enabled: woningInfoGeldig(postcode, huisnummer),
  });
}
