/**
 * Cijfers voor de onderhoudspagina.
 *
 * Deze pagina is puur informatief. Voortraject doet niets met onderhoud, dus de
 * oude belofte "wij houden overzicht op het onderhoud van je installaties" is
 * eraf; wat blijft is kennis, plus de doorverwijzing naar het gratis gesprek
 * voor de verduurzamingsstappen zelf.
 *
 * Let op bij het uitbreiden: alleen termijnen die een bron ook echt noemt. Voor
 * een warmtepomp en een airco publiceert Milieu Centraal geen interval, alleen
 * "regelmatig". Dat staat er dan ook zo, met de reden erbij. En voor een
 * thuisbatterij geeft geen enkele bron een onderhoudsschema; daar is de
 * installatie het punt, niet het onderhoud. Liever een eerlijk gat dan een
 * verzonnen termijn.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  balansventilatie: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/ventilatie/balansventilatie/",
    gecontroleerd: GECONTROLEERD,
  },
  mechanisch: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/ventilatie/ventilatie-met-mechanische-afvoer/",
    gecontroleerd: GECONTROLEERD,
  },
  zonnepanelen: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/zonnepanelen-onderhouden-vervangen-of-wegdoen/",
    gecontroleerd: GECONTROLEERD,
  },
  koelen: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/energiezuinig-huis/energiezuinig-koelen/airco-en-ventilatoren/",
    gecontroleerd: GECONTROLEERD,
  },
  certificering: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/checklist-warmtepomp-kopen-en-installeren/",
    gecontroleerd: GECONTROLEERD,
  },
  meterkast: {
    naam: "Liander",
    url: "https://www.liander.nl/meterkast/aarding-en-aardlekschakelaar",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/** Wie de beurt doet. Bepaalt de kleur van het plaatje in de kalender. */
export type Uitvoerder = "zelf" | "specialist";

export interface Beurt {
  wat: string;
  wanneer: string;
  wie: Uitvoerder;
  waarom: string;
}

export interface Installatie {
  id: string;
  naam: string;
  /** Voor wie zich afvraagt of deze rij over zijn huis gaat. */
  herkenbaarAan: string;
  beurten: Beurt[];
  /** Waar de termijnen vandaan komen. */
  bron: keyof typeof BRONNEN;
  /** Staat er als het eerlijke voorbehoud onder de rijen. */
  voorbehoud?: string;
}

/**
 * De kalender is het hart van de pagina: per installatie wat er moet gebeuren,
 * wanneer, wie het doet en waarom. Die laatste kolom is het verschil met elke
 * andere onderhoudslijst; zonder reden is het een lijstje huiswerk.
 */
export const KALENDER: Installatie[] = [
  {
    id: "balansventilatie",
    naam: "Balansventilatie met WTW",
    herkenbaarAan: "Een unit op zolder of in een kast, met kanalen door het hele huis.",
    bron: "balansventilatie",
    beurten: [
      {
        wat: "Filters schoonmaken met de stofzuiger",
        wanneer: "Tussen twee vervangingen door",
        wie: "zelf",
        waarom: "Vervuilde filters geven weerstand, dan werkt de motor harder en verbruikt hij meer stroom.",
      },
      {
        wat: "Filters vervangen",
        wanneer: "2 keer per jaar",
        wie: "zelf",
        waarom: "Anders kan er vieze lucht in huis komen en worden schimmels en bacteriën meegeblazen.",
      },
      {
        wat: "Onderhoud aan de unit en de bypass",
        wanneer: "Eens in de 2 jaar",
        wie: "specialist",
        waarom: "De bypass zorgt dat je in de zomer geen warme lucht terugkrijgt.",
      },
      {
        wat: "Systeem controleren en opnieuw inregelen",
        wanneer: "Eens in de 4 jaar",
        wie: "specialist",
        waarom: "Een systeem dat scheef staat afgesteld ventileert te veel of juist te weinig.",
      },
      {
        wat: "Kanalen schoonmaken",
        wanneer: "Eens in de 8 jaar",
        wie: "specialist",
        waarom: "Stof in de kanalen komt uiteindelijk je kamers weer in.",
      },
    ],
  },
  {
    id: "mechanisch",
    naam: "Mechanische afvoer",
    herkenbaarAan: "Ventielen in keuken, badkamer en toilet, met een box op zolder.",
    bron: "mechanisch",
    beurten: [
      {
        wat: "Roosters en ventielen schoonmaken",
        wanneer: "Minstens 1 keer per jaar",
        wie: "zelf",
        waarom: "Zet een ventiel na het schoonmaken terug in dezelfde stand, anders verandert de afstelling.",
      },
      {
        wat: "Onderhoud aan de motor",
        wanneer: "Eens in de 2 jaar",
        wie: "specialist",
        waarom: "De motor draait continu; hij is het onderdeel dat als eerste opgeeft.",
      },
      {
        wat: "Systeem controleren en inregelen",
        wanneer: "Eens in de 4 jaar",
        wie: "specialist",
        waarom: "Na een verbouwing of nieuwe kozijnen klopt de oude afstelling vaak niet meer.",
      },
      {
        wat: "Afvoerkanalen laten reinigen",
        wanneer: "Eens in de 8 jaar",
        wie: "specialist",
        waarom: "Vet en stof in de kanalen beperken de afvoer, juist in de keuken.",
      },
    ],
  },
  {
    id: "zonnepanelen",
    naam: "Zonnepanelen",
    herkenbaarAan: "Panelen op je dak en een omvormer in de meterkast, op zolder of in de garage.",
    bron: "zonnepanelen",
    beurten: [
      {
        wat: "De opbrengst in de gaten houden",
        wanneer: "Doorlopend",
        wie: "zelf",
        waarom: "Zakt de opbrengst met meer dan 10 procent, laat panelen en omvormer dan nakijken.",
      },
      {
        wat: "Panelen schoonmaken",
        wanneer: "Minstens 1 keer per jaar, bij een dak dat (bijna) plat ligt",
        wie: "zelf",
        waarom: "Vanaf een hoek van 20 graden spoelt de regen ze vanzelf schoon en hoeft dit niet.",
      },
      {
        wat: "De omvormer stofvrij houden",
        wanneer: "Regelmatig",
        wie: "zelf",
        waarom: "Stofvrij gaat hij langer mee.",
      },
      {
        wat: "Centrale omvormer vervangen",
        wanneer: "Na ongeveer 12 jaar",
        wie: "specialist",
        waarom: "Micro-omvormers gaan zo'n 25 jaar mee, net zo lang als de panelen zelf.",
      },
    ],
  },
  {
    id: "koudemiddel",
    naam: "Warmtepomp en airco",
    herkenbaarAan: "Een buitenunit, en binnen een unit of een voorraadvat.",
    bron: "koelen",
    voorbehoud:
      "Milieu Centraal noemt hier geen vaste termijn, alleen \"regelmatig\". Wat de juiste termijn is, staat in de voorwaarden van jouw toestel; wij verzinnen er geen.",
    beurten: [
      {
        wat: "Binnen- en buitenunit laten schoonmaken",
        wanneer: "Regelmatig",
        wie: "specialist",
        waarom: "Komt er veel vuil in de buitenunit, dan maakt hij meer lawaai en werkt hij minder zuinig.",
      },
      {
        wat: "Laten controleren op koudemiddellekken",
        wanneer: "Regelmatig",
        wie: "specialist",
        waarom: "Een lek kost rendement en is slecht voor het milieu. Alleen een monteur met F-gassendiploma mag hieraan werken.",
      },
    ],
  },
  {
    id: "meterkast",
    naam: "Meterkast, dus ook bij een laadpaal of thuisbatterij",
    herkenbaarAan: "De aardlekschakelaar met het knopje T of Test.",
    bron: "meterkast",
    voorbehoud:
      "Voor een thuisbatterij en een laadpaal publiceert geen enkele bron een onderhoudsschema. Daar zit het risico niet in het onderhoud maar in de aanleg: op een eigen groep, volgens NEN 1010.",
    beurten: [
      {
        wat: "De testknop van de aardlekschakelaar indrukken",
        wanneer: "Elk half jaar",
        wie: "zelf",
        waarom: "De installatie hoort dan uit te schakelen. Gebeurt dat niet, laat er dan een erkend installateur naar kijken.",
      },
    ],
  },
];

/**
 * De vraag die vrijwel niemand scherp heeft: wat moet van de wet en wat moet
 * van je garantie. Het antwoord is verrassend genoeg dat de wet niets zegt over
 * hoe váák jij onderhoud laat doen, maar wel over wie het mag doen.
 */
export const VERPLICHT = {
  kern: "De wet stelt eisen aan wie het werk doet, niet aan hoe vaak jij het laat doen.",
  wettelijk: [
    {
      naam: "F-gassendiploma",
      tekst: "Verplicht voor iedereen die aan het koudemiddel van een warmtepomp of airco werkt.",
    },
    {
      naam: "BRL 100",
      tekst: "Het certificaat dat het installatiebedrijf zelf moet hebben.",
    },
    {
      naam: "CO-vrij",
      tekst: "Zodra er aan een cv-ketel gewerkt wordt, dus ook bij een hybride warmtepomp.",
    },
    {
      naam: "BRL 6000-21 met SIKB 11000",
      tekst: "Alleen als de warmte uit de bodem komt.",
    },
  ],
  /** Geen wettelijke eis, wel een goed teken. Zelfde lijn als op warmtepomp en airco. */
  extra:
    "STEK is geen wettelijke eis maar een extra kwaliteitskenmerk. Dat geldt ook voor de erkenningsregeling van InstallQ.",
  garantie:
    "Wat wél een termijn oplegt zijn je eigen garantievoorwaarden. Fabrikanten koppelen hun garantie geregeld aan periodiek onderhoud, en dat verschilt per merk en per toestel. Zoek dat op voordat je een beurt overslaat: een vervallen garantie merk je pas als er iets stuk is.",
} as const;

/**
 * Waar je aan merkt dat er iets mis is, voordat het duur wordt. Allemaal
 * signalen die een bewoner zelf kan opmerken, zonder gereedschap.
 */
export const SIGNALEN = [
  {
    signaal: "Muffe lucht, of steeds opnieuw schimmel in de badkamer",
    betekent: "Je ventilatie doet zijn werk niet.",
    doen: "Roosters en ventielen schoonmaken, en het systeem laten controleren.",
  },
  {
    signaal: "De ventilatie maakt meer geluid dan je gewend bent",
    betekent: "Vervuilde filters geven weerstand, waardoor de motor harder werkt.",
    doen: "Filters schoonmaken of vervangen.",
  },
  {
    signaal: "De opbrengst van je zonnepanelen valt meer dan 10 procent terug",
    betekent: "Vaak een omvormer die achteruitgaat, of vuile panelen.",
    doen: "Panelen en omvormer laten nakijken.",
  },
  {
    signaal: "De buitenunit klinkt luider dan eerst",
    betekent: "Er zit vuil in, en dat kost ook rendement.",
    doen: "De unit laten schoonmaken door een gecertificeerde monteur.",
  },
  {
    signaal: "Je aardlekschakelaar schakelt niet uit bij de testknop",
    betekent: "De beveiliging van je hele installatie werkt niet.",
    doen: "Meteen een erkend installateur laten komen.",
  },
] as const;

/**
 * Wat onderhoud oplevert. De oude pagina had hier vier algemene beloftes
 * ("werkt efficiënter", "gaat langer mee"). Nu staat er per punt het mechanisme
 * dat de bron ook echt noemt; dat is het verschil tussen een claim en uitleg.
 */
export const OPBRENGST = [
  {
    kop: "Lagere energiekosten",
    tekst:
      "Vervuilde ventilatiefilters geven weerstand. De motor werkt daardoor harder en verbruikt meer stroom, terwijl je er minder frisse lucht voor terugkrijgt.",
  },
  {
    kop: "Langere levensduur",
    tekst:
      "Een omvormer die je stofvrij houdt gaat langer mee. Bij een centrale omvormer scheelt dat aan het eind van de rit een vervanging die je anders na een jaar of twaalf betaalt.",
  },
  {
    kop: "Problemen op tijd zien",
    tekst:
      "Een opbrengstverlies van meer dan 10 procent op je zonnepanelen is een signaal, geen pech. Wie het niet volgt, merkt het pas op de jaarafrekening.",
  },
  {
    kop: "Minder geluid",
    tekst:
      "Een buitenunit met veel vuil erin maakt meer lawaai. Dat is de klacht die het vaakst bij de buren begint en het makkelijkst te voorkomen is.",
  },
] as const;
