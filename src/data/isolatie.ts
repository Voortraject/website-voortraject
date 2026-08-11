/**
 * Besparing en kosten per isolatiemaatregel, per woningtype.
 *
 * Bewust géén subsidiebedragen: welke regeling voor jou geldt hangt van je
 * adres af. In Groningen en Noord-Drenthe loopt dat via Nij Begun, elders via
 * de landelijke en gemeentelijke regelingen. Alles hieronder is dus vóór
 * subsidie gerekend; wat je adres oplevert, komt uit de subsidiecheck.
 *
 * Bron: Milieu Centraal, pagina's over dak-, spouwmuur-, vloerisolatie, gevel en glas.
 * https://www.milieucentraal.nl/energie-besparen/isoleren-en-besparen/
 * Gecontroleerd op 11 augustus 2026.
 *
 * De bedragen gaan uit van een gasprijs van € 1,37 per m³, de gemiddelde
 * gasprijs die Milieu Centraal voor 2026 tot 2040 aanhoudt.
 */

export const BRON = {
  naam: "Milieu Centraal",
  url: "https://www.milieucentraal.nl/energie-besparen/isoleren-en-besparen/",
  gecontroleerd: "11 augustus 2026",
} as const;

export const GASPRIJS = 1.37;

export type Woningtype = "tussenwoning" | "hoekwoning" | "twee-onder-een-kap" | "vrijstaand";

export const WONINGTYPES: { id: Woningtype; label: string; kort: string }[] = [
  { id: "tussenwoning", label: "Tussenwoning", kort: "Tussen" },
  { id: "hoekwoning", label: "Hoekwoning", kort: "Hoek" },
  { id: "twee-onder-een-kap", label: "2-onder-1-kap", kort: "2-1-kap" },
  { id: "vrijstaand", label: "Vrijstaand", kort: "Vrijstaand" },
];

export type MaatregelId = "dak" | "spouw" | "gevel" | "vloer" | "glas";

/**
 * Maatregelen die hetzelfde bouwdeel isoleren.
 *
 * Spouwmuurisolatie en gevelisolatie gaan allebei over dezelfde muur, en ze
 * sluiten elkaar niet uit: volgens Milieu Centraal kun je buitengevelisolatie
 * combineren met spouwmuurisolatie, alleen wordt de laag aan de buitenkant dan
 * dunner (12 cm in plaats van 17). Je komt met die combinatie dus op dezelfde
 * geïsoleerde gevel uit als met gevelisolatie alleen, en daarmee op dezelfde
 * besparing. Optellen zou een bedrag beloven dat je niet twee keer krijgt;
 * daarom telt per bouwdeel de grootste besparing, niet de som.
 */
export const BOUWDEEL: Partial<Record<MaatregelId, string>> = {
  spouw: "gevel",
  gevel: "gevel",
};

interface PerType {
  /** Besparing in kubieke meter gas per jaar. */
  m3: number;
  /** Besparing in euro's per jaar. */
  euro: number;
  /** Wat het kost om te laten uitvoeren, vóór subsidie. */
  kosten: number;
}

/**
 * Bij glas hangt de besparing niet aan het woningtype maar aan wat er nu in
 * zit. De keuze tussen hr++ en triple staat er bewust níét bij: Milieu Centraal
 * komt voor allebei op dezelfde besparing uit, dus die knop zou de teller niet
 * bewegen en vroeg om drie alinea's uitleg waarom niet. Dat verhaal staat in de
 * FAQ op dezelfde pagina, waar mensen het ook zoeken.
 */
export interface GlasKeuzes {
  /** Wat er nu in zit; dit bepaalt de besparing. */
  startpunt: { id: string; label: string; m3: number; euro: number }[];
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
  /** Alleen voor glas: de keuzes die de bezoeker binnen de maatregel heeft. */
  keuzes?: GlasKeuzes;
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
    id: "spouw",
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
    id: "gevel",
    naam: "Gevelisolatie",
    kort: "Isolatie tegen de gevel, aan de buitenkant of met een voorzetwand binnen.",
    merkbaar: "Hetzelfde effect als spouwisolatie, maar dan voor een woning die geen spouw heeft.",
    uitgangspunt:
      "Van een ongeïsoleerde gevel naar isolatie aan de buitenkant, over de hele gevel.",
    // Milieu Centraal rekent gevelisolatie alleen door voor een hoekwoning.
    // De andere woningtypen schalen mee met de verhouding uit de
    // spouwmuurcijfers, die de bron wél per type geeft en die over dezelfde
    // geveloppervlakte gaan: tussenwoning 180/400 = 0,45 en vrijstaand
    // 600/400 = 1,5 ten opzichte van de hoekwoning.
    perType: {
      tussenwoning: { m3: 240, euro: 330, kosten: 10400 },
      hoekwoning: { m3: 530, euro: 750, kosten: 23000 },
      "twee-onder-een-kap": { m3: 530, euro: 750, kosten: 23000 },
      vrijstaand: { m3: 800, euro: 1100, kosten: 34500 },
    },
    noot: "Dit is de route als je woning geen spouw heeft of de spouw al gevuld is. Heb je wel een lege spouw, dan kun je allebei doen: de spouw vullen scheelt dan dikte aan de buitenkant, maar je komt op dezelfde geïsoleerde gevel uit en dus niet op een dubbele besparing. Buitenom levert het meeste op maar is ingrijpend en duur; een voorzetwand aan de binnenkant is een stuk goedkoper, levert minder op en kost ruimte. Milieu Centraal rekent deze maatregel alleen voor een hoekwoning door; voor de andere woningtypen hebben wij het cijfer meegeschaald met de verhouding uit de spouwmuurcijfers.",
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
    naam: "Isolerend glas",
    kort: "HR++ of triple in je kozijnen, in plaats van enkel of gewoon dubbel glas.",
    merkbaar: "Geen koudeval meer bij het raam, minder condens en merkbaar minder geluid van buiten.",
    uitgangspunt: "Kies hieronder wat er nu in zit; dat bepaalt wat het oplevert.",
    perType: {
      tussenwoning: { m3: 70, euro: 90, kosten: 4700 },
      hoekwoning: { m3: 70, euro: 90, kosten: 4700 },
      "twee-onder-een-kap": { m3: 70, euro: 90, kosten: 4700 },
      vrijstaand: { m3: 70, euro: 90, kosten: 4700 },
    },
    noot: "De investering geldt voor isolerend glas in je bestaande kozijnen; moeten de kozijnen mee, dan valt hij hoger uit. Milieu Centraal rekent met een hoekwoning met 22 m² glas; daarom staat dit cijfer voor elk woningtype gelijk.",
    keuzes: {
      startpunt: [
        { id: "dubbel", label: "Gewoon dubbel glas", m3: 70, euro: 90 },
        { id: "enkel", label: "Enkel glas", m3: 260, euro: 350 },
      ],
    },
  },
];

export const euro = (bedrag: number) =>
  `€ ${Math.round(bedrag).toLocaleString("nl-NL")}`;
