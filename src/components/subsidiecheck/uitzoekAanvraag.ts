import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

import { leesContact } from "./contactOpslag";
import { MIN_INVULTIJD_MS, valideerContact, verstuurSubsidiecheckBericht } from "./leadFormulier";

// De oker knop op het resultaat: "Laat gratis uitzoeken wat ik krijg".
//
// Eén klik, geen formulier. De bezoeker gaf in de gegevens-poort al naam, e-mail
// en telefoon, dus hier vragen we niets opnieuw. Het verzoek gaat over dezelfde
// route als een vraag op het resultaat (subsidiecheck-mail, actie "bericht"),
// met het lead-id uit de sessie: dan vult de function de notitie aan bij díe
// lead in plaats van een tweede lead te maken. Daar hoort het e-mailadres bij;
// de function controleert dat id en adres bij elkaar horen.
//
// Testmodus regelt verstuurSubsidiecheckBericht zelf: dan gaat er niets weg.

/** Wat er in de notitie bij de lead en in de mail aan het team komt. */
export const UITZOEK_BERICHT =
  "Laat gratis uitzoeken wat ik krijg: ik wil graag dat jullie voor mijn woning uitzoeken welke subsidies en leningen ik echt kan krijgen.";

/**
 * De zin onder de oker knop. "Je zit nergens aan vast" is er op verzoek van de
 * opdrachtgever af (oktober 2026). De overzichtsmail heeft nog de oude zin; dat
 * is een aparte beslissing.
 */
export const UITZOEK_GERUSTSTELLING =
  "Dit overzicht is een indicatie. We zoeken voor je uit wat er voor jouw huis echt in zit.";

export type UitzoekUitkomst = "verstuurd" | "geen-contact";

type SessieBerichtArgs = {
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  overzichtUrl?: string;
  /** Moment (ms) waarop het resultaat in beeld kwam. */
  sindsMs: number;
  nuMs?: number;
  /** Te vervangen in tests; standaard een gewone timeout. */
  wacht?: (ms: number) => Promise<void>;
};

/** De oker knop: het verzoek om uit te zoeken wat er voor dit huis in zit. */
export function vraagUitzoekenAan(args: SessieBerichtArgs): Promise<UitzoekUitkomst> {
  return stuurSessieBericht({ ...args, bericht: UITZOEK_BERICHT });
}

/**
 * Een bericht bij de lead uit deze sessie, met de gegevens uit de poort. Ook
 * gebruikt door de vraag na de klik (LastigsteVraag): dezelfde route, dezelfde
 * lead, zodat het team alles op één plek ziet.
 */
export async function stuurSessieBericht(args: SessieBerichtArgs & { bericht: string }): Promise<UitzoekUitkomst> {
  const { input, adres, overzichtUrl, sindsMs, bericht } = args;
  const nu = args.nuMs ?? Date.now();
  const wacht = args.wacht ?? ((ms: number) => new Promise<void>((klaar) => setTimeout(klaar, ms)));

  const bekend = leesContact();
  if (!bekend) return "geen-contact";
  const resultaat = valideerContact(
    {
      voornaam: bekend.voornaam,
      tussenvoegsel: bekend.tussenvoegsel ?? "",
      achternaam: bekend.achternaam,
      email: bekend.email,
      telefoon: bekend.telefoon ?? "",
    },
    { telefoonVerplicht: false },
  );
  if ("fout" in resultaat) return "geen-contact";

  // De function negeert inzendingen onder MIN_INVULTIJD_MS, en dat stil: hij
  // antwoordt gewoon "ok". Klikt iemand vlak na het laden, dan zou de knop
  // "Je aanvraag is binnen" tonen voor iets wat nooit aankomt. Dus wachten we
  // het restje uit in plaats van een te korte duur mee te sturen.
  const verstreken = nu - sindsMs;
  if (verstreken < MIN_INVULTIJD_MS) await wacht(MIN_INVULTIJD_MS - verstreken);

  await verstuurSubsidiecheckBericht({
    waarden: resultaat.waarden,
    bericht,
    input,
    adres,
    leadId: bekend.leadId,
    overzichtUrl,
    duurMs: Math.max(verstreken, MIN_INVULTIJD_MS),
  });
  return "verstuurd";
}
