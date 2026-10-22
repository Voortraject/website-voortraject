import type { RefObject } from "react";

import { useStaffel as useStaffelSite } from "@/lib/beweging";

// Beweging op het resultaat: blokken veren gestaffeld in en tellers tellen op.
// De logica staat sinds de huisstijl van de hele site in src/lib/beweging.ts;
// het resultaat houdt zijn eigen klassen (rs-in, rs-wacht in resultaat.css).

export { minderBeweging } from "@/lib/beweging";

const RESULTAAT = { in: "rs-in", wacht: "rs-wacht" };

/** Zie useStaffel in src/lib/beweging.ts, met de klassen van het resultaat. */
export function useStaffel(container: RefObject<HTMLElement>, aan = true): void {
  useStaffelSite(container, aan, RESULTAAT);
}
