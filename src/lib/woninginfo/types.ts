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

export type WoningInfo = {
  /** Geregistreerd energielabel, of null als er geen bekend is. */
  energielabel: EnergielabelData | null;
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
