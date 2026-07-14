import { useQuery } from "@tanstack/react-query";

import { haalPandContour, type PandInfo } from "@/lib/bagPand";

// BAG-pand (contour + pand-ID) met caching: bij herladen of terug-navigeren
// wordt hetzelfde pand niet opnieuw opgevraagd. `enabled` alleen bij een bekend
// middelpunt.
export function usePandContour(centrum?: { x: number; y: number }) {
  return useQuery<PandInfo | null>({
    queryKey: ["pand-contour", centrum?.x ?? null, centrum?.y ?? null],
    queryFn: () => haalPandContour(centrum),
    enabled: !!centrum,
    staleTime: Infinity,
    retry: 1,
  });
}
