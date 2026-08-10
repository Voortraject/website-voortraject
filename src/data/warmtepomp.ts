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
  /** De rijen van de vergelijking, in deze volgorde. */
  hoe: string;
  gas: string;
  isolatie: string;
  aanvoer: string;
  afgifte: string;
  buitenunit: string;
  pastAls: string;
  referentie: Referentiewoning;
}

export const SYSTEMEN: Systeem[] = [
  {
    id: "hybride",
    naam: "Hybride warmtepomp",
    kort: "De warmtepomp doet het grootste deel van het jaar het werk, de cv-ketel springt bij als het koud wordt.",
    aanschaf: 6200,
    aanschafNoot:
      "Voor een warmtepomp van 4 kW naast een bestaande cv-ketel. Moet de ketel ook vervangen worden, dan rekent Milieu Centraal met € 8.300.",
    hoe: "Werkt samen met je cv-ketel. De warmtepomp verwarmt zolang dat efficiënt kan, bij lage buitentemperaturen neemt de ketel het over.",
    gas: "Je gasverbruik voor verwarmen daalt met 60 tot 70 procent. De gasaansluiting blijft.",
    isolatie:
      "Werkt ook in een matig geïsoleerde woning. Hoe beter geïsoleerd, hoe vaker de warmtepomp het alleen afkan.",
    aanvoer: "Maakt water van 30 tot 55 graden; de ketel vult aan als er meer nodig is.",
    afgifte: "Je bestaande radiatoren kunnen meestal blijven zitten.",
    buitenunit: "Ja, met de geluidseisen die daarbij horen.",
    pastAls:
      "Je stap voor stap van het gas af wilt, je cv-ketel toe is aan vervanging, of je woning nog niet goed genoeg geïsoleerd is voor volledig elektrisch.",
    referentie: {
      woning: "matig geïsoleerde hoekwoning",
      voor: { gas: 1360, stroom: 310, kosten: 1950 },
      na: { gas: 680, stroom: 1925, kosten: 1350 },
      noot: "Je CO2-uitstoot voor verwarmen en warm water daalt met ruim 30 procent.",
    },
  },
  {
    id: "elektrisch",
    naam: "Volledig elektrische warmtepomp",
    kort: "Verzorgt de verwarming en het warme water in zijn eentje. De gasaansluiting kan eruit.",
    aanschaf: 12000,
    aanschafNoot:
      "Voor een warmtepomp met een buitenunit. Haal je de warmte uit de bodem, dan rekent Milieu Centraal met € 30.000; dat levert wel het hoogste rendement.",
    hoe: "Verwarmt de woning en het tapwater volledig elektrisch. Er is geen cv-ketel meer die bijspringt.",
    gas: "Je gebruikt geen gas meer voor verwarmen. De gasaansluiting en het vastrecht daarvoor vervallen.",
    isolatie:
      "Vraagt minstens een redelijk tot goed geïsoleerde woning: 8 tot 12 cm dak- en vloerisolatie (Rc 2,5 of hoger), een geïsoleerde spouw en HR++ glas.",
    aanvoer: "Werkt met maximaal 45 tot 55 graden. Daaronder blijven is precies waar het rendement vandaan komt.",
    afgifte:
      "Vloer- of wandverwarming, of radiatoren die bij lage temperatuur genoeg warmte afgeven. Vaak moeten er een paar groter.",
    buitenunit: "Ja, tenzij je de warmte uit de bodem haalt.",
    pastAls:
      "Je woning al goed geïsoleerd is of dat wordt, en je in één keer van het gas af wilt.",
    referentie: {
      woning: "goed geïsoleerde hoekwoning met twee bewoners",
      voor: { gas: 950, stroom: 250, kosten: 1720 },
      na: { gas: 0, stroom: 3400, kosten: 720 },
      noot: "In die € 1.720 zit € 360 vastrecht voor de gasaansluiting. Dat deel verdwijnt zodra het gas eruit gaat. Je CO2-uitstoot voor verwarmen daalt met 60 tot 70 procent.",
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
      tekst:
        "Alleen de temperatuur van het cv-water. Laat de instelling voor warm tapwater staan zoals hij staat, die heeft er niets mee te maken.",
    },
    {
      kop: "Zet de radiatoren helemaal open",
      tekst:
        "In alle kamers die je normaal verwarmt. Een radiator die op de helft staat, geeft bij 50 graden te weinig warmte af en dat vertekent de uitkomst.",
    },
    {
      kop: "Wacht op een echt koude periode",
      tekst:
        "Milieu Centraal doet de test in de winter en kijkt naar nachten onder de min 5 graden. Op een zachte dag bewijst de test niets.",
    },
    {
      kop: "Kijk of het comfortabel blijft",
      tekst:
        "Blijft je woning warm, dan is hij klaar voor een volledig elektrische warmtepomp. Lukt dat niet, dan is er eerst isolatie nodig, of past een hybride beter.",
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
    "Niet onder een slaapkamerraam, van jou of van de buren. Kijk waar de ramen en deuren bij de perceelgrens zitten.",
    "Niet op een dak of constructie die trillingen doorgeeft aan de woning.",
    "Een omkasting mag, maar houd ongeveer 20 cm vrij: de unit moet lucht kunnen aanzuigen.",
    "De afstand tot de grens is niet het criterium. Wat telt is hoeveel geluid er op de perceelgrens overblijft.",
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
  moet: {
    kop: "Dit hoort er te zijn",
    items: [
      {
        naam: "F-gassen",
        tekst:
          "Wettelijk verplicht voor de monteur die met koudemiddelen werkt. Zonder dat certificaat mag hij de warmtepomp niet aansluiten.",
      },
      {
        naam: "BRL 100",
        tekst: "De erkenning van het installatiebedrijf zelf.",
      },
      {
        naam: "CO-vrij",
        tekst:
          "Nodig zodra er aan een cv-ketel gewerkt wordt, dus altijd bij een hybride warmtepomp en bij het vervangen van de ketel.",
      },
      {
        naam: "BRL 6000-21 met SIKB 11000",
        tekst: "Alleen van toepassing als de warmte uit de bodem komt.",
      },
    ],
  },
  extra: {
    kop: "Dit zegt iets extra's",
    items: [
      {
        naam: "STEK Warmtepomp-module D",
        tekst: "Aanvullende erkenning voor bedrijven die met koudemiddelen werken.",
      },
      {
        naam: "Vakmanschap Warmtepompen",
        tekst: "Gericht op de kennis van de monteur, niet op het bedrijf.",
      },
      {
        naam: "Erkenningsregeling InstallQ",
        tekst: "Onafhankelijke toetsing van het installatiebedrijf.",
      },
    ],
  },
} as const;

export const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;

/** Nederlandse notatie voor de rendementscijfers: 5.9 wordt 5,9. */
export const getal = (waarde: number) => waarde.toLocaleString("nl-NL");
