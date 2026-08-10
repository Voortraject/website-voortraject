import { useQuery } from "@tanstack/react-query";

import { haalPandContour, type PandInfo } from "@/lib/bagPand";

// De queryopties los van de hook: de gegevens-poort haalt het pand bij het
// verzenden desnoods zelf op (`fetchQuery`) en moet dan exact dezelfde sleutel
// gebruiken, anders staat het bouwjaar hier al in de cache en wordt het toch
// een tweede keer opgehaald.
export function pandContourOpties(centrum?: { x: number; y: number }) {
  return {
    queryKey: ["pand-contour", centrum?.x ?? null, centrum?.y ?? null],
    queryFn: () => haalPandContour(centrum),
    staleTime: Infinity,
    retry: 1,
  };
}

// BAG-pand (contour + pand-ID) met caching: bij herladen of terug-navigeren
// wordt hetzelfde pand niet opnieuw opgevraagd. `enabled` alleen bij een bekend
// middelpunt.
export function usePandContour(centrum?: { x: number; y: number }) {
  return useQuery<PandInfo | null>({
    ...pandContourOpties(centrum),
    enabled: !!centrum,
  });
}
