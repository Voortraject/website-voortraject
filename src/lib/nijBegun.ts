import type { PdokAdres } from "@/lib/pdok";

// Het gebied van de Isolatieaanpak Nij Begun, zoals de Rijksoverheid het
// afbakent: de hele provincie Groningen plus drie Drentse gemeenten. Daar is het
// isolatieplan de eerste stap, dus daar toont het resultaat een tegel om het aan
// te vragen in plaats van de losse energielabel-tegel.
//
// Bewust op provincie en gemeente uit PDOK, niet op postcode of woonplaats:
// Eelderwolde ligt in Tynaarlo, en een postcodelijst raakt verouderd bij de
// eerste gemeentelijke herindeling. (Let op: de mock in
// src/lib/subsidies/mockProvider.ts noemt Assen in Noord-Drenthe. Dat is niet
// het Nij Begun-gebied.)
const NIJ_BEGUN_GEMEENTEN_DRENTHE = ["aa en hunze", "noordenveld", "tynaarlo"];

const schoon = (s: string | undefined) => (s ?? "").trim().toLowerCase();

export function inNijBegunGebied(adres: Pick<PdokAdres, "provincienaam" | "gemeentenaam">): boolean {
  const provincie = schoon(adres.provincienaam);
  if (provincie === "groningen") return true;
  return provincie === "drenthe" && NIJ_BEGUN_GEMEENTEN_DRENTHE.includes(schoon(adres.gemeentenaam));
}
