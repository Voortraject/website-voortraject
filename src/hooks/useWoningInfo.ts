import { useQuery } from "@tanstack/react-query";

import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import { haalWoningInfo, type WoningInfo } from "@/lib/woninginfo";

// Woninginfo (energielabel) met caching: bij herladen of terug-navigeren binnen
// de subsidiecheck wordt hetzelfde adres niet opnieuw opgevraagd. Mirror van
// useSubsidieCheck / usePdokAdres.
export function useWoningInfo(postcode: string, huisnummer: string, toevoeging = "") {
  const geldig = POSTCODE_RE.test(postcode) && /^[0-9]/.test(huisnummer.trim());

  return useQuery<WoningInfo>({
    queryKey: ["woninginfo", normalizePostcode(postcode), huisnummer.trim(), toevoeging.trim()],
    queryFn: () => haalWoningInfo(postcode, huisnummer, toevoeging),
    enabled: geldig,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
