// Axonometrische projectie van het 3D-massamodel (3D BAG LoD2.2) naar 2D-vlakken
// voor een lichte SVG-render — geen 3D-bibliotheek nodig. Subject-pand + buren
// worden geprojecteerd met backface culling (verborgen achterwanden weg → geen
// "rare" painter's-artefacten) en per groep van achter naar voren gesorteerd.
// Noord (y+) blijft boven, zodat het model dezelfde uitlijning heeft als de foto.

import type { Model3d, Model3dSoort } from "@/lib/woninginfo";

export type GeprojecteerdVlak = {
  soort: Model3dSoort;
  /** SVG points-string binnen de viewBox. */
  punten: string;
  /** Lichtfactor 0..1 (Lambert) voor de helderheid van het vlak. */
  licht: number;
};

export type GeprojecteerdModel = {
  /** Subject-pand, van achter naar voren gesorteerd. */
  vlakken: GeprojecteerdVlak[];
  /** Buurpanden (grijs), van achter naar voren. */
  buren: GeprojecteerdVlak[];
  /** Grondvlak(ken) van het subject — voor een zachte grondschaduw. */
  schaduw: string[];
  breedte: number;
  hoogte: number;
};

type ProjOpties = { theta?: number; phi?: number; padding?: number; schaal?: number };

export function projecteerModel(
  model: Model3d,
  // Beste hoek om een huis te tonen: een klassieke architectonische 3/4-view.
  // theta = azimut (twee gevels zichtbaar), phi = hoogtehoek (44° → dakvorm goed
  // zichtbaar, niet te plat op het dak en niet te veel van opzij).
  { theta = 35, phi = 44, padding = 10, schaal = 14 }: ProjOpties = {},
): GeprojecteerdModel | null {
  const subjectWanden = model.faces.filter((f) => f.soort !== "grond");
  const grond = model.faces.filter((f) => f.soort === "grond");
  const buurWanden = (model.buren ?? []).filter((f) => f.soort !== "grond");
  if (subjectWanden.length === 0) return null;

  const t = (theta * Math.PI) / 180;
  const p = (phi * Math.PI) / 180;
  const cosT = Math.cos(t);
  const sinT = Math.sin(t);
  const cosP = Math.cos(p);
  const sinP = Math.sin(p);

  // 3D [x=oost, y=noord, z=hoogte] → [schermX, schermY, diepte].
  const proj = ([x, y, z]: number[]): [number, number, number] => {
    const x1 = x * cosT - y * sinT;
    const y1 = x * sinT + y * cosT;
    return [x1 * schaal, -(y1 * sinP + z * cosP) * schaal, y1 * cosP - z * sinP];
  };
  const kijk = [sinT * cosP, cosT * cosP, -sinP]; // kijkrichting de scène in; |kijk| = 1
  const lichtrichting = normaliseer([-0.35, -0.5, 0.79]);

  // Projecteer + (optioneel) backface-cull + sorteer één set vlakken (achter →
  // voren). Voor het subject cullen we verborgen achterwanden weg; de buur-
  // blokjes tekenen we compleet (painter's volstaat voor simpele blokken).
  const verwerk = (faces: Model3d["faces"], cull: boolean) =>
    faces
      .map((f) => ({ f, n: vlaknormaal(f.pts) }))
      .filter(({ n }) => !cull || n[0] * kijk[0] + n[1] * kijk[1] + n[2] * kijk[2] < 0.05)
      .map(({ f, n }) => {
        const g = f.pts.map(proj);
        const diepte = g.reduce((s, q) => s + q[2], 0) / g.length;
        const licht = 0.42 + 0.58 * Math.max(0, dot(n, lichtrichting));
        return { soort: f.soort, g, diepte, licht };
      })
      .sort((a, b) => b.diepte - a.diepte);

  const subjectV = verwerk(subjectWanden, true);
  // Buren óók cullen (echte 3D BAG-geometrie → normalen naar buiten): alleen de
  // naar de camera gerichte vlakken, zodat het wireframe rustig blijft.
  const buurV = verwerk(buurWanden, true);
  const schaduwG = grond.map((f) => f.pts.map(proj));

  // Kader op het subject (met marge voor de buren eromheen); verder weg gelegen
  // buurpanden clippen netjes aan de rand, zodat het subject prominent blijft.
  const subjPunten = subjectV.flatMap((v) => v.g);
  const sMinX = Math.min(...subjPunten.map((q) => q[0]));
  const sMaxX = Math.max(...subjPunten.map((q) => q[0]));
  const sMinY = Math.min(...subjPunten.map((q) => q[1]));
  const sMaxY = Math.max(...subjPunten.map((q) => q[1]));
  const marge = Math.max(sMaxX - sMinX, sMaxY - sMinY) * 0.9 + padding;
  const minX = sMinX - marge;
  const minY = sMinY - marge;
  const breedte = sMaxX - sMinX + marge * 2;
  const hoogte = sMaxY - sMinY + marge * 2;

  const naarPunten = (g: number[][]) =>
    g.map((q) => `${(q[0] - minX + padding).toFixed(1)},${(q[1] - minY + padding).toFixed(1)}`).join(" ");
  const naarVlak = (v: { soort: Model3dSoort; g: number[][]; licht: number }) => ({
    soort: v.soort,
    licht: v.licht,
    punten: naarPunten(v.g),
  });

  return {
    breedte,
    hoogte,
    schaduw: schaduwG.map(naarPunten),
    buren: buurV.map(naarVlak),
    vlakken: subjectV.map(naarVlak),
  };
}

// Newell's method: robuuste vlaknormaal, ook bij licht niet-vlakke veelhoeken.
function vlaknormaal(pts: number[][]): number[] {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return normaliseer([nx, ny, nz]);
}

function normaliseer([x, y, z]: number[]): number[] {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
