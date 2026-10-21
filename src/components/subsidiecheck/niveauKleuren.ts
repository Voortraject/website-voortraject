import type { SubsidieType } from "@/lib/subsidies";

// Kleur per TYPE (tokens in src/index.css: --subsidie / --lening). Het type is
// het beslissende onderscheid (een subsidie krijg je, een lening betaal je
// terug), dus dát sturen we met kleur: subsidie groen, lening staalblauw (géén
// rood/oranje: dat leest als "slecht", terwijl een lening ook prima kan zijn).
// Het niveau (Rijk/Provincie/Gemeente/Overig) tonen we neutraal als tekstkop,
// zodat er niet twee kleursystemen om aandacht strijden.
//
// Sinds de huisstijl van oktober 2026 zonder rand, linkerstreep of pil: een
// zacht verloop in de soortkleur, schaduw, en het bedrag groot in die kleur.
// De klassen staan in resultaat.css.

/** Het vlak van de kaart of teller. */
export const TYPE_VLAK: Record<SubsidieType, string> = {
  subsidie: "rs-vlak-subsidie",
  lening: "rs-vlak-lening",
};

/** Het ronde icoon rechtsboven. */
export const TYPE_BADGE: Record<SubsidieType, string> = {
  subsidie: "rs-badge-subsidie",
  lening: "rs-badge-lening",
};

/** Tekst in de soortkleur (soortlabel en bedrag). */
export const TYPE_TEKST: Record<SubsidieType, string> = {
  subsidie: "text-[hsl(var(--subsidie))]",
  lening: "text-[hsl(var(--lening))]",
};
