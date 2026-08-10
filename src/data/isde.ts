/**
 * ISDE-bedragen en eisen voor isolatiemaatregelen.
 *
 * Eén bron voor de hele site. Deze bedragen stonden hardgecodeerd in
 * SubsidiesLandelijk.tsx; nu ze ook op de maatregelpagina's staan, mogen ze niet
 * uit elkaar gaan lopen.
 *
 * Bron: RVO, "ISDE: Isolatiemaatregelen woningeigenaren aanvragen"
 * https://www.rvo.nl/subsidies-financiering/isde/woningeigenaren/isolatiemaatregelen
 * en "ISDE: wat is er gewijzigd vanaf 2026?"
 * https://www.rvo.nl/subsidies-financiering/isde/isde-wat-wijzigt-er-2026
 *
 * Controleer dit blok bij elke jaarwissel: RVO publiceert de nieuwe bedragen op
 * de "wat wijzigt er"-pagina en pas daarna in de tabellen.
 */

export const ISDE_BRON = {
  naam: "RVO",
  url: "https://www.rvo.nl/subsidies-financiering/isde/woningeigenaren/isolatiemaatregelen",
  gecontroleerd: "10 augustus 2026",
  geldigVoor: "2026",
} as const;

export interface IsdeMaatregel {
  /** Naam zoals RVO die hanteert. */
  naam: string;
  /** Waar in de woning, gebruikt om de bouwdelen in de doorsnede te koppelen. */
  deel: "dak" | "zolder" | "gevel" | "spouw" | "vloer" | "bodem" | "glas";
  /** De isolatie-eis, als losse tekst omdat glas een U-waarde heeft en de rest een Rd. */
  eis: string;
  /** Minimaal te isoleren oppervlak in m². */
  vanafM2: number;
  /** Maximaal gesubsidieerd oppervlak in m². */
  totM2: number;
  /** Bedrag per m² bij één isolatiemaatregel. */
  perM2: number;
  /** Bedrag per m² bij twee of meer isolatiemaatregelen. */
  perM2Dubbel: number;
  /** Opslag per m² voor biobased materiaal, als die er is. */
  biobased?: number;
  /** Voetnoot bij deze regel. */
  noot?: string;
}

export const ISDE_ISOLATIE: IsdeMaatregel[] = [
  {
    naam: "Dakisolatie",
    deel: "dak",
    eis: "Rd ≥ 3,5",
    vanafM2: 20,
    totM2: 200,
    perM2: 16.25,
    perM2Dubbel: 32.5,
    biobased: 5,
  },
  {
    naam: "Zolder- of vlieringvloer",
    deel: "zolder",
    eis: "Rd ≥ 3,5",
    vanafM2: 20,
    totM2: 200,
    perM2: 4,
    perM2Dubbel: 8,
    biobased: 1.5,
    noot: "Alleen als de zolder onverwarmd is.",
  },
  {
    naam: "Gevelisolatie",
    deel: "gevel",
    eis: "Rd ≥ 3,5",
    vanafM2: 10,
    totM2: 170,
    perM2: 20.25,
    perM2Dubbel: 40.5,
    biobased: 6,
    noot: "Aan de binnen- of de buitenkant.",
  },
  {
    naam: "Spouwmuurisolatie",
    deel: "spouw",
    eis: "Rd ≥ 1,1",
    vanafM2: 10,
    totM2: 170,
    perM2: 5.25,
    perM2Dubbel: 10.5,
    biobased: 1.5,
  },
  {
    naam: "Vloerisolatie",
    deel: "vloer",
    eis: "Rd ≥ 3,5",
    vanafM2: 20,
    totM2: 130,
    perM2: 5.5,
    perM2Dubbel: 11,
    biobased: 2,
    noot: "De ondergrens van 20 m² geldt samen met bodemisolatie.",
  },
  {
    naam: "Bodemisolatie",
    deel: "bodem",
    eis: "Rd of Rbf ≥ 3,5",
    vanafM2: 20,
    totM2: 130,
    perM2: 3,
    perM2Dubbel: 6,
    biobased: 1,
    noot: "De ondergrens van 20 m² geldt samen met vloerisolatie.",
  },
  {
    naam: "HR++ glas",
    deel: "glas",
    eis: "U ≤ 1,2",
    vanafM2: 3,
    totM2: 45,
    perM2: 25,
    perM2Dubbel: 50,
  },
  {
    naam: "Triple glas in nieuwe kozijnen",
    deel: "glas",
    eis: "U ≤ 0,7",
    vanafM2: 3,
    totM2: 45,
    perM2: 111,
    perM2Dubbel: 222,
    noot: "Sinds 2026 gelden er geen minimumeisen meer aan het kozijn zelf.",
  },
];

/** Vast bedrag, nieuw in 2026, alleen in combinatie met isolatie. */
export const ISDE_VENTILATIE_BEDRAG = 400;

/**
 * De verdubbelingsregel, inclusief de uitzondering die bijna niemand kent:
 * ventilatie telt niet mee als tweede maatregel.
 */
export const ISDE_VERDUBBELING = {
  regel:
    "Voer je twee of meer isolatiemaatregelen uit, dan verdubbelt het bedrag per vierkante meter voor allebei.",
  uitzondering:
    "Combineer je isolatie alléén met ventilatie, dan verdubbelt het bedrag niet. Ventilatie telt niet mee als tweede isolatiemaatregel.",
} as const;

/** Bedragen in hele en halve euro's, zoals RVO ze noteert. */
export const euro = (bedrag: number) =>
  `€ ${bedrag.toLocaleString("nl-NL", {
    minimumFractionDigits: bedrag % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
