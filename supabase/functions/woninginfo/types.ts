// Responsecontract van de edge function `woninginfo`. Spiegelt
// src/lib/woninginfo/types.ts (de frontend leest deze JSON 1-op-1 over).
// Groeit in fase 2 met oppervlaktes (dak/vloer/gevel uit 3D BAG).

export type EnergielabelData = {
  /** Energieklasse-letter, bijv. "A", "A+" … "A+++++", of "G". */
  klasse: string;
  /** ISO-datum waarop het label in EP-Online is geregistreerd. */
  registratiedatum?: string;
  /** ISO-datum tot wanneer het label geldig is. */
  geldigTot?: string;
  /** true = vereenvoudigd energielabel (VEL). */
  isVereenvoudigd?: boolean;
};

// Wat EP-Online over het gebóuw zegt, los van het label zelf. Bewust de ruwe
// bronwaarden: EP-Online publiceert geen enum voor deze velden, dus elke
// vertaling naar een eigen lijst zou een aanname zijn die stil fout kan gaan.
// Interpreteren doen we pas bij het tonen, met de echte waarden in de hand.
export type GebouwData = {
  /** EP-Online `Gebouwtype`: het woningtype. Ruwe bronwaarde. */
  type?: string;
  /** EP-Online `Gebouwklasse`: woning of utiliteitsgebouw. Ruwe bronwaarde. */
  klasse?: string;
  /** EP-Online `Gebouwsubtype`: de ligging van het appartement in het woongebouw. */
  subtype?: string;
};

export type WoningInfo = {
  energielabel: EnergielabelData | null;
  /**
   * Gebouwgegevens uit EP-Online, of null als het adres geen registratie heeft.
   * Staat naast het label en niet erin: het gaat over het gebouw, niet over de
   * meting, en de bron kan later een andere zijn (BAG-geometrie).
   */
  gebouw: GebouwData | null;
};

// 3D-massamodel (3D BAG LoD2.2): platte vlakken met een soort, gecentreerd op
// het pand (lokale meters, x=oost, y=noord, z=hoogte vanaf maaiveld).
export type Model3dSoort = "dak" | "muur" | "grond";
export type Model3dVlak = { pts: number[][]; soort: Model3dSoort };
export type Model3d = {
  /** Vlakken van het subject-pand. */
  faces: Model3dVlak[];
  /** Vlakken van de omliggende buurpanden (grijs, voor context). */
  buren?: Model3dVlak[];
};
