/**
 * Cijfers voor de warmtepomppagina.
 *
 * Bewust géén subsidiebedragen: welke regeling voor jou geldt hangt van je
 * adres af. In Groningen en Noord-Drenthe loopt dat via Nij Begun, elders via
 * de landelijke en gemeentelijke regelingen. Alles hieronder is dus vóór
 * subsidie gerekend; wat je adres oplevert, komt uit de subsidiecheck. Zelfde
 * keuze als op de isolatiepagina (src/data/isolatie.ts).
 *
 * Let op bij het lezen van de twee rekenvoorbeelden: Milieu Centraal rekent
 * voor de hybride met een mátig geïsoleerde woning en voor de volledig
 * elektrische met een góed geïsoleerde woning. Die twee bedragen naast elkaar
 * zetten alsof het hetzelfde huis is, klopt niet. Het verschil ís het verhaal:
 * welke van de twee bij je past, hangt aan je isolatie. De pagina zegt dat er
 * expliciet bij.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  hybride: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/hybride-warmtepomp/",
    gecontroleerd: GECONTROLEERD,
  },
  elektrisch: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/volledige-warmtepomp/",
    gecontroleerd: GECONTROLEERD,
  },
  verwarmingstest: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/energiezuinig-wonen/verwarmingstest-is-jouw-huis-klaar-voor-een-warmtepomp/",
    gecontroleerd: GECONTROLEERD,
  },
  rendement: {
    naam: "Consumentenbond",
    url: "https://www.consumentenbond.nl/warmtepomp/rendement-warmtepomp",
    gecontroleerd: GECONTROLEERD,
  },
  geluid: {
    naam: "Informatiepunt Leefomgeving",
    url: "https://iplo.nl/regelgeving/regels-voor-activiteiten/technische-bouwactiviteit/nieuwbouw/rijksregels/geluid-bouwwerkinstallaties/",
    gecontroleerd: GECONTROLEERD,
  },
  certificering: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/checklist-warmtepomp-kopen-en-installeren/",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/**
 * De prijzen waarmee Milieu Centraal rekent. Niet de tarieven van vandaag maar
 * een gemiddelde over de looptijd, want een warmtepomp koop je voor twintig
 * jaar en niet voor het contract van dit jaar.
 */
export const PRIJSPEIL = "gemiddelde gas- en stroomprijzen voor 2026 tot 2040";

/** Waar een cv-ketel meestal op staat, als ijkpunt voor de warmtepomp. */
export const CV_KETEL_AANVOER = "60 tot 80 graden";

export type SysteemId = "hybride" | "elektrisch";

/**
 * Eén vak in de vergelijking. De kern is wat je ziet als je de tabel scant, de
 * toelichting is voor wie blijft hangen. Zonder die tweedeling werd elk vak een
 * alinea en las de tabel als een lap tekst.
 */
export interface Cel {
  kern: string;
  toelichting?: string;
}

export interface Referentiewoning {
  /** Zo omschrijft de bron het huis waar de som over gaat. */
  woning: string;
  voor: { gas: number; stroom: number; kosten: number };
  na: { gas: number; stroom: number; kosten: number };
  /** Extra dat de bezoeker moet weten om het bedrag te kunnen plaatsen. */
  noot?: string;
}

export interface Systeem {
  id: SysteemId;
  naam: string;
  kort: string;
  /** Aanschaf inclusief btw en plaatsing, vóór subsidie. */
  aanschaf: number;
  aanschafNoot: string;
  /**
   * De rijen van de vergelijking. "Past als" stond hier ook, maar dat is precies
   * wat de sectie "Past dit bij jouw woning" al doet; twee keer hetzelfde
   * antwoord maakt de tabel alleen langer.
   */
  hoe: Cel;
  gas: Cel;
  isolatie: Cel;
  aanvoer: Cel;
  afgifte: Cel;
  buitenunit: Cel;
  referentie: Referentiewoning;
}

export const SYSTEMEN: Systeem[] = [
  {
    id: "hybride",
    naam: "Hybride warmtepomp",
    kort: "Doet het grootste deel van het jaar het werk, de cv-ketel springt bij.",
    aanschaf: 6200,
    aanschafNoot: "Warmtepomp van 4 kW naast een bestaande ketel. Met een nieuwe ketel erbij € 8.300.",
    hoe: {
      kern: "Samen met je cv-ketel",
      toelichting: "Bij lage buitentemperaturen neemt de ketel het over.",
    },
    gas: {
      kern: "60 tot 70 procent minder",
      toelichting: "De gasaansluiting blijft.",
    },
    isolatie: {
      kern: "Werkt ook matig geïsoleerd",
      toelichting: "Hoe beter de schil, hoe vaker de warmtepomp het alleen afkan.",
    },
    aanvoer: {
      kern: "30 tot 55 graden",
      toelichting: "De ketel vult aan als er meer nodig is.",
    },
    afgifte: {
      kern: "Radiatoren kunnen blijven",
    },
    buitenunit: {
      kern: "Ja",
      toelichting: "Met de geluidseisen die daarbij horen.",
    },
    referentie: {
      woning: "matig geïsoleerde hoekwoning",
      voor: { gas: 1360, stroom: 310, kosten: 1950 },
      na: { gas: 680, stroom: 1925, kosten: 1350 },
      noot: "CO2-uitstoot voor verwarmen en warm water ruim 30 procent lager.",
    },
  },
  {
    id: "elektrisch",
    naam: "Volledig elektrische warmtepomp",
    kort: "Verzorgt de verwarming en het warme water in zijn eentje.",
    aanschaf: 12000,
    aanschafNoot: "Met buitenunit. Uit de bodem € 30.000, met het hoogste rendement.",
    hoe: {
      kern: "In zijn eentje",
      toelichting: "Geen cv-ketel meer, ook niet voor het warme water.",
    },
    gas: {
      kern: "Helemaal geen gas",
      toelichting: "Aansluiting en vastrecht vervallen.",
    },
    isolatie: {
      kern: "Redelijk tot goed geïsoleerd",
      toelichting: "Rc 2,5 of hoger op dak en vloer, geïsoleerde spouw, HR++ glas.",
    },
    aanvoer: {
      kern: "Maximaal 45 tot 55 graden",
      toelichting: "Daaronder blijven levert het rendement op.",
    },
    afgifte: {
      kern: "Vloerverwarming of grotere radiatoren",
    },
    buitenunit: {
      kern: "Ja, tenzij uit de bodem",
    },
    referentie: {
      woning: "goed geïsoleerde hoekwoning met twee bewoners",
      voor: { gas: 950, stroom: 250, kosten: 1720 },
      na: { gas: 0, stroom: 3400, kosten: 720 },
      noot: "In die € 1.720 zit € 360 vastrecht voor gas; dat vervalt. CO2-uitstoot voor verwarmen 60 tot 70 procent lager.",
    },
  },
];

/**
 * De verwarmingstest van Milieu Centraal. Het aardige eraan is dat je hem zelf
 * kunt doen, met de installatie die er nu hangt: 50 graden is ongeveer wat een
 * warmtepomp levert, dus blijft het comfortabel, dan kan je woning het aan.
 */
export const VERWARMINGSTEST = {
  temperatuur: 50,
  stappen: [
    {
      kop: "Zet je cv-ketel op 50 graden",
      tekst: "Alleen het cv-water. De stand voor warm tapwater laat je staan.",
    },
    {
      kop: "Zet de radiatoren helemaal open",
      tekst: "In alle kamers die je normaal verwarmt, anders vertekent de uitkomst.",
    },
    {
      kop: "Wacht op een echt koude periode",
      tekst: "Op een zachte dag bewijst de test niets; het gaat om nachten onder de min 5 graden.",
    },
    {
      kop: "Kijk of het comfortabel blijft",
      tekst: "Zo ja, dan kan je woning volledig elektrisch. Zo nee, dan eerst isoleren of een hybride.",
    },
  ],
} as const;

/**
 * Rendement, en waarom lage temperatuur alles bepaalt.
 *
 * COP is het rendement op één moment, SCOP het jaargemiddelde. Dezelfde
 * warmtepomp haalt met vloerverwarming een flink hogere COP dan met alleen
 * radiatoren, en bij vorst zakken ze allebei. Dat is het eerlijke antwoord op
 * "hoeveel levert een warmtepomp op": dat hangt aan je afgiftesysteem.
 */
export const RENDEMENT = {
  bereik: "meestal tussen 3 en 5",
  metingen: [
    { buiten: "7 graden buiten", omschrijving: "een gemiddelde winterdag", vloer: 5.9, radiator: 4.2 },
    { buiten: "min 2 graden buiten", omschrijving: "een echt koude dag", vloer: 3.5, radiator: 2.8 },
  ],
  scopRadiatoren: 2.9,
  scopBodem: "4,5 tot 5",
} as const;

/**
 * Geluid van de buitenunit. De norm staat in het Besluit bouwwerken
 * leefomgeving; de plaatsingstips komen van Milieu Centraal.
 */
export const GELUID = {
  grenswaarde: 40,
  dagwaarde: 45,
  artikel: "artikel 4.107 van het Besluit bouwwerken leefomgeving",
  tevreden: 72,
  tips: [
    "Niet onder een slaapkamerraam, van jou of van de buren.",
    "Niet op een dak of constructie die trillingen doorgeeft.",
    "Een omkasting mag, maar houd 20 cm vrij voor de luchtaanvoer.",
    "Afstand is niet het criterium; het gaat om wat er op de grens overblijft.",
  ],
} as const;

/**
 * Certificeringen, in twee groepen.
 *
 * De oude paginatekst zette BRL 6000-21 neer als "de erkenning voor het
 * ontwerp en de installatie van warmtepompen" en STEK als "verplichte
 * certificering". Allebei net niet: BRL 6000-21 en SIKB 11000 gaan over
 * bodemenergie, en STEK is een aanvullende erkenning, geen wettelijke eis. Wat
 * er wél moet zijn staat hieronder in de eerste groep.
 */
export const CERTIFICERING = {
  moet: [
    { naam: "F-gassen", tekst: "Verplicht voor de monteur, vanwege de koudemiddelen." },
    { naam: "BRL 100", tekst: "De erkenning van het installatiebedrijf." },
    { naam: "CO-vrij", tekst: "Zodra er aan een cv-ketel gewerkt wordt, dus bij elke hybride." },
    { naam: "BRL 6000-21 met SIKB 11000", tekst: "Alleen als de warmte uit de bodem komt." },
  ],
  /**
   * Aanvullende erkenningen. Bewust één regel en geen tweede kolom: het zijn
   * keurmerken die iets extra's zeggen, geen eis, en als kolom trokken ze meer
   * aandacht dan ze verdienen.
   */
  extra: "STEK Warmtepomp-module D, Vakmanschap Warmtepompen en de erkenningsregeling van InstallQ",
} as const;

export const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;

/** Nederlandse notatie voor de rendementscijfers: 5.9 wordt 5,9. */
export const getal = (waarde: number) => waarde.toLocaleString("nl-NL");
