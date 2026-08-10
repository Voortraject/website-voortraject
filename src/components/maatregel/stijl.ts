/**
 * Kleuren voor de pagina's onder /verduurzamen.
 *
 * Kleuren komen uit de design-tokens (src/index.css), niet uit hexcodes. De
 * constanten hieronder zijn bewust verwijzingen naar CSS-variabelen, zodat een
 * huisstijlwijziging op één plek doorwerkt en deze pagina's niet achterblijven.
 */
export const KLEUR = {
  navy: "hsl(var(--primary))",
  goud: "hsl(var(--accent))",
  wit: "hsl(var(--card))",
  zand: "hsl(var(--background))",
  warm: "var(--card-soft)",
  sand: "hsl(var(--secondary))",
  rand: "hsl(var(--primary) / 0.1)",
} as const;

/** Achtergrondkeuze per sectie, zodat het ritme van de pagina expliciet is. */
export type SectieBg = "zand" | "wit" | "warm" | "sand" | "navy";

export const SECTIE_BG: Record<SectieBg, string> = {
  zand: KLEUR.zand,
  wit: KLEUR.wit,
  warm: KLEUR.warm,
  sand: KLEUR.sand,
  navy: KLEUR.navy,
};
