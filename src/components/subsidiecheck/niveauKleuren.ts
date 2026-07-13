import type { SubsidieType } from "@/lib/subsidies";

// Kleur per TYPE (tokens in src/index.css: --subsidie / --lening). Het type is
// het beslissende onderscheid — een subsidie krijg je, een lening betaal je
// terug — dus dát sturen we met kleur: subsidie groen, lening terracotta. Het
// niveau (Rijk/Provincie/Gemeente/Overig) tonen we neutraal als tekstkop, zodat
// er niet twee kleursystemen om aandacht strijden. Zo herken je een lening
// overal, ook als 'ie in de Rijksoverheid-groep staat.

// Kaartstijl: stevige linkerrand + subtiele rand rondom + zachte tint, alles in
// de type-kleur.
export const TYPE_KAART: Record<SubsidieType, string> = {
  subsidie:
    "border-[hsl(var(--subsidie)/0.3)] border-l-[hsl(var(--subsidie))] bg-[hsl(var(--subsidie)/0.06)]",
  lening:
    "border-[hsl(var(--lening)/0.3)] border-l-[hsl(var(--lening))] bg-[hsl(var(--lening)/0.06)]",
};

// Type-label ("SUBSIDIE"/"LENING"): een gevulde pill in de type-kleur met witte
// tekst, zodat pill en linkerrand altijd matchen.
export const TYPE_PILL: Record<SubsidieType, string> = {
  subsidie: "bg-[hsl(var(--subsidie))] text-white",
  lening: "bg-[hsl(var(--lening))] text-white",
};
