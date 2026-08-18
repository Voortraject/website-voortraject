/**
 * Cijfers voor de aircopagina.
 *
 * Het eerlijke verhaal begint hier bij het verbruik. Een mobiele airco is het
 * apparaat dat mensen het snelst kopen en het duurste is in gebruik; een vaste
 * split verbruikt minder en een ventilator verslaat ze allebei met afstand. Dat
 * hoort bovenaan een pagina van een verduurzamingsintermediair te staan.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  koelen: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/energiezuinig-huis/energiezuinig-koelen/airco-en-ventilatoren/",
    gecontroleerd: GECONTROLEERD,
  },
  geluid: {
    naam: "Informatiepunt Leefomgeving",
    url: "https://iplo.nl/regelgeving/regels-voor-activiteiten/technische-bouwactiviteit/nieuwbouw/rijksregels/geluid-bouwwerkinstallaties/",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/** Uitgangspunt van de verbruikstabel bij de bron. */
export const REKENBASIS = {
  uren: 110,
  stroomprijs: "21 cent per kWh",
} as const;

export interface Koelsysteem {
  naam: string;
  /** Verbruik in kWh over de rekenbasis. */
  kwh: number;
  euro: number;
  co2: number;
  toelichting: string;
}

export const KOELSYSTEMEN: Koelsysteem[] = [
  {
    naam: "Ventilator",
    kwh: 5.5,
    euro: 1,
    co2: 1.4,
    toelichting: "Koelt de lucht niet, maar laat je wel koeler aanvoelen.",
  },
  {
    naam: "Vaste single split",
    kwh: 80,
    euro: 17,
    co2: 21,
    toelichting: "Eén binnenunit met een buitenunit. De zuinigste manier om echt te koelen.",
  },
  {
    naam: "Mobiele airco",
    kwh: 110,
    euro: 23,
    co2: 28,
    toelichting: "De slang door het raam laat warme lucht terug naar binnen, dus hij vraagt meer stroom dan een vaste split.",
  },
  {
    naam: "Multi split",
    kwh: 180,
    euro: 37,
    co2: 46,
    toelichting: "Meerdere binnenunits op één buitenunit, dus ook meer ruimtes die koelen.",
  },
];

/** Het cijfer waar het om draait bij de vergelijking hierboven. */
export const VERHOUDING = "Een mobiele airco gebruikt twintig keer zoveel stroom als een ventilator.";

/** Wat je doet vóór je een airco koopt. */
export const EERST_DIT = [
  {
    kop: "Zonwering buiten",
    tekst: "Warmte tegenhouden vóór hij door het glas komt werkt beter dan hem er daarna uithalen.",
  },
  {
    kop: "Isolatie",
    tekst: "Een geïsoleerde woning wordt in de zomer minder snel warm, precies zoals hij in de winter minder snel afkoelt.",
  },
  {
    kop: "'s Nachts luchten",
    tekst: "Koele nachtlucht binnenlaten en overdag alles dicht houden scheelt vaak al graden.",
  },
  {
    kop: "Een ventilator",
    tekst: "Kost een fractie in aanschaf en in stroom, en is op de meeste dagen genoeg.",
  },
] as const;

/**
 * Verwarmen met een airco. Een split-airco is technisch een lucht-lucht
 * warmtepomp, dus dit is geen truc maar dezelfde techniek in een andere vorm.
 */
export const VERWARMEN = {
  kern: "Een split-airco is technisch een lucht-lucht warmtepomp. Draai je hem om, dan haalt hij warmte uit de buitenlucht en blaast die je kamer in.",
  past: [
    "Een losse ruimte die je nu met gas of elektrische kachels verwarmt, zoals een zolder, thuiskantoor of aanbouw.",
    "Bijverwarmen in het voor- en naseizoen, zodat de cv-ketel later aan hoeft.",
  ],
  pastNiet: [
    "De hele woning gasloos verwarmen. Een airco blaast warme lucht en verwarmt geen tapwater.",
    "Ruimtes waar je continu een gelijkmatige temperatuur wilt; daar is een watergedragen systeem prettiger.",
  ],
  grens:
    "Wil je van het gas af voor je hele woning, dan is een warmtepomp de logische route en kan een airco daar hooguit een aanvulling op zijn.",
} as const;

/** Geluid, zelfde regel als voor de buitenunit van een warmtepomp. */
export const GELUID = {
  grenswaarde: 40,
  dagwaarde: 45,
  artikel: "artikel 4.107 van het Besluit bouwwerken leefomgeving",
} as const;

export const getal = (waarde: number) => waarde.toLocaleString("nl-NL");
export const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;
