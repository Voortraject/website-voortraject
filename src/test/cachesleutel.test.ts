import { describe, expect, it } from "vitest";

// De sleutellogica leeft in de edge function (Deno), maar is puur → hier testbaar.
// Zelfde patroon als src/test/model3d.test.ts.
import {
  bouwCacheSleutel,
  leesRdCoord,
  opRooster,
  RD_GRENZEN,
  ROOSTER_M,
} from "../../supabase/functions/woninginfo/cachesleutel";

const query = (params: Record<string, string>) => new URLSearchParams(params);

// Grote Markt, Groningen (ongeveer), in Rijksdriehoekcoördinaten.
const GRONINGEN = { x: 233_500, y: 582_400 };

describe("cachesleutel van het 3D-model", () => {
  it("houdt een echt adres op één sleutel", () => {
    const coord = leesRdCoord(query({ x: String(GRONINGEN.x), y: String(GRONINGEN.y) }));
    expect(coord).not.toBeNull();
    expect(bouwCacheSleutel("0014100000000001", coord)).toBe("0014100000000001@233500,582400");
  });

  // De kern van deze wijziging: de sleutel was `pandid@Math.round(x),Math.round(y)`
  // met x rechtstreeks uit de query. Eén geldige pand-id plus een x die per
  // verzoek één meter opschuift leverde onbeperkt véle rijen op voor hetzelfde
  // gebouw, elk met een volledig 3D-model erin.
  it("laat een meter-voor-meter opschuivende coördinaat op dezelfde sleutel vallen", () => {
    const sleutels = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const coord = leesRdCoord(query({ x: String(GRONINGEN.x + i), y: String(GRONINGEN.y) }));
      sleutels.add(bouwCacheSleutel("0014100000000001", coord));
    }
    // 200 verschillende verzoeken over 200 meter: hooguit 200/10 + 1 sleutels,
    // in plaats van 200. Zonder rooster zou dit 200 rijen in de CRM-database zijn.
    expect(sleutels.size).toBeLessThanOrEqual(200 / ROOSTER_M + 1);
  });

  it("negeert coördinaten buiten Nederland", () => {
    // Buiten het Rijksdriehoekstelsel: geen plek, dus een sleutel zonder plek.
    // Zo kan een aanvaller ook niet via absurde getallen sleutels blijven maken.
    for (const buiten of [
      { x: "-1", y: String(GRONINGEN.y) },
      { x: String(RD_GRENZEN.xMax + 1), y: String(GRONINGEN.y) },
      { x: String(GRONINGEN.x), y: String(RD_GRENZEN.yMin - 1) },
      { x: String(GRONINGEN.x), y: String(RD_GRENZEN.yMax + 1) },
      { x: "1e300", y: "1e300" },
    ]) {
      expect(leesRdCoord(query(buiten)), JSON.stringify(buiten)).toBeNull();
    }
    expect(bouwCacheSleutel("0014100000000001", null)).toBe("0014100000000001");
  });

  it("negeert wat geen getal is", () => {
    expect(leesRdCoord(query({}))).toBeNull();
    expect(leesRdCoord(query({ x: "abc", y: "582400" }))).toBeNull();
    expect(leesRdCoord(query({ x: "NaN", y: "582400" }))).toBeNull();
    expect(leesRdCoord(query({ x: "Infinity", y: "582400" }))).toBeNull();
  });

  it("rondt symmetrisch af op het rooster", () => {
    expect(opRooster(0)).toBe(0);
    expect(opRooster(4)).toBe(0);
    expect(opRooster(5)).toBe(10);
    expect(opRooster(233_497)).toBe(233_500);
  });
});
