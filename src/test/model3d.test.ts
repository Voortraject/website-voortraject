import { describe, expect, it } from "vitest";

import { projecteerModel } from "@/lib/model3d";
// Decoder leeft in de edge function (Deno), maar is puur → hier testbaar.
import { decodeer3dBag } from "../../supabase/functions/woninginfo/model3d";

// Minimaal 3D BAG-achtig item: grondvlak + één muur + één dak (LoD2.2 Solid,
// mét semantiek). Vertices in mm (transform.scale = 0.001).
const fake3dBag = {
  metadata: { transform: { scale: [0.001, 0.001, 0.001], translate: [0, 0, 0] } },
  feature: {
    vertices: [
      [0, 0, 0], // 0
      [10000, 0, 0], // 1
      [10000, 10000, 0], // 2
      [0, 10000, 0], // 3
      [0, 0, 3000], // 4
      [10000, 0, 3000], // 5
      [5000, 5000, 6000], // 6 (nok)
    ],
    CityObjects: {
      "NL.IMBAG.Pand.X-0": {
        type: "BuildingPart",
        geometry: [
          {
            type: "Solid",
            lod: "2.2",
            boundaries: [[[[0, 1, 2, 3]], [[0, 1, 5, 4]], [[4, 5, 6]]]],
            semantics: {
              surfaces: [{ type: "GroundSurface" }, { type: "WallSurface" }, { type: "RoofSurface" }],
              values: [[0, 1, 2]],
            },
          },
        ],
      },
    },
  },
};

describe("decodeer3dBag", () => {
  const model = decodeer3dBag(fake3dBag);

  it("decodeert de LoD2.2-vlakken met de juiste soort", () => {
    expect(model).not.toBeNull();
    const soorten = model!.faces.map((f) => f.soort).sort();
    expect(soorten).toEqual(["dak", "grond", "muur"]);
  });

  it("centreert op maaiveld (min z = 0)", () => {
    const minZ = Math.min(...model!.faces.flatMap((f) => f.pts.map((p) => p[2])));
    expect(minZ).toBe(0);
  });

  it("geeft null bij ontbrekende geometrie", () => {
    expect(decodeer3dBag(null)).toBeNull();
    expect(decodeer3dBag({ metadata: {}, feature: {} })).toBeNull();
  });
});

describe("projecteerModel", () => {
  const geprojecteerd = projecteerModel(decodeer3dBag(fake3dBag)!);

  it("tekent alleen dak + muur; grond wordt de schaduw", () => {
    expect(geprojecteerd).not.toBeNull();
    expect(geprojecteerd!.vlakken).toHaveLength(2);
    expect(geprojecteerd!.vlakken.every((v) => v.soort !== "grond")).toBe(true);
    expect(geprojecteerd!.schaduw).toHaveLength(1);
  });

  it("levert een geldige viewBox en lichtfactoren", () => {
    expect(geprojecteerd!.breedte).toBeGreaterThan(0);
    expect(geprojecteerd!.hoogte).toBeGreaterThan(0);
    for (const v of geprojecteerd!.vlakken) {
      expect(v.licht).toBeGreaterThanOrEqual(0);
      expect(v.licht).toBeLessThanOrEqual(1);
      expect(v.punten).toMatch(/^[\d.]+,[\d.]+/);
    }
  });
});
