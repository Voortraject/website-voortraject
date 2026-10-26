// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/gebiedscorrecties.ts.
// Gegenereerd, niet met de hand bewerken: zie de kop van tekst.ts hiernaast.

// Correcties op het werkgebied van Milieu Centraal. De data en het waarom staan
// in postcodegebieden.ts; hier staat alleen hoe ze worden toegepast.
//
// Dit draait in de edge function, dus de site, de mail (die haalt de regelingen
// zelf bij de function op) en de CRM-app zien allemaal dezelfde lijst.
//
// Bij twijfel niet tonen. Een bedrag beloven dat niet klopt is erger dan een
// regeling missen: de bezoeker neemt beslissingen op dit overzicht en krijgt het
// ook per mail. Daarom valt een gecorrigeerde regeling weg zodra de postcode
// niet te lezen is, of het nu om `alleenIn` of `nietIn` gaat.

import { GEBIEDSCORRECTIES, type Gebiedscorrectie, type Postcodegebied } from "./postcodegebieden.ts";
import type { SubsidieRegeling } from "./types.ts";

const PC4_RE = /^(\d{4})$/;
const PC6_RE = /^(\d{4}) ?([A-Z]{2})$/;
const REEKS_RE = /^(\d{4}) ?([A-Z]{2}) t\/m ([A-Z]{2})$/;

/**
 * Of een postcode onder één regel van een postcodelijst valt. De regel staat
 * zoals in de PDF van de bron: "9461", "7741 AG" of "7741 AA t/m AE". Een regel
 * die we niet kunnen lezen geeft null; de test op postcodegebieden.ts zorgt dat
 * dat nooit gebeurt.
 */
export function valtOnder(postcode: string, regel: string): boolean | null {
  const pc4 = postcode.slice(0, 4);
  const letters = postcode.slice(4);
  let m = regel.match(PC4_RE);
  if (m) return pc4 === m[1];
  m = regel.match(PC6_RE);
  if (m) return pc4 === m[1] && letters === m[2];
  m = regel.match(REEKS_RE);
  if (m) return pc4 === m[1] && letters.length === 2 && letters >= m[2] && letters <= m[3];
  return null;
}

/** "9367 vc" → "9367VC". */
export function normaliseerPostcode(postcode: string): string {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

const leesbaar = (postcode: string) => /^\d{4}([A-Z]{2})?$/.test(normaliseerPostcode(postcode));

export function inPostcodegebied(postcode: string, gebied: Postcodegebied): boolean {
  const pc = normaliseerPostcode(postcode);
  if (!leesbaar(pc)) return false;
  return gebied.postcodes.some((regel) => valtOnder(pc, regel) === true);
}

/**
 * Haalt regelingen weg die op dit adres niet gelden, en zet de voorwaarde erbij
 * die we niet uit het adres kunnen halen. Voegt nooit een regeling toe.
 * Regelingen zonder correctie komen ongewijzigd terug.
 */
export function pasGebiedscorrectiesToe(
  regelingen: SubsidieRegeling[],
  postcode: string,
  correcties: Gebiedscorrectie[] = GEBIEDSCORRECTIES,
): SubsidieRegeling[] {
  const uit: SubsidieRegeling[] = [];
  for (const regeling of regelingen) {
    const correctie = correcties.find((c) => c.regelingen.includes(regeling.id));
    if (!correctie) {
      uit.push(regeling);
      continue;
    }
    if ((correctie.alleenIn || correctie.nietIn) && !leesbaar(postcode)) continue;
    if (correctie.alleenIn && !inPostcodegebied(postcode, correctie.alleenIn)) continue;
    if (correctie.nietIn && inPostcodegebied(postcode, correctie.nietIn)) continue;
    uit.push(correctie.alleenAls ? { ...regeling, alleenAls: correctie.alleenAls } : regeling);
  }
  return uit;
}
