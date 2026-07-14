// Pure decoder van 3D BAG-data (api.3dbag.nl, CityJSON) naar ons Model3d.
// Bewust vrij van Deno-/netwerk-API's zodat het in vitest getest kan worden
// (zie src/test/model3d.test.ts).
//
// Zowel het subject als de buurpanden komen met echte LoD2.2-geometrie (dakvorm)
// uit losse 3D BAG-items. De buren worden als licht wireframe getekend (zoals de
// 3D BAG-viewer). Buur-selectie gebeurt op de snelle PDOK BAG WFS.
//
// CityJSON: vertices zijn integers die via de transform naar echte RD+hoogte
// gaan. Een Solid heeft boundaries = [schil], schil = [vlak…], vlak = [ring…].

import type { Model3d, Model3dSoort, Model3dVlak } from "./types.ts";

type Transform = { scale: number[]; translate: number[] };
type CityGeometry = {
  lod?: string | number;
  boundaries?: number[][][][];
  semantics?: { surfaces?: { type?: string }[]; values?: number[][] };
};
type CityObject = { geometry?: CityGeometry[] };
type Feature = { CityObjects?: Record<string, CityObject>; vertices?: number[][] };
type ItemData = { metadata?: { transform?: Transform }; feature?: Feature };

const SOORT: Record<string, Model3dSoort> = {
  RoofSurface: "dak",
  WallSurface: "muur",
  GroundSurface: "grond",
};

type RuwVlak = { pts: number[][]; soort: Model3dSoort };

// LoD2.2-vlakken van een 3D BAG-item in echte RD+hoogte (niet gecentreerd).
function vlakkenVanItem(item: ItemData): RuwVlak[] {
  const t = item?.metadata?.transform;
  const feature = item?.feature;
  const verts = feature?.vertices;
  const cityObjects = feature?.CityObjects;
  if (!t || !Array.isArray(verts) || !cityObjects) return [];
  const [sx, sy, sz] = t.scale;
  const [tx, ty, tz] = t.translate;
  const V: number[][] = verts.map((v) => [v[0] * sx + tx, v[1] * sy + ty, v[2] * sz + tz]);

  const out: RuwVlak[] = [];
  for (const obj of Object.values(cityObjects)) {
    const g = (obj.geometry ?? []).find((geo) => String(geo.lod) === "2.2");
    const shell = g?.boundaries?.[0];
    if (!Array.isArray(shell)) continue;
    const semVals: number[] = g?.semantics?.values?.[0] ?? [];
    const surfaces = g?.semantics?.surfaces ?? [];
    shell.forEach((face, i) => {
      const ring = face?.[0];
      if (!Array.isArray(ring)) return;
      out.push({ pts: ring.map((idx) => V[idx]), soort: SOORT[surfaces[semVals[i]]?.type ?? ""] ?? "muur" });
    });
  }
  return out;
}

const round = (n: number) => Math.round(n * 100) / 100;

function centreer(vlakken: RuwVlak[], ox: number, oy: number, oz: number): Model3dVlak[] {
  return vlakken.map((f) => ({
    soort: f.soort,
    pts: f.pts.map((p) => [round(p[0] - ox), round(p[1] - oy), round(p[2] - oz)]),
  }));
}

function zwaartepunt(vlakken: RuwVlak[]): { ox: number; oy: number; oz: number } {
  const pts = vlakken.flatMap((f) => f.pts);
  const n = pts.length || 1;
  return {
    ox: pts.reduce((s, p) => s + p[0], 0) / n,
    oy: pts.reduce((s, p) => s + p[1], 0) / n,
    oz: Math.min(...pts.map((p) => p[2])),
  };
}

// Eén 3D BAG-item, gecentreerd op zichzelf (subject zonder buren).
export function decodeer3dBag(data: ItemData | null | undefined): Model3d | null {
  const vlakken = vlakkenVanItem(data ?? {});
  if (vlakken.length === 0) return null;
  const { ox, oy, oz } = zwaartepunt(vlakken);
  return { faces: centreer(vlakken, ox, oy, oz) };
}

// Subject-item + buur-items → één model met echte geometrie, gecentreerd op het
// subject. Buren zonder bruikbare geometrie (null / geen LoD2.2) worden genegeerd.
export function bouwModel(subjectItem: ItemData | null, buurItems: (ItemData | null)[]): Model3d | null {
  const subjV = vlakkenVanItem(subjectItem ?? {});
  if (subjV.length === 0) return null;
  const { ox, oy, oz } = zwaartepunt(subjV);
  const buren = buurItems.flatMap((it) => (it ? centreer(vlakkenVanItem(it), ox, oy, oz) : []));
  return { faces: centreer(subjV, ox, oy, oz), buren };
}

// --- Buren-selectie op de PDOK BAG WFS (GeoJSON footprints) ---

type WfsGeom = { type?: string; coordinates?: unknown };
type WfsFeature = { properties?: { identificatie?: string }; geometry?: WfsGeom };
type WfsData = { features?: WfsFeature[] };

function footprintMidden(geom?: WfsGeom): [number, number] | null {
  if (!geom) return null;
  const coords = geom.coordinates;
  const ring =
    geom.type === "Polygon"
      ? (coords as number[][][])?.[0]
      : geom.type === "MultiPolygon"
        ? (coords as number[][][][])?.[0]?.[0]
        : null;
  if (!Array.isArray(ring) || ring.length === 0) return null;
  let sx = 0;
  let sy = 0;
  for (const p of ring) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / ring.length, sy / ring.length];
}

// Kiest de dichtstbijzijnde buur-pand-ID's (16 cijfers) rond (x,y), exclusief
// het subject, binnen maxAfstand, gesorteerd op nabijheid en gemaximeerd.
export function kiesBuren(
  wfsData: WfsData | null | undefined,
  subjectId: string,
  x: number,
  y: number,
  maxAfstand = 30,
  maxBuren = 6,
): string[] {
  const feats = wfsData?.features;
  if (!Array.isArray(feats)) return [];
  return feats
    .map((f) => {
      const id = f?.properties?.identificatie;
      const c = footprintMidden(f?.geometry);
      return id && c ? { id, afst: Math.hypot(c[0] - x, c[1] - y) } : null;
    })
    .filter((f): f is { id: string; afst: number } => f !== null && f.id !== subjectId && f.afst <= maxAfstand)
    .sort((a, b) => a.afst - b.afst)
    .slice(0, maxBuren)
    .map((f) => f.id);
}
