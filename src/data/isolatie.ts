/**
 * Besparing en kosten per isolatiemaatregel, per woningtype.
 *
 * Bewust géén subsidiebedragen: welke regeling voor jou geldt hangt van je
 * adres af. In Groningen en Noord-Drenthe loopt dat via Nij Begun, elders via
 * de landelijke en gemeentelijke regelingen. Alles hieronder is dus vóór
 * subsidie gerekend; wat je adres oplevert, komt uit de subsidiecheck.
 *
 * Bron: Milieu Centraal, pagina's over dak-, spouwmuur-, vloerisolatie en glas.
 * https://www.milieucentraal.nl/energie-besparen/isoleren-en-besparen/
 * Gecontroleerd op 10 augustus 2026.
 *
 * De bedragen gaan uit van een gasprijs van € 1,37 per m³, de gemiddelde
 * gasprijs die Milieu Centraal voor 2026 tot 2040 aanhoudt.
 */

export const BRON = {
  naam: "Milieu Centraal",
  url: "https://www.milieucentraal.nl/energie-besparen/isoleren-en-besparen/",
  gecontroleerd: "10 augustus 2026",
} as const;

export const GASPRIJS = 1.37;

export type Woningtype = "tussenwoning" | "hoekwoning" | "twee-onder-een-kap" | "vrijstaand";

export const WONINGTYPES: { id: Woningtype; label: string; kort: string }[] = [
  { id: "tussenwoning", label: "Tussenwoning", kort: "Tussen" },
  { id: "hoekwoning", label: "Hoekwoning", kort: "Hoek" },
  { id: "twee-onder-een-kap", label: "2-onder-1-kap", kort: "2-1-kap" },
  { id: "vrijstaand", label: "Vrijstaand", kort: "Vrijstaand" },
];

export type MaatregelId = "dak" | "gevel" | "vloer" | "glas";

interface PerType {
  /** Besparing in kubieke meter gas per jaar. */
  m3: number;
  /** Besparing in euro's per jaar. */
  euro: number;
  /** Wat het kost om te laten uitvoeren, vóór subsidie. */
  kosten: number;
}

export interface IsolatieMaatregel {
  id: MaatregelId;
  naam: string;
  /** Eén zin over wat de maatregel doet. */
  kort: string;
  /** Wat de bezoeker er in huis van merkt. */
  merkbaar: string;
  /** Uitgangspunt van de cijfers, zodat de belofte klopt. */
  uitgangspunt: string;
  perType: Record<Woningtype, PerType>;
  noot?: string;
}

export const ISOLATIE_MAATREGELEN: IsolatieMaatregel[] = [
  {
    id: "dak",
    naam: "Dakisolatie",
    kort: "Warmte stijgt, dus via een ongeïsoleerd dak verdwijnt het meeste.",
    merkbaar: "De bovenverdieping wordt sneller warm en blijft dat, en in de zomer koelt de zolder minder op.",
    uitgangspunt: "Van niet geïsoleerd naar goed geïsoleerd, met isolatiewaarde Rd 3,8.",
    perType: {
      tussenwoning: { m3: 320, euro: 460, kosten: 6000 },
      hoekwoning: { m3: 340, euro: 480, kosten: 6500 },
      "twee-onder-een-kap": { m3: 360, euro: 510, kosten: 6500 },
      vrijstaand: { m3: 550, euro: 750, kosten: 10000 },
    },
    noot: "Bedragen gelden voor een schuin dak dat je laat uitvoeren.",
  },
  {
    id: "gevel",
    naam: "Spouwmuurisolatie",
    kort: "De spouw tussen binnen- en buitenmuur volspuiten, meestal in één dag klaar.",
    merkbaar: "Muren voelen minder koud aan en het tochtgevoel langs de gevel verdwijnt.",
    uitgangspunt: "Van een lege spouw naar een geïsoleerde spouw.",
    perType: {
      tussenwoning: { m3: 180, euro: 240, kosten: 800 },
      hoekwoning: { m3: 400, euro: 575, kosten: 1800 },
      "twee-onder-een-kap": { m3: 400, euro: 575, kosten: 1900 },
      vrijstaand: { m3: 600, euro: 800, kosten: 2700 },
    },
    noot: "Alleen mogelijk als je woning een spouw heeft en die nog leeg is. Dat controleren we vooraf.",
  },
  {
    id: "vloer",
    naam: "Vloerisolatie",
    kort: "Isolatie onder de vloer of op de bodem van de kruipruimte.",
    merkbaar: "Geen koude voeten meer en veel minder trek langs de vloer.",
    uitgangspunt: "Van niet geïsoleerd naar goed geïsoleerd.",
    perType: {
      tussenwoning: { m3: 80, euro: 110, kosten: 2150 },
      hoekwoning: { m3: 130, euro: 180, kosten: 2240 },
      "twee-onder-een-kap": { m3: 170, euro: 230, kosten: 2900 },
      vrijstaand: { m3: 250, euro: 340, kosten: 4200 },
    },
  },
  {
    id: "glas",
    naam: "HR++ glas",
    kort: "Isolerend glas in je bestaande kozijnen.",
    merkbaar: "Geen koudeval meer bij het raam, minder condens en merkbaar minder geluid van buiten.",
    uitgangspunt: "Van gewoon dubbel glas naar HR++. Vervang je enkel glas, dan is de besparing een stuk groter.",
    perType: {
      tussenwoning: { m3: 70, euro: 90, kosten: 4700 },
      hoekwoning: { m3: 70, euro: 90, kosten: 4700 },
      "twee-onder-een-kap": { m3: 70, euro: 90, kosten: 4700 },
      vrijstaand: { m3: 70, euro: 90, kosten: 4700 },
    },
    noot: "Milieu Centraal rekent hier met een hoekwoning met 22 m² glas; daarom staat dit cijfer voor elk woningtype gelijk. Vanaf enkel glas is het ongeveer 260 m³ gas, zo'n € 350 per jaar.",
  },
];

/** Vanaf enkel glas, hoekwoning met 22 m² glas. */
export const GLAS_VANAF_ENKEL = { m3: 260, euro: 350 };

export const euro = (bedrag: number) =>
  `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;
