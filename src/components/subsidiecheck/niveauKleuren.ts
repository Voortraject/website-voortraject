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

// Type-label ("SUBSIDIE"/"LENING"): een gevulde pill in de kern-niveaukleur van
// de kaart met witte tekst. Omdat de kern óók de rand en het bolletje kleurt,
// matchen pill, rand en bolletje nu altijd (zie --niveau-* in index.css).
export const NIVEAU_TYPEPILL: Record<SubsidieNiveau, string> = {
  rijk: "bg-[hsl(var(--niveau-rijk))] text-white",
  provincie: "bg-[hsl(var(--niveau-provincie))] text-white",
  gemeente: "bg-[hsl(var(--niveau-gemeente))] text-white",
  overig: "bg-[hsl(var(--niveau-overig))] text-white",
};

// Kaartstijl per niveau: stevige linkerrand + subtiele rand rondom in de
// kern-niveaukleur, met een zachte achtergrondtint (~0.06). Voor het vlak
// gebruiken rijk/gemeente/overig de lichtere "-vlak"-variant zodat de tint fris
// blijft; de rand houdt de donkere kern (die matcht de pill en het bolletje).
export const NIVEAU_KAART: Record<SubsidieNiveau, string> = {
  rijk: "border-[hsl(var(--niveau-rijk)/0.32)] border-l-[hsl(var(--niveau-rijk))] bg-[hsl(var(--niveau-rijk-vlak)/0.06)]",
  provincie:
    "border-[hsl(var(--niveau-provincie)/0.35)] border-l-[hsl(var(--niveau-provincie))] bg-[hsl(var(--niveau-provincie)/0.06)]",
  gemeente:
    "border-[hsl(var(--niveau-gemeente)/0.45)] border-l-[hsl(var(--niveau-gemeente))] bg-[hsl(var(--niveau-gemeente-vlak)/0.06)]",
  overig:
    "border-[hsl(var(--niveau-overig)/0.35)] border-l-[hsl(var(--niveau-overig))] bg-[hsl(var(--niveau-overig-vlak)/0.06)]",
};
