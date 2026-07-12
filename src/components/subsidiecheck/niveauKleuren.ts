import type { SubsidieNiveau } from "@/lib/subsidies";

// Eén kleur per niveau (tokens in src/index.css: --niveau-*), koel → warm:
// navy (rijk) → petrolgroen (provincie) → oker (gemeente) → terracotta
// (overig). Gebruikt voor het bolletje in de groepskop én de kaartstijl —
// stevige linkerrand, subtiele rand rondom en een héél lichte
// achtergrondtint, zodat direct te zien is welke kaart bij welke groep hoort.

export const NIVEAU_DOT: Record<SubsidieNiveau, string> = {
  rijk: "bg-[hsl(var(--niveau-rijk))]",
  provincie: "bg-[hsl(var(--niveau-provincie))]",
  gemeente: "bg-[hsl(var(--niveau-gemeente))]",
  overig: "bg-[hsl(var(--niveau-overig))]",
};

// Kaartstijl per niveau: stevige linkerrand + subtiele rand rondom in de
// niveaukleur, met een iets sterkere achtergrondtint (~0.06) zodat de categorie
// ook op het vlak zichtbaar is zonder de leesbaarheid te schaden. Rijk gebruikt
// bewust de lichtere blauwvariant (--niveau-rijk-vlak) voor het vlak; de rand
// blijft navy.
// Type-label "SUBSIDIE": een subtiele pill in de eigen niveaukleur van de kaart
// (iets diepere tint dan het vlak), met navy tekst — zodat het label bij de
// kaart hoort i.p.v. er als los blokje op te liggen. Rijk gebruikt de lichtere
// blauwvariant zodat het niet grijst. (Leningen krijgen los een gevulde badge.)
export const NIVEAU_TYPEPILL: Record<SubsidieNiveau, string> = {
  rijk: "bg-[hsl(var(--niveau-rijk-vlak)/0.16)] text-primary",
  provincie: "bg-[hsl(var(--niveau-provincie)/0.16)] text-primary",
  gemeente: "bg-[hsl(var(--niveau-gemeente)/0.20)] text-primary",
  overig: "bg-[hsl(var(--niveau-overig)/0.16)] text-primary",
};

export const NIVEAU_KAART: Record<SubsidieNiveau, string> = {
  rijk: "border-[hsl(var(--niveau-rijk)/0.32)] border-l-[hsl(var(--niveau-rijk))] bg-[hsl(var(--niveau-rijk-vlak)/0.06)]",
  provincie:
    "border-[hsl(var(--niveau-provincie)/0.35)] border-l-[hsl(var(--niveau-provincie))] bg-[hsl(var(--niveau-provincie)/0.06)]",
  gemeente:
    "border-[hsl(var(--niveau-gemeente)/0.45)] border-l-[hsl(var(--niveau-gemeente))] bg-[hsl(var(--niveau-gemeente)/0.06)]",
  overig:
    "border-[hsl(var(--niveau-overig)/0.35)] border-l-[hsl(var(--niveau-overig))] bg-[hsl(var(--niveau-overig)/0.06)]",
};
