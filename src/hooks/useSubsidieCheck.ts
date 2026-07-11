import { useQuery } from "@tanstack/react-query";

import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

// Haalt de regelingen op via de actieve provider (zie src/lib/subsidies).
// `input` is null zolang de gebruiker de stappen nog niet heeft afgerond.
export function useSubsidieCheck(input: SubsidieCheckInput | null) {
  return useQuery<SubsidieRegeling[]>({
    queryKey: ["subsidiecheck", input],
    queryFn: () => subsidieProvider.check(input as SubsidieCheckInput),
    enabled: input !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
