import { useQuery } from "@tanstack/react-query";

import { normalizePostcode, POSTCODE_RE, zoekAdres, type PdokAdres } from "@/lib/pdok";

// Adres-lookup met caching: bij herladen of terug-navigeren binnen de
// subsidiecheck wordt hetzelfde adres niet opnieuw bij PDOK opgevraagd.
export function usePdokAdres(postcode: string, huisnummer: string) {
  const geldig = POSTCODE_RE.test(postcode) && /^[0-9]/.test(huisnummer.trim());

  return useQuery<PdokAdres | null>({
    queryKey: ["pdok-adres", normalizePostcode(postcode), huisnummer.trim()],
    queryFn: () => zoekAdres(postcode, huisnummer),
    enabled: geldig,
    staleTime: Infinity,
    retry: 1,
  });
}
