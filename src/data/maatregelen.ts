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
}

export const MAATREGELEN: Record<MaatregelSlug, MaatregelInfo> = {
  isolatie: { slug: "isolatie", label: "Isolatie & ventilatie", href: "/verduurzamen/isolatie" },
  warmtepomp: { slug: "warmtepomp", label: "Warmtepomp", href: "/verduurzamen/warmtepomp" },
  airco: { slug: "airco", label: "Airco", href: "/verduurzamen/airco" },
  thuisbatterij: {
    slug: "thuisbatterij",
    label: "Thuisbatterij & opslag",
    href: "/verduurzamen/thuisbatterij",
  },
  zonnepanelen: { slug: "zonnepanelen", label: "Zonnepanelen", href: "/verduurzamen/zonnepanelen" },
  laadpaal: { slug: "laadpaal", label: "Laadpaal", href: "/verduurzamen/laadpaal" },
  onderhoud: { slug: "onderhoud", label: "Onderhoud", href: "/verduurzamen/onderhoud" },
};

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
