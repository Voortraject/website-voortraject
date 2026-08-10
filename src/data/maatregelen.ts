/**
 * Eén bron van waarheid voor de maatregelen onder /verduurzamen.
 *
 * Gebruikt voor het kruimelpad, de BreadcrumbList in JSON-LD en de
 * "combineert goed met"-kruislinks. De labels komen overeen met de navigatie
 * in Header.tsx; wijzig ze hier en daar samen.
 */

export type MaatregelSlug =
  | "isolatie"
  | "warmtepomp"
  | "airco"
  | "thuisbatterij"
  | "zonnepanelen"
  | "laadpaal"
  | "onderhoud";

/** De drie stappen van de verduurzamingsroute. */
export type RouteStap = "beperk" | "opwekken" | "slim";

export interface MaatregelInfo {
  slug: MaatregelSlug;
  /** Korte naam, zoals in de navigatie en het kruimelpad. */
  label: string;
  href: string;
  /**
   * De vraag waarmee bezoekers op deze pagina binnenkomen, en die de pagina
   * ook echt beantwoordt. Staat op de hub onder elke kaart: een kernvraag zegt
   * meer over de inhoud dan een samenvatting die toch niemand leest.
   */
  kernvraag: string;
  /** Waar de maatregel in de route valt. Onderhoud staat er bewust buiten. */
  stap?: RouteStap;
}

export const MAATREGELEN: Record<MaatregelSlug, MaatregelInfo> = {
  isolatie: {
    slug: "isolatie",
    label: "Isolatie & ventilatie",
    href: "/verduurzamen/isolatie",
    kernvraag: "Waar lekt de warmte weg, en wat levert dichten op?",
    stap: "beperk",
  },
  warmtepomp: {
    slug: "warmtepomp",
    label: "Warmtepomp",
    href: "/verduurzamen/warmtepomp",
    kernvraag: "Hybride of volledig elektrisch, en is mijn woning er klaar voor?",
    stap: "slim",
  },
  airco: {
    slug: "airco",
    label: "Airco",
    href: "/verduurzamen/airco",
    kernvraag: "Wat kost koelen echt, en waar begint een warmtepomp?",
    stap: "slim",
  },
  thuisbatterij: {
    slug: "thuisbatterij",
    label: "Thuisbatterij & opslag",
    href: "/verduurzamen/thuisbatterij",
    kernvraag: "Loont opslag bij mij, of nog niet?",
    stap: "slim",
  },
  zonnepanelen: {
    slug: "zonnepanelen",
    label: "Zonnepanelen",
    href: "/verduurzamen/zonnepanelen",
    kernvraag: "Wat blijft er over als salderen stopt?",
    stap: "opwekken",
  },
  laadpaal: {
    slug: "laadpaal",
    label: "Laadpaal",
    href: "/verduurzamen/laadpaal",
    kernvraag: "Hoe snel kan ik thuis laden, en wat scheelt dat?",
    stap: "slim",
  },
  onderhoud: {
    slug: "onderhoud",
    label: "Onderhoud",
    href: "/verduurzamen/onderhoud",
    kernvraag: "Wat moet er wanneer gebeuren, en wie doet het?",
  },
};

/** De zes maatregelen in de volgorde van de route; onderhoud staat apart. */
export const MAATREGEL_VOLGORDE: MaatregelSlug[] = [
  "isolatie",
  "zonnepanelen",
  "warmtepomp",
  "thuisbatterij",
  "laadpaal",
  "airco",
];

/**
 * De verduurzamingsroute: eerst beperken wat je verbruikt, dan opwekken, dan
 * slim gebruiken. Deze volgorde is het inhoudelijke skelet van de hele sectie.
 */
export const ROUTE: { stap: RouteStap; titel: string; korte: string }[] = [
  {
    stap: "beperk",
    titel: "Beperk je verbruik",
    korte: "Isoleren en ventileren. De basis waarop alle volgende stappen renderen.",
  },
  {
    stap: "opwekken",
    titel: "Wek zelf op",
    korte: "Zonnepanelen, zodra je woning niet meer onnodig veel verbruikt.",
  },
  {
    stap: "slim",
    titel: "Gebruik het slim",
    korte: "Warmtepomp, opslag en laden, afgestemd op je eigen opwek.",
  },
];
