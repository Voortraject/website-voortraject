import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

import { leesContact } from "./contactOpslag";
import { type BerichtSoort, MIN_INVULTIJD_MS, valideerContact, verstuurSubsidiecheckBericht } from "./leadFormulier";

// De oker knop op het resultaat: "Laat gratis uitzoeken wat ik krijg".
//
// Eén klik, geen formulier. De bezoeker gaf in de gegevens-poort al naam, e-mail
// en telefoon, dus hier vragen we niets opnieuw. Het verzoek gaat over dezelfde
// route als een vraag op het resultaat (subsidiecheck-mail, actie "bericht"),
// met soort "uitzoeken" en het lead-id uit de sessie: dan zet de function het
// moment van de klik op díe lead (`uitzoeken_aangevraagd_op`) in plaats van een
// tweede lead te maken. Daar hoort het e-mailadres bij; de function controleert
// dat id en adres bij elkaar horen. Een klik geeft geen mail aan het team: het
// CRM toont hem als vinkje bij de lead.
//
// Testmodus regelt verstuurSubsidiecheckBericht zelf: dan gaat er niets weg.

/**
 * De oude tekst van deze klik. De function gebruikt `soort` en zet deze tekst
 * nergens meer neer; hij gaat alleen nog mee zodat een oudere function (of een
 * nieuwe die een oude bundel krijgt) de klik blijft herkennen. Er staat een kopie
 * in supabase/functions/subsidiecheck-mail/bericht.ts; de test bewaakt dat ze
 * gelijk blijven. Dus niet aanpassen zonder die kopie.
 */
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

/**
 * De oude tekstvorm van de keuzes bij "Wat vind je het lastigst?", om dezelfde
 * reden als UITZOEK_BERICHT nog meegestuurd. De function herkent "Lastigst: "
 * aan het begin en splitst de rest op ", ".
 */
export function lastigstTekst(keuzes: string[]): string {
  return `Lastigst: ${keuzes.join(", ")}`;
}

/** De oker knop: het verzoek om uit te zoeken wat er voor dit huis in zit. */
export function vraagUitzoekenAan(args: SessieBerichtArgs): Promise<UitzoekUitkomst> {
  return stuurSessieBericht({ ...args, soort: "uitzoeken", bericht: UITZOEK_BERICHT });
}

/** De keuzes bij "Wat vind je het lastigst?", in optievolgorde. */
export function bewaarLastigst(args: SessieBerichtArgs & { keuzes: string[] }): Promise<UitzoekUitkomst> {
  return stuurSessieBericht({ ...args, soort: "lastigst", bericht: lastigstTekst(args.keuzes) });
}

/**
 * Een klik bij de lead uit deze sessie, met de gegevens uit de poort. Gedeeld
 * door de oker knop en LastigsteVraag: dezelfde route, dezelfde lead, zodat het
 * team alles op één plek ziet.
 */
export async function stuurSessieBericht(
  args: SessieBerichtArgs & { soort: Exclude<BerichtSoort, "vraag">; bericht: string; keuzes?: string[] },
): Promise<UitzoekUitkomst> {
  const { input, adres, overzichtUrl, sindsMs, bericht, soort, keuzes } = args;
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
    soort,
    keuzes,
    // Maakt de function hier toch een nieuwe lead (geen lead-id in de sessie),
    // dan komen de tegels uit de poort er ook bij.
    hulpvragen: bekend.hulpvragen,
    input,
    adres,
    leadId: bekend.leadId,
    overzichtUrl,
    duurMs: Math.max(verstreken, MIN_INVULTIJD_MS),
  });
  return "verstuurd";
}
