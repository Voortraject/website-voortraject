import { useQuery } from "@tanstack/react-query";

import { haalPand3d, type Model3d } from "@/lib/woninginfo";

// 3D-massamodel (3D BAG) met caching. `enabled` alleen bij een bekende pand-ID.
// Met een RD-middelpunt worden ook de buurpanden (grijs) opgehaald.
export function usePand3d(pandId?: string, centrum?: { x: number; y: number }) {
  return useQuery<Model3d | null>({
    queryKey: ["pand-3d", pandId ?? null, centrum?.x ?? null, centrum?.y ?? null],
    queryFn: () => haalPand3d(pandId as string, centrum),
    enabled: !!pandId,
    staleTime: Infinity,
    retry: 1,
  });
}
