// Datamodel van het woningpaneel (subsidiecheck). Bron-onafhankelijk: de UI
// bouwt tegen deze types, de edge function `woninginfo` vertaalt de EP-Online-
// response hiernaartoe. In fase 2 groeit dit met oppervlaktes (dak/vloer/gevel).

export type EnergielabelData = {
  /** De energieklasse-letter, bijv. "A", "A+" … "A+++++", of "G". */
  klasse: string;
  /** ISO-datum waarop het label in EP-Online is geregistreerd. */
  registratiedatum?: string;
  /** ISO-datum tot wanneer het label geldig is (registratie + 10 jaar). */
  geldigTot?: string;
  /** true = vereenvoudigd energielabel (VEL) i.p.v. een regulier/uitgebreid label. */
  isVereenvoudigd?: boolean;
};

// Wat EP-Online over het gebóuw zegt, los van het label zelf. Bewust de ruwe
// bronwaarden: EP-Online publiceert voor deze velden geen enum, dus vertalen
// naar een eigen lijst zou een aanname zijn die stil fout kan gaan.
export type GebouwData = {
  /** EP-Online `Gebouwtype`: het woningtype. Ruwe bronwaarde. */
  type?: string;
  /** EP-Online `Gebouwklasse`: woning of utiliteitsgebouw. Ruwe bronwaarde. */
  klasse?: string;
  /** EP-Online `Gebouwsubtype`: de ligging van het appartement in het woongebouw. */
  subtype?: string;
};

export type WoningInfo = {
  /** Geregistreerd energielabel, of null als er geen bekend is. */
  energielabel: EnergielabelData | null;
  /**
   * Gebouwgegevens uit EP-Online, of null zonder registratie. Alleen adressen
   * mét een geregistreerd label hebben dit; voor de rest blijft het null en
   * moet het woningtype ergens anders vandaan komen.
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
