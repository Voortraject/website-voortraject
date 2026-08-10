/**
 * Cijfers voor de laadpaalpagina.
 *
 * Net als op de andere maatregelpagina's staan hier geen subsidiebedragen: wat
 * er voor deze bezoeker geldt hangt van het adres af en komt uit de
 * subsidiecheck. Voor een laadpaal bij een woning is er landelijk sowieso geen
 * regeling; wat de rekensom bepaalt is het verschil tussen thuis en openbaar
 * laden, en dat staat hieronder.
 *
 * Wat er bewust af gaat: de oude pagina noemde "STEK-gecertificeerde of erkende
 * monteurs" als eis. STEK gaat over koudemiddelen en een laadpaal heeft die
 * niet. Dezelfde fout stond op warmtepomp en airco. Wat er wél toe doet is de
 * elektrische installatie: een aparte groep met eigen zekering en aardlek,
 * aangelegd volgens NEN 1010.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  opladen: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/duurzaam-vervoer/elektrische-auto/opladen-elektrische-auto/",
    gecontroleerd: GECONTROLEERD,
  },
  slimLaden: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/duurzaam-vervoer/elektrische-auto/elektrische-auto-slim-laden/",
    gecontroleerd: GECONTROLEERD,
  },
  zelfverbruik: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/verbruik-zelf-meer-zonnestroom/",
    gecontroleerd: GECONTROLEERD,
  },
  eenFase: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/nieuwsberichten/verduurzamen-kan-ook-zonder-3-fase-aansluiting/",
    gecontroleerd: GECONTROLEERD,
  },
  laadpunt: {
    naam: "Nederland Elektrisch",
    url: "https://nederlandelektrisch.nl/elektrische-auto-wiki/opladen",
    gecontroleerd: GECONTROLEERD,
  },
  aansluiting: {
    naam: "Enexis",
    url: "https://www.enexis.nl/aansluitingen/welke-aansluiting-heb-ik-nodig",
    gecontroleerd: GECONTROLEERD,
  },
  verzwaren: {
    naam: "Enexis",
    url: "https://www.enexis.nl/aansluitingen/doorlooptijden-werkzaamheden/doorlooptijden-aansluiting-verzwaren",
    gecontroleerd: GECONTROLEERD,
  },
  saldering: {
    naam: "Rijksoverheid",
    url: "https://www.rijksoverheid.nl/themas/klimaat-milieu-en-natuur/energie-thuis/salderingsregeling",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/**
 * Eén vak in de vergelijking: een korte kern die je ziet als je de tabel scant
 * en een dunne toelichting voor wie blijft hangen. Zelfde afspraak als op de
 * warmtepomppagina (src/data/warmtepomp.ts), want zonder die tweedeling wordt
 * elk vak een alinea en leest de tabel als een lap tekst.
 */
export interface Cel {
  kern: string;
  toelichting?: string;
}

export type AansluitingId = "een" | "drie";

export interface Aansluiting {
  id: AansluitingId;
  naam: string;
  kort: string;
  /** Het vermogen dat een laadpaal op deze aansluiting mag hebben. */
  laadvermogen: string;
  laadvermogenNoot: string;
  meterkast: Cel;
  vol: Cel;
  ruimte: Cel;
  logisch: Cel;
}

/**
 * De hele keuze zit vast aan wat er in de meterkast binnenkomt. Daarom staat de
 * aansluiting bovenaan de tabel en niet het merk of het model: bij 1-fase is
 * 3,7 kW simpelweg het plafond, hoe duur de paal ook is.
 */
export const AANSLUITINGEN: Aansluiting[] = [
  {
    id: "een",
    naam: "1-faseaansluiting",
    kort: "Wat de meeste bestaande woningen hebben, meestal 1x25A.",
    laadvermogen: "3,7 kW",
    laadvermogenNoot: "Zo'n 70 procent van de huizen heeft een 1-faseaansluiting.",
    meterkast: {
      kern: "Blijft zoals hij is",
      toelichting: "Wel een eigen groep voor de laadpaal.",
    },
    vol: {
      kern: "10 tot 20 uur",
      toelichting: "Afhankelijk van de grootte van de accu.",
    },
    ruimte: {
      kern: "Alles deelt hetzelfde plafond",
      toelichting: "Koken, warmtepomp en laden tegelijk vraagt om load balancing.",
    },
    logisch: {
      kern: "Je laadt 's nachts, thuis",
      toelichting: "Staat de auto tot de ochtend stil, dan merk je van die 10 tot 20 uur niets.",
    },
  },
  {
    id: "drie",
    naam: "3-fasenaansluiting",
    kort: "Standaard bij nieuwbouw, meestal 3x25A.",
    laadvermogen: "7,4 of 11 kW",
    laadvermogenNoot: "Een 3x25A-aansluiting levert 17 kW voor je hele woning.",
    meterkast: {
      kern: "Drie fasen beschikbaar",
      toelichting: "Verzwaren van 1-fase naar 3-fase kan, maar niet altijd snel.",
    },
    vol: {
      kern: "3,5 tot 10 uur",
      toelichting: "Ongeveer drie keer zo snel als op 1-fase.",
    },
    ruimte: {
      kern: "Meer kan tegelijk",
      toelichting: "Ook hier verdeelt load balancing wat er over is.",
    },
    logisch: {
      kern: "Je rijdt veel of laadt tussendoor",
      toelichting: "Of je hebt al 3-fase voor elektrisch koken en een warmtepomp.",
    },
  },
];

/** Wat één uur thuisladen oplevert, over het hele bereik van 3,7 tot 11 kW. */
export const BEREIK_PER_UUR = "20 tot 60 kilometer";

/**
 * Aansluitcapaciteiten van Enexis, de netbeheerder in Groningen en Drenthe.
 * Enexis publiceert geen waarde voor 1x25A, dus die staat hier niet: liever
 * geen getal dan een zelf uitgerekend getal.
 */
export const AANSLUITWAARDEN = [
  { naam: "1x35A", vermogen: "8 kW", omschrijving: "kleine huisaansluiting" },
  { naam: "3x25A", vermogen: "17 kW", omschrijving: "standaard huisaansluiting" },
  { naam: "3x35A", vermogen: "24 kW", omschrijving: "grote huisaansluiting" },
] as const;

/**
 * Verzwaren is geen vanzelfsprekende uitweg, zeker niet in Noord-Nederland.
 * Enexis zegt het zelf het duidelijkst, dus die zin staat er bijna letterlijk.
 */
export const VERZWAREN =
  "Zit het net vol, dan verschilt de wachttijd voor een verzwaring per regio en kan die oplopen van enkele jaren tot 10 jaar.";

/**
 * Wat de installatie moet hebben. De eerste vier punten zijn de harde eisen,
 * het laatste is de veelgemaakte fout.
 */
export const INSTALLATIE = {
  eisen: [
    {
      kop: "Een eigen groep in de meterkast",
      tekst: "Met een eigen zekering, zodat de rest van je huis er niet aan hangt.",
    },
    {
      kop: "Een aparte aardlekschakelaar",
      tekst: "Alleen voor het laadpunt, niet gedeeld met andere groepen.",
    },
    {
      kop: "Aangelegd volgens NEN 1010",
      tekst: "De norm voor elektrische installaties in woningen.",
    },
    {
      kop: "Door een vakbekwaam installateur",
      tekst: "Een laadpaal wordt vast aangesloten; dit is geen klus voor erbij.",
    },
  ],
  stopcontact:
    "Laden aan een gewoon stopcontact wordt sterk afgeraden: de installatie kan verhit raken en dat kan brand geven. Moet het toch een keer, dan alleen met randaarde, op een aparte goed afgezekerde groep volgens NEN 1010 en met een laadbeveiliger in de kabel. Nooit via een verlengsnoer.",
} as const;

/**
 * Load balancing in drie beelden. De percentages zijn de breedte van de balken
 * in de tekening, niet een gemeten verbruik: welk apparaat hoeveel vraagt
 * verschilt per huis, en daar verzinnen we geen getallen voor. Wat de tekening
 * wél hard maakt is de verhouding die overal geldt: de aansluiting is het
 * plafond, en de laadpaal is het enige apparaat dat zichzelf kan afknijpen.
 */
export const BALANCERING = [
  {
    id: "rustig",
    situatie: "'s Nachts, huis in ruststand",
    huis: 18,
    laadpaal: 46,
    overschrijding: 0,
    gevolg: "De laadpaal krijgt zijn volle vermogen.",
    toon: "goed",
  },
  {
    id: "zonder",
    situatie: "Kookplaat en warmtepomp aan, zonder load balancing",
    huis: 72,
    laadpaal: 46,
    overschrijding: 18,
    gevolg: "De hoofdzekering vliegt eruit en je hele huis zit zonder stroom.",
    toon: "fout",
  },
  {
    id: "met",
    situatie: "Zelfde moment, met load balancing",
    huis: 72,
    laadpaal: 28,
    overschrijding: 0,
    gevolg: "De laadpaal knijpt zichzelf af. Alleen de auto laadt langzamer.",
    toon: "goed",
  },
] as const;

/** Het alternatief in de meterkast, voor wie geen laadpaal met deze functie heeft. */
export const VOORRANGSSCHAKELAAR =
  "Heeft je laadpaal of warmtepomp geen load balancing, dan kan een voorrangsschakelaar in de meterkast hetzelfde doen: die schakelt bijvoorbeeld de droger of de warmtepomp even uit terwijl je kookt.";

export interface Laadmanier {
  id: string;
  naam: string;
  toelichting: string;
  /** Kosten per jaar, bij het kilometrage in REKENBASIS. */
  perJaar: number;
  /** Wat je aan de meter betaalt, als de bron dat per manier noemt. */
  tarief?: string;
}

/**
 * De vergelijking van Milieu Centraal. Bewust ook benzine erbij: dat is het
 * bedrag waar de meeste bezoekers vandaan komen, en zonder dat ijkpunt zegt
 * "650 euro per jaar" niets.
 */
export const REKENBASIS = {
  kilometers: 12000,
  omschrijving: "het gemiddelde jaarlijkse aantal autokilometers, in een middelgrote auto",
} as const;

export const LADEN: Laadmanier[] = [
  {
    id: "thuis",
    naam: "Alleen thuis laden",
    toelichting: "Je betaalt het stroomtarief van je eigen energiecontract.",
    perJaar: 650,
    tarief: "ongeveer 24 cent per kWh",
  },
  {
    id: "mix",
    naam: "Thuis en onderweg",
    toelichting: "Thuis wat kan, aan de paal en de snellader wat moet.",
    perJaar: 900,
  },
  {
    id: "openbaar",
    naam: "Alleen openbaar laden",
    toelichting: "Aan de paal in de straat, en soms aan de snellader.",
    perJaar: 1400,
    tarief: "gemiddeld 49 cent per kWh, snelladen 70 cent",
  },
];

/** Ter vergelijking, uit dezelfde tabel van Milieu Centraal. */
export const BENZINE = { naam: "Benzine", perJaar: 1900 } as const;

/** Wat een laadpaal of wandlader laten plaatsen kost. */
export const AANSCHAF = { van: 1300, tot: 2200 } as const;

/**
 * Zelfverbruik: het deel van je eigen zonnestroom dat je direct in huis
 * gebruikt. Vanaf 2027 is dat de knop waar je aan kunt draaien, want alleen dat
 * deel levert nog het volle tarief op.
 */
export const ZELFVERBRUIK = [
  { naam: "Alleen zonnepanelen", deel: 30, toelichting: "Het meeste gaat overdag het net op." },
  {
    naam: "Met een elektrische auto",
    deel: 50,
    toelichting: "Als je overdag thuis laadt op je eigen opwek.",
  },
  {
    naam: "Met een thuisbatterij",
    deel: 60,
    toelichting: "Opslaan wat je overdag niet gebruikt.",
  },
] as const;

/** Wat er op 1 januari 2027 verandert, en waarom dat hier uitmaakt. */
export const SALDERING = {
  stopt: "1 januari 2027",
  ondergrens: "50 procent van het kale leveringstarief",
  ondergrensTot: 2030,
} as const;

/** De uren die Milieu Centraal noemt als het beste moment om te laden. */
export const LAADVENSTERS = [
  { naam: "09.00 tot 16.00 uur", waarom: "De uren dat je panelen opwekken." },
  { naam: "21.00 tot 07.00 uur", waarom: "Als de piek op het net voorbij is." },
] as const;

/** Een volle accu tegenover een dag huishoudverbruik. */
export const ACCU = { gemiddeld: 60, huishoudenPerDag: 10 } as const;

export const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;

/**
 * De jaarbedragen omgerekend naar 100 km. Milieu Centraal geeft alleen het
 * bedrag per jaar; deze deling maakt de vergelijking pas hanteerbaar en gebeurt
 * hier op één plek, zodat er nergens een los overgetypt getal rondzwerft.
 */
export const perHonderdKm = (perJaar: number) => {
  const bedrag = (perJaar / REKENBASIS.kilometers) * 100;
  return `€ ${bedrag.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Het verschil tussen alleen thuis en alleen openbaar laden, per jaar. */
export const VERSCHIL_PER_JAAR =
  (LADEN.find((l) => l.id === "openbaar")?.perJaar ?? 0) -
  (LADEN.find((l) => l.id === "thuis")?.perJaar ?? 0);
