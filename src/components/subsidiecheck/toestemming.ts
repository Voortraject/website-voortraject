// Toestemming voor telefonisch opvolgen, in één bestand.
//
// Waarom dit bestaat: sinds 1 juli 2021 is telemarketing richting consumenten
// alleen toegestaan met toestemming vooraf (art. 11.7 lid 2 Telecommunicatiewet;
// het bel-me-niet-register is toen vervallen). De ACM verlangt dat je die
// toestemming per persoon kunt aantónen. Een telefoonnummer in een formulier is
// op zichzelf geen toestemming: er moet staan waar de bezoeker ja tegen zegt, op
// het moment dat hij het zegt.
//
// De keuze hier is bewust géén aanvinkvakje. Dat is juridisch het sterkst, maar
// het is ook een extra handeling vlak voor de knop, en bij 11 leads per week is
// dat een dure ingreep die we niet kunnen meten. Wat we wél doen is het
// zwaarste dat zonder extra handeling kan: de tekst staat pal bij de knop, hij
// is specifiek over het kanaal (bellen of mailen) en over het onderwerp, en het
// versturen zelf is de actieve handeling.
//
// Het bewijs is het punt. `TOESTEMMING_TEKST` wordt op twee plekken gebruikt:
// hij wordt getoond én hij gaat letterlijk mee de lead in. Daardoor kan er nooit
// licht zitten tussen wat de bezoeker las en wat wij bewaren, ook niet als de
// copy later verandert; oude leads dragen hun eigen tekst.

/**
 * De zin onder de verzendknop van de gegevens-poort. Wijzig je deze, dan
 * verandert automatisch ook wat er bij nieuwe leads wordt vastgelegd, en blijven
 * bestaande leads staan met de tekst die zíj destijds zagen.
 */
export const TOESTEMMING_TEKST =
  "Door te versturen mogen wij je bellen of mailen over jouw verduurzaming.";

/**
 * De regel die bij de lead wordt bewaard als bewijs. Bevat het moment en de
 * letterlijke tekst die op dat moment op het scherm stond.
 */
export function toestemmingBewijs(op: Date = new Date()): string {
  return `Toestemming bellen/mailen: gegeven bij verzenden op ${op.toISOString()}. Getoonde tekst: "${TOESTEMMING_TEKST}"`;
}
