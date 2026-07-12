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

// Maatregel-tags op de kaart: wit voor leesbaarheid, met een randje in de
// categoriekleur zodat ze bij de kaart horen i.p.v. los erop te zweven.
export const NIVEAU_TAG: Record<SubsidieNiveau, string> = {
  rijk: "border-[hsl(var(--niveau-rijk)/0.35)]",
  provincie: "border-[hsl(var(--niveau-provincie)/0.4)]",
  gemeente: "border-[hsl(var(--niveau-gemeente)/0.55)]",
  overig: "border-[hsl(var(--niveau-overig)/0.4)]",
};

export const NIVEAU_KAART: Record<SubsidieNiveau, string> = {
  rijk: "border-[hsl(var(--niveau-rijk)/0.32)] border-l-[hsl(var(--niveau-rijk))] bg-[hsl(var(--niveau-rijk)/0.03)]",
  provincie:
    "border-[hsl(var(--niveau-provincie)/0.35)] border-l-[hsl(var(--niveau-provincie))] bg-[hsl(var(--niveau-provincie)/0.03)]",
  gemeente:
    "border-[hsl(var(--niveau-gemeente)/0.45)] border-l-[hsl(var(--niveau-gemeente))] bg-[hsl(var(--niveau-gemeente)/0.04)]",
  overig:
    "border-[hsl(var(--niveau-overig)/0.35)] border-l-[hsl(var(--niveau-overig))] bg-[hsl(var(--niveau-overig)/0.03)]",
};
