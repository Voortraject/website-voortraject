// Springt naar het vraagblok onder het resultaat en zet meteen de cursor in het
// tekstvak: één tik en je bent aan het typen. Gedeeld door de knop bovenaan de
// samenvatting en de mobiele actiebalk, zodat beide zich hetzelfde gedragen.

export const VRAAG_BLOK_ID = "sc-vraag";
export const VRAAG_VELD_ID = "sc-vraag-tekst";

export function scrollNaarVraag(): void {
  const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(VRAAG_BLOK_ID)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  // Pas focussen als het scrollen klaar is, anders springt de browser terug.
  window.setTimeout(() => document.getElementById(VRAAG_VELD_ID)?.focus({ preventScroll: true }), reduced ? 0 : 450);
}
