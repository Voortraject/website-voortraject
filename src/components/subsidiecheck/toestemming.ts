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
// is specifiek over het kanaal (mailen of bellen) en over het onderwerp, en het
// versturen zelf is de actieve handeling.
//
// Het bewijs is het punt. `TOESTEMMING_TEKST` wordt op twee plekken gebruikt:
// hij wordt getoond én hij gaat letterlijk mee de lead in. Daardoor kan er nooit
// licht zitten tussen wat de bezoeker las en wat wij bewaren, ook niet als de
// copy later verandert; oude leads dragen hun eigen tekst.
//
// Waar het bewijs landt: uitsluitend in de kolommen `toestemming_op` en
// `toestemming_tekst`. Er stond hier ook een leesbare regel in `notities`, als
// terugval voor de periode waarin die kolommen nog niet bestonden. Ze bestaan
// sinds 2026-08-09 en op 2026-08-10 is op een echte lead geverifieerd dat ze zich
// vullen, dus die dubbeling is eruit: `notities` is voor het team zelf.

/**
 * De zin onder de verzendknop van de gegevens-poort. Wijzig je deze, dan
 * verandert automatisch ook wat er bij nieuwe leads wordt vastgelegd, en blijven
 * bestaande leads staan met de tekst die zíj destijds zagen.
 */
// Mailen staat vooraan, bellen erachter. Beide kanalen staan er even hard in,
// dus juridisch verandert er niets, maar het eerste woord bepaalt wel waar de
// bezoeker aan denkt. Mail is het kanaal dat hij net zelf heeft gekozen (zijn
// overzicht komt per mail), bellen is de verrassing. In die volgorde leest de
// zin als een aanvulling in plaats van als een aankondiging.
export const TOESTEMMING_TEKST =
  "Door te versturen mogen wij je mailen of bellen over jouw verduurzaming.";

/**
 * De kolomwaarden voor `leads_bewoners` (zie de migratie van 2026-08-10): het
 * moment én de letterlijke tekst die de bezoeker toen op het scherm zag.
 *
 * Dit is sinds het verdwijnen van de notitieregel de énige vastlegging. Weigert
 * het CRM deze kolommen, dan valt de insert terug op de basisvelden en gaat de
 * lead wél door maar het bewijs niet mee. Dat is een bewuste afweging (een lead
 * verliezen is erger), maar het is dan ook een echte fout: beide schrijfpaden
 * loggen die terugval, zie leadFormulier.ts en de edge function.
 */
export type ToestemmingVelden = { toestemming_op: string; toestemming_tekst: string };

export function toestemmingVelden(op: Date = new Date()): ToestemmingVelden {
  return { toestemming_op: op.toISOString(), toestemming_tekst: TOESTEMMING_TEKST };
}
