import type { SubsidieProvider } from "./provider";
import type { Bewonertype, Maatregel, SubsidieCheckInput, SubsidieRegeling } from "./types";
import { ALLE_MAATREGELEN } from "./types";

// Realistische voorbeelddata in het formaat van de Energiesubsidiewijzer
// (Verbeterjehuis): rijk + provincie + gemeente + overig, met regiofiltering
// op de PDOK-gemeente/-provincie. Regelingen en bedragen zijn indicatief —
// deze provider bestaat om de volledige flow te kunnen bouwen en testen en
// wordt vervangen door de echte bron (zie provider.ts).

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
    id: "isde",
    titel: "ISDE-subsidie",
    niveau: "rijk",
    aanbieder: "Rijksoverheid (RVO)",
    omschrijving:
      "De landelijke basissubsidie voor het verduurzamen van je koopwoning.",
    bedragIndicatie: "tot ± 30% van de kosten",
    bronUrl: "https://www.rvo.nl/subsidies-financiering/isde",
    maatregelen: ["isolatie", "warmtepomp", "zonneboiler", "warmtenet", "elektrisch-koken", "ventilatie"],
    doelgroepen: ["woningeigenaar"],
  },
  {
    id: "svve",
    titel: "SVVE-subsidie voor VvE's",
    niveau: "rijk",
    aanbieder: "Rijksoverheid (RVO)",
    omschrijving: "De landelijke subsidie voor VvE's die het gebouw willen verduurzamen.",
    bedragIndicatie: "tot ± 30% van de kosten",
    bronUrl: "https://www.rvo.nl/subsidies-financiering/svve",
    maatregelen: ["isolatie", "warmtepomp", "zonneboiler", "ventilatie", "warmtenet"],
    doelgroepen: ["vve"],
  },
  {
    id: "waardevermeerdering",
    titel: "Subsidie Waardevermeerdering",
    niveau: "rijk",
    aanbieder: "SNN",
    omschrijving: "Voor bewoners in het aardbevingsgebied met erkende schade vanaf € 1.000.",
    bedragIndicatie: "tot € 4.000",
    bronUrl: "https://www.snn.nl/subsidies-voor-particulieren/subsidie-waardevermeerdering",
    maatregelen: ALLE_MAATREGELEN,
    doelgroepen: ["woningeigenaar", "huurder"],
    provincies: ["Groningen"],
    gemeenten: NOORD_DRENTHE,
  },

  // ---------- Provincie / regionaal ----------
  {
    id: "nij-begun-isolatie",
    titel: "Subsidie Isolatie Nij Begun",
    niveau: "provincie",
    aanbieder: "SNN (Nij Begun)",
    omschrijving: "Isoleer je woning tot de isolatiestandaard. Gaat per postcodegebied open.",
    bedragIndicatie: "tot € 10.000",
    bronUrl: "https://www.snn.nl/subsidies-voor-particulieren/subsidie-isolatie-nij-begun",
    maatregelen: ["isolatie", "ventilatie"],
    doelgroepen: ["woningeigenaar"],
    provincies: ["Groningen"],
    gemeenten: NOORD_DRENTHE,
  },
  {
    id: "vvg-10000",
    titel: "Subsidie Verduurzaming en Verbetering Groningen",
    niveau: "provincie",
    aanbieder: "SNN",
    omschrijving: "Verduurzaming én verbetering van je woning, in het aangewezen postcodegebied.",
    bedragIndicatie: "tot € 10.000",
    bronUrl:
      "https://www.snn.nl/subsidies-voor-particulieren/subsidie-verduurzaming-en-verbetering-groningen-eu-10000",
    maatregelen: ALLE_MAATREGELEN,
    doelgroepen: ["woningeigenaar"],
    provincies: ["Groningen"],
  },
  {
    id: "drenthe-isolatie",
    titel: "Subsidie energiebesparende isolatiemaatregelen Drenthe",
    niveau: "provincie",
    aanbieder: "Provincie Drenthe",
    omschrijving: "Provinciale bijdrage voor woningisolatie, bovenop de landelijke regelingen.",
    bronUrl: "https://www.provincie.drenthe.nl/loket/subsidieloket/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    provincies: ["Drenthe"],
  },

  // ---------- Gemeente ----------
  {
    id: "emmen-lokale-aanpak",
    titel: "Subsidie lokale aanpak isolatie Emmen",
    niveau: "gemeente",
    aanbieder: "Gemeente Emmen",
    omschrijving: "Gemeentelijke subsidie voor het isoleren van je woning.",
    bronUrl: "https://gemeente.emmen.nl/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    gemeenten: ["Emmen"],
  },
  {
    id: "groningen-maatregel-29",
    titel: "Subsidie voor woningisolatie (Nij Begun, maatregel 29)",
    niveau: "gemeente",
    aanbieder: "Gemeente Groningen",
    omschrijving: "Aanvullende gemeentelijke subsidie voor woningisolatie.",
    bronUrl: "https://gemeente.groningen.nl/subsidie-voor-woningisolatie-maatregel-29-van-nij-begun",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    gemeenten: ["Groningen"],
  },
  {
    id: "volkshuisvesting-drenthe",
    titel: "Subsidie verduurzaming volkshuisvesting Drenthe",
    niveau: "gemeente",
    aanbieder: "Gemeenten Aa en Hunze, Borger-Odoorn, Emmen en Coevorden",
    omschrijving: "In bepaalde postcodegebieden subsidie voor het isoleren van je woning.",
    bronUrl: "https://www.verbeterjehuis.nl/energiesubsidiewijzer/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar", "huurder"],
    gemeenten: ["Aa en Hunze", "Borger-Odoorn", "Emmen", "Coevorden"],
  },

  // ---------- Overig ----------
  {
    id: "warmtefonds",
    titel: "Energiebespaarlening Nationaal Warmtefonds",
    niveau: "overig",
    aanbieder: "Nationaal Warmtefonds",
    omschrijving: "Lening met lage rente (0% bij een lager inkomen) voor vrijwel alle maatregelen.",
    bedragIndicatie: "€ 1.000 – € 71.000",
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
