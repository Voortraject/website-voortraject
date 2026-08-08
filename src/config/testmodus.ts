// Testmodus voor de subsidiecheck: de hele flow doorlopen zonder dat er een lead
// in het CRM belandt of een mail de deur uit gaat.
//
// Waarom dit bestaat: er is geen test-Supabase. Elke inzending, ook op een
// Cloudflare-preview, schrijft in de échte `leads_bewoners` en stuurt de
// bezoeker een échte mail. Het gevolg was dat niemand de poort kon uitproberen
// zonder het CRM te vervuilen, en dus dat wijzigingen aan de belangrijkste
// leadstap ongezien live gingen.
//
// Twee sloten, allebei moeten open:
//  1. `?test=1` in de URL, en
//  2. niet op het productiedomein.
//
// Het tweede slot is het belangrijkste: op voortraject.nl doet deze schakelaar
// niets, hoe de URL er ook uitziet. Zo kan een gedeelde of geïndexeerde link met
// `?test=1` nooit stilletjes echte leads laten verdwijnen.
//
// De keuze blijft in `sessionStorage` staan, want de check herschrijft zijn
// queryparameters bij elke stap (`setSearchParams` bouwt een verse set op) en
// `test=1` zou daarbij verdwijnen. Uitzetten kan met `?test=0` of door het
// tabblad te sluiten.

const SLEUTEL = "sc_testmodus";
const PRODUCTIE_HOSTS = ["voortraject.nl", "www.voortraject.nl"];

/** Draait de site op het echte publieke domein? Dan nooit testmodus. */
function opProductie(): boolean {
  if (typeof window === "undefined") return true; // veilige aanname
  return PRODUCTIE_HOSTS.includes(window.location.hostname);
}

/**
 * Leest `?test=` en onthoudt de keuze voor deze sessie. Aanroepen bij het laden
 * van de subsidiecheck; daarna volstaat `isTestmodus()`.
 */
export function leesTestmodusUitUrl(): void {
  if (typeof window === "undefined" || opProductie()) return;
  const waarde = new URLSearchParams(window.location.search).get("test");
  if (waarde === null) return;
  try {
    if (waarde === "0") sessionStorage.removeItem(SLEUTEL);
    else sessionStorage.setItem(SLEUTEL, "1");
  } catch {
    /* private mode → testmodus werkt dan alleen zolang de parameter in de URL staat */
  }
}

/** True als er niets naar het CRM geschreven mag worden. */
export function isTestmodus(): boolean {
  if (typeof window === "undefined" || opProductie()) return false;
  try {
    if (sessionStorage.getItem(SLEUTEL) === "1") return true;
  } catch {
    /* geen opslag → val terug op de URL */
  }
  return new URLSearchParams(window.location.search).get("test") === "1";
}
