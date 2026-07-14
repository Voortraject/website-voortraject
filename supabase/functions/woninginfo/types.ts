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

export type WoningInfo = {
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
