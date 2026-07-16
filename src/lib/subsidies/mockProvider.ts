import type { SubsidieProvider } from "./provider";
import type { Bewonertype, Maatregel, SubsidieCheckInput, SubsidieRegeling } from "./types";
import { ALLE_MAATREGELEN } from "./types";

// Realistische voorbeelddata in het formaat van de Energiesubsidiewijzer
// (Verbeterjehuis): rijk + provincie + gemeente + overig, met regiofiltering
// op de PDOK-gemeente/-provincie. Regelingen en bedragen zijn indicatief —
// deze provider bestaat om de volledige flow te kunnen bouwen en testen en
// wordt vervangen door de echte bron (zie provider.ts).
//
// De id's spiegelen de échte bron-slugs (laatste padsegment van de
// Verbeterjehuis-URL): zo gedraagt de afscherming (GRATIS_ZICHTBARE_IDS,
// allowlist op id) zich op voorbeelddata exact zoals op live data.

type MockRegeling = SubsidieRegeling & {
  /** Alleen tonen binnen deze provincies (naast eventuele gemeenten-match). */
  provincies?: string[];
  /** Alleen tonen binnen deze gemeenten. */
  gemeenten?: string[];
};

const alleEigenaren: Bewonertype[] = ["woningeigenaar", "vve", "verhuurder"];

// Nij Begun geldt voor Groningen + Noord-Drenthe.
const NOORD_DRENTHE = ["Aa en Hunze", "Assen", "Noordenveld", "Tynaarlo"];

const REGELINGEN: MockRegeling[] = [
  // ---------- Rijksoverheid ----------
  {
    id: "isde-subsidie-rijksoverheid",
    titel: "ISDE-subsidie",
    niveau: "rijk",
    type: "subsidie",
    aanbieder: "Rijksoverheid (RVO)",
    omschrijving:
      "De landelijke basissubsidie voor het verduurzamen van je koopwoning.",
    bedragIndicatie: "tot ± 30% van de kosten",
    voorWie: "Eigenaren van een bestaande koopwoning die zelf in de woning wonen.",
    belangrijksteVoorwaarde:
      "Je vraagt de subsidie aan binnen 24 maanden nadat de maatregel is uitgevoerd door een erkend bedrijf.",
    bronUrl: "https://www.rvo.nl/subsidies-financiering/isde",
    maatregelen: ["isolatie", "warmtepomp", "zonneboiler", "warmtenet", "elektrisch-koken", "ventilatie"],
    doelgroepen: ["woningeigenaar"],
  },
  {
    id: "subsidieregeling-verduurzaming-voor-verenigingen-van-eigenaars-svve",
    titel: "SVVE-subsidie voor VvE's",
    niveau: "rijk",
    type: "subsidie",
    aanbieder: "Rijksoverheid (RVO)",
    omschrijving: "De landelijke subsidie voor VvE's die het gebouw willen verduurzamen.",
    bedragIndicatie: "tot ± 30% van de kosten",
    voorWie: "Verenigingen van Eigenaren, wooncoöperaties en verenigingen van gezamenlijk bezit.",
    belangrijksteVoorwaarde:
      "De aanvraag loopt via de VvE; voor sommige onderdelen is een energieadvies of meerjarenonderhoudsplan nodig.",
    bronUrl: "https://www.rvo.nl/subsidies-financiering/svve",
    maatregelen: ["isolatie", "warmtepomp", "zonneboiler", "ventilatie", "warmtenet"],
    doelgroepen: ["vve"],
  },
  {
    id: "subsidie-waardevermeerdering-drenthe-en-groningen",
    titel: "Subsidie Waardevermeerdering",
    niveau: "rijk",
    type: "subsidie",
    aanbieder: "SNN",
    omschrijving: "Voor bewoners in het aardbevingsgebied met erkende schade vanaf € 1.000.",
    bedragIndicatie: "tot € 4.000",
    voorWie: "Bewoners in het Groningse aardbevingsgebied met een erkende schademelding.",
    belangrijksteVoorwaarde:
      "Je hebt een erkende schade van minimaal € 1.000 en besteedt het bedrag aan verduurzaming of woningverbetering.",
    bronUrl: "https://www.snn.nl/subsidies-voor-particulieren/subsidie-waardevermeerdering",
    maatregelen: ALLE_MAATREGELEN,
    doelgroepen: ["woningeigenaar", "huurder"],
    provincies: ["Groningen"],
    gemeenten: NOORD_DRENTHE,
  },

  // ---------- Provincie / regionaal ----------
  {
    id: "subsidie-isolatie-nij-begun",
    titel: "Subsidie Isolatie Nij Begun",
    niveau: "provincie",
    type: "subsidie",
    aanbieder: "SNN (Nij Begun)",
    omschrijving: "Isoleer je woning tot de isolatiestandaard. Gaat per postcodegebied open.",
    bedragIndicatie: "tot € 10.000",
    voorWie: "Woningeigenaren in Groningen en Noord-Drenthe, per postcodegebied.",
    belangrijksteVoorwaarde:
      "Je postcodegebied moet zijn opengesteld; de regeling opent gefaseerd, dus timing is belangrijk.",
    bronUrl: "https://www.snn.nl/subsidies-voor-particulieren/subsidie-isolatie-nij-begun",
    maatregelen: ["isolatie", "ventilatie"],
    doelgroepen: ["woningeigenaar"],
    provincies: ["Groningen"],
    gemeenten: NOORD_DRENTHE,
  },
  {
    id: "subsidie-verduurzaming-en-verbetering-groningen-10-000",
    titel: "Subsidie Verduurzaming en Verbetering Groningen",
    niveau: "provincie",
    type: "subsidie",
    aanbieder: "SNN",
    omschrijving: "Verduurzaming én verbetering van je woning, in het aangewezen postcodegebied.",
    bedragIndicatie: "tot € 10.000",
    voorWie: "Woningeigenaren in aangewezen postcodegebieden in de provincie Groningen.",
    belangrijksteVoorwaarde:
      "Je adres valt binnen het aangewezen postcodegebied; een deel is bedoeld voor woningverbetering.",
    bronUrl:
      "https://www.snn.nl/subsidies-voor-particulieren/subsidie-verduurzaming-en-verbetering-groningen-eu-10000",
    maatregelen: ALLE_MAATREGELEN,
    doelgroepen: ["woningeigenaar"],
    provincies: ["Groningen"],
  },
  {
    id: "subsidie-energiebesparende-isolatiemaatregelen-drenthe",
    titel: "Subsidie energiebesparende isolatiemaatregelen Drenthe",
    niveau: "provincie",
    type: "subsidie",
    aanbieder: "Provincie Drenthe",
    omschrijving: "Provinciale bijdrage voor woningisolatie, bovenop de landelijke regelingen.",
    voorWie: "Woningeigenaren in de provincie Drenthe.",
    belangrijksteVoorwaarde:
      "Combineerbaar met de landelijke ISDE; het beschikbare budget is beperkt, dus op tijd aanvragen loont.",
    bronUrl: "https://www.provincie.drenthe.nl/loket/subsidieloket/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    provincies: ["Drenthe"],
  },

  // ---------- Gemeente ----------
  {
    id: "subsidie-lokale-aanpak-isolatie-emmen",
    titel: "Subsidie lokale aanpak isolatie Emmen",
    niveau: "gemeente",
    type: "subsidie",
    aanbieder: "Gemeente Emmen",
    omschrijving: "Gemeentelijke subsidie voor het isoleren van je woning.",
    voorWie: "Woningeigenaren in de gemeente Emmen.",
    belangrijksteVoorwaarde:
      "Bedoeld als aanvulling op de landelijke regelingen; voorwaarden verschillen per aanpakronde.",
    bronUrl: "https://gemeente.emmen.nl/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    gemeenten: ["Emmen"],
  },
  {
    id: "subsidie-voor-woningisolatie-nij-begun-maatregel-29",
    titel: "Subsidie voor woningisolatie (Nij Begun, maatregel 29)",
    niveau: "gemeente",
    type: "subsidie",
    aanbieder: "Gemeente Groningen",
    omschrijving: "Aanvullende gemeentelijke subsidie voor woningisolatie.",
    voorWie: "Woningeigenaren in de gemeente Groningen.",
    belangrijksteVoorwaarde:
      "Aanvullend op de landelijke en provinciale regelingen; te combineren binnen de Nij Begun-aanpak.",
    bronUrl: "https://gemeente.groningen.nl/subsidie-voor-woningisolatie-maatregel-29-van-nij-begun",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    gemeenten: ["Groningen"],
  },
  {
    id: "subsidie-verduurzaming-volkshuisvesting-drenthe",
    titel: "Subsidie verduurzaming volkshuisvesting Drenthe",
    niveau: "gemeente",
    type: "subsidie",
    aanbieder: "Gemeenten Aa en Hunze, Borger-Odoorn, Emmen en Coevorden",
    omschrijving: "In bepaalde postcodegebieden subsidie voor het isoleren van je woning.",
    voorWie: "Woningeigenaren en huurders in aangewezen postcodegebieden in deze Drentse gemeenten.",
    belangrijksteVoorwaarde:
      "Je adres valt binnen een aangewezen postcodegebied; het budget verschilt per gemeente.",
    bronUrl: "https://www.verbeterjehuis.nl/energiesubsidiewijzer/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar", "huurder"],
    gemeenten: ["Aa en Hunze", "Borger-Odoorn", "Emmen", "Coevorden"],
  },

  // ---------- Overig / leningen ----------
  {
    id: "energiebespaarlening-warmtefonds",
    titel: "Energiebespaarlening Nationaal Warmtefonds",
    niveau: "overig",
    type: "lening",
    aanbieder: "Nationaal Warmtefonds",
    omschrijving: "Lening met lage rente (0% bij een lager inkomen) voor vrijwel alle maatregelen.",
    bedragIndicatie: "€ 1.000 – € 71.000",
    voorWie: "Woningeigenaren en VvE's die een deel van de kosten willen lenen tegen lage rente.",
    belangrijksteVoorwaarde:
      "Dit is een lening die je terugbetaalt (geen subsidie); de rente hangt af van je inkomen en looptijd.",
    bronUrl: "https://www.warmtefonds.nl/",
    maatregelen: ALLE_MAATREGELEN,
    doelgroepen: alleEigenaren,
  },
];

function geldtVoorRegio(regeling: MockRegeling, input: SubsidieCheckInput): boolean {
  if (!regeling.provincies && !regeling.gemeenten) return true;
  const provincie = input.provincie?.trim();
  const gemeente = input.gemeente?.trim();
  if (regeling.provincies && provincie && regeling.provincies.includes(provincie)) return true;
  if (regeling.gemeenten && gemeente && regeling.gemeenten.includes(gemeente)) return true;
  return false;
}

export function filterRegelingen(
  regelingen: MockRegeling[],
  input: SubsidieCheckInput,
): SubsidieRegeling[] {
  const gekozen: Maatregel[] = input.maatregelen.length > 0 ? input.maatregelen : ALLE_MAATREGELEN;
  return regelingen
    .filter((r) => r.doelgroepen.includes(input.bewonertype))
    .filter((r) => geldtVoorRegio(r, input))
    .filter((r) => r.maatregelen.some((m) => gekozen.includes(m)))
    .map(({ provincies: _p, gemeenten: _g, ...regeling }) => regeling);
}

export const mockSubsidieProvider: SubsidieProvider = {
  naam: "Voorbeeldgegevens",
  async check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
    // Kleine vertraging zodat de laadsequentie in de UI zich gedraagt als bij
    // een echte bron.
    await new Promise((r) => setTimeout(r, 700));
    return filterRegelingen(REGELINGEN, input);
  },
};
