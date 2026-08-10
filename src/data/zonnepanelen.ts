/**
 * Cijfers voor de zonnepanelenpagina.
 *
 * De oude paginatekst zei dat de salderingsregeling "de komende jaren
 * stapsgewijs wordt afgebouwd". Dat klopt niet meer: hij stopt in één keer op
 * 1 januari 2027. Dat verandert de rekensom zo sterk dat het de kern van de
 * pagina hoort te zijn, niet een zinnetje onderaan.
 *
 * Net als op de andere maatregelpagina's staan hier geen subsidiebedragen: wat
 * er voor deze bezoeker geldt hangt van het adres af en komt uit de
 * subsidiecheck. Het nultarief btw is geen subsidie maar een prijs, dus dat
 * staat er wel bij.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  saldering: {
    naam: "Rijksoverheid",
    url: "https://www.rijksoverheid.nl/themas/klimaat-milieu-en-natuur/energie-thuis/salderingsregeling",
    gecontroleerd: GECONTROLEERD,
  },
  naSaldering: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/zonnestroom-als-de-saldering-stopt-dit-moet-je-weten/",
    gecontroleerd: GECONTROLEERD,
  },
  kosten: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/kosten-en-opbrengst-zonnepanelen/",
    gecontroleerd: GECONTROLEERD,
  },
  dak: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/zonnepanelen-hoe-geschikt-is-je-dak/",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/** Wat er op 1 januari 2027 verandert. */
export const SALDERING = {
  stopt: "1 januari 2027",
  /** Tot en met wanneer je nog kunt salderen. */
  laatsteDag: "31 december 2026",
  ondergrens: "50 procent van het kale leveringstarief",
  ondergrensTot: 2030,
} as const;

export interface PaneelSet {
  panelen: number;
  /** Aanschaf inclusief plaatsing; op zonnepanelen geldt nu 0 procent btw. */
  prijs: number;
  /** Opwek per jaar in kWh. */
  opbrengst: number;
  /** Wat het scheelt op de energierekening, bij 30 procent zelfverbruik. */
  besparingNu: number;
  besparingStraks: number;
}

export const SETS: PaneelSet[] = [
  { panelen: 6, prijs: 2500, opbrengst: 2300, besparingNu: 440, besparingStraks: 160 },
  { panelen: 8, prijs: 3200, opbrengst: 3000, besparingNu: 540, besparingStraks: 170 },
  { panelen: 10, prijs: 3800, opbrengst: 3800, besparingNu: 720, besparingStraks: 240 },
];

export const PANEEL = {
  wattpiek: 435,
  btw: "0 procent",
  levensduur: 25,
} as const;

/**
 * Zelfverbruik: het deel van je eigen opwek dat je direct in huis gebruikt.
 * Vanaf 2027 is dit de knop waar je aan kunt draaien, want alleen dat deel is
 * nog echt geld waard.
 */
export const ZELFVERBRUIK = {
  gemiddeld: 30,
  verhouding: "3 tot 4 keer goedkoper",
  manieren: [
    {
      kop: "Draai je apparaten overdag",
      tekst: "Wasmachine, droger en vaatwasser op de uren dat de zon schijnt.",
    },
    {
      kop: "Laad je auto thuis op zonne-uren",
      tekst: "Een laadpaal met slim laden schuift het laden naar het midden van de dag.",
    },
    {
      kop: "Verwarm elektrisch",
      tekst: "Een warmtepomp verbruikt het hele jaar door en verhoogt je zelfverbruik flink.",
    },
    {
      kop: "Sla het op",
      tekst: "Een thuisbatterij bewaart de opwek van overdag voor de avond.",
    },
  ],
} as const;

/**
 * Opbrengst per dakrichting en hellingshoek, als percentage van het maximum.
 * 100 procent is een dak op het zuiden met 30 tot 45 graden helling.
 */
export const DAK_HOEKEN = [15, 30, 45, 60, 75, 90] as const;

export interface DakRichting {
  naam: string;
  /** Percentages in de volgorde van DAK_HOEKEN. */
  opbrengst: number[];
}

export const DAK_RICHTINGEN: DakRichting[] = [
  { naam: "Zuid", opbrengst: [95, 100, 100, 95, 85, 70] },
  { naam: "Zuidwest", opbrengst: [90, 95, 95, 90, 80, 70] },
  { naam: "Zuidoost", opbrengst: [90, 95, 90, 85, 75, 65] },
  { naam: "West", opbrengst: [85, 80, 75, 70, 60, 55] },
  { naam: "Oost", opbrengst: [85, 80, 75, 70, 60, 50] },
  { naam: "Noordwest", opbrengst: [75, 65, 55, 50, 40, 35] },
  { naam: "Noordoost", opbrengst: [75, 65, 55, 45, 40, 35] },
  { naam: "Noord", opbrengst: [75, 60, 45, 35, 30, 20] },
];

export const DAK_NOTITIES = {
  oostWest:
    "Een oost-westopstelling levert ongeveer 10 procent minder op, maar er passen meer panelen op en de opwek verdeelt zich beter over de dag. Dat laatste telt vanaf 2027 zwaarder, want het verhoogt je zelfverbruik.",
  schaduw:
    "Een beetje schaduw is niet erg, veel schaduw verlaagt de opbrengst flink. Micro-omvormers of power-optimizers per paneel zorgen dat schaduw op één paneel niet het hele systeem meetrekt.",
} as const;

export const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;
export const getal = (waarde: number) => waarde.toLocaleString("nl-NL");
