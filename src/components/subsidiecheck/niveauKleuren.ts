import type { SubsidieNiveau } from "@/lib/subsidies";

// Eén kleur per niveau, oplopend van koel (landelijk) naar warm (lokaal),
// binnen de huisstijl-tokens (geen nieuwe hexkleuren). Gebruikt voor zowel
// het bolletje in de groepskop als de linkerrand van de bijbehorende kaarten
// — zo is in één oogopslag te zien welke kaart bij welke categorie hoort.
export const NIVEAU_DOT: Record<SubsidieNiveau, string> = {
  rijk: "bg-primary",
  provincie: "bg-primary/45",
  gemeente: "bg-accent",
  overig: "bg-muted-foreground/50",
};

export const NIVEAU_RAND: Record<SubsidieNiveau, string> = {
  rijk: "border-l-primary",
  provincie: "border-l-primary/45",
  gemeente: "border-l-accent",
  overig: "border-l-muted-foreground/50",
};
