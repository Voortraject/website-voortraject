// Gedeelde telefoonnummer-validatie voor álle lead-formulieren: het
// contactformulier (bewoner én uitvoerder) en de twee formulieren van de
// subsidiecheck. Eén plek, zodat de regels niet uiteenlopen.
//
// Uitgangspunt: bewust ruim. Een geldig nummer in een ongebruikelijke
// schrijfwijze mag nooit worden afgekeurd; dat kost stille afhakers. Vaste
// nummers zijn hier net zo welkom als mobiele: elk Nederlands nummer is
// 0 + 9 cijfers, dus 050/0592/0598/0522 gaan langs dezelfde regel als 06.
//
// Let op: supabase/functions/subsidiecheck-mail/index.ts heeft een kopie van
// deze regels (Deno kan src/ niet importeren). Pas ze samen aan; loopt de
// edge function achter, dan zet die een geldig nummer op null.

// Scheidingstekens die mensen in nummers zetten: spaties (incl. non-breaking),
// alle streepje-varianten, punten, schuine strepen en haakjes.
const SCHEIDINGSTEKENS = /[\s.–—/()-]/g;

/**
 * Zet een getypt nummer om naar een vergelijkbare vorm: scheidingstekens eruit,
 * `00` → `+`, en de trunk-nul na het landnummer weg (`+31 (0)50…` → `+3150…`).
 * Geeft `null` als er iets anders dan cijfers en een leidende `+` overblijft.
 */
const normaliseer = (raw: string): string | null => {
  let n = raw.trim().replace(SCHEIDINGSTEKENS, "");
  if (n.startsWith("00")) n = `+${n.slice(2)}`;
  if (!/^\+?[0-9]+$/.test(n)) return null;
  // Trunk-nul die niet in een internationaal nummer hoort: +31 (0)50 → +3150.
  n = n.replace(/^\+310(?=[0-9])/, "+31");
  return n;
};

/**
 * Accepteert een Nederlands nummer (vast of mobiel) in elke gangbare
 * schrijfwijze, en daarnaast elk plausibel buitenlands nummer met landnummer.
 *
 * Goed: `0612345678`, `06 12 34 56 78`, `050-2112689`, `(050) 211 26 89`,
 * `0592.123456`, `+31 50 211 2689`, `+31 (0)6 12345678`, `0031612345678`,
 * `612345678` (trunk-nul vergeten), `+32 470 12 34 56`.
 *
 * Fout: te kort/te lang, letters, of alleen cijfergroepen zonder herkenbare vorm.
 */
export const validatePhoneNL = (raw: string): boolean => {
  const n = normaliseer(raw);
  if (!n) return false;

  // Nederlands, nationaal genoteerd: 0 + 9 cijfers (06…, 050…, 0592…).
  if (/^0[0-9]{9}$/.test(n)) return true;
  // Nederlands, internationaal genoteerd: +31 + 9 cijfers (zonder trunk-nul).
  if (/^\+31[1-9][0-9]{8}$/.test(n)) return true;
  // Trunk-nul vergeten: 9 cijfers die niet met 0 beginnen (612345678).
  if (/^[1-9][0-9]{8}$/.test(n)) return true;
  // Een nummer mét +31 dat de regel hierboven niet haalde, is een Nederlands
  // nummer van de verkeerde lengte. Dat mag niet alsnog door de buitenland-regel
  // glippen, want die is bewust ruim.
  if (n.startsWith("+31")) return false;
  // Overig buitenlands nummer met landnummer, binnen de E.164-lengtes.
  if (/^\+[1-9][0-9]{7,14}$/.test(n)) return true;

  return false;
};

/** Eén foutmelding voor alle formulieren; noemt bewust ook een vast nummer. */
export const TELEFOON_FOUT = "Vul een geldig telefoonnummer in (bijvoorbeeld 06 12345678 of 050 2112689).";
