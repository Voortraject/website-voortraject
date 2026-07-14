import { describe, expect, it } from "vitest";

import { bouwLuchtfotoFrame, projecteerOpFrame } from "@/lib/luchtfoto";
import { parseRdPoint } from "@/lib/pdok";

describe("parseRdPoint", () => {
  it("parset POINT(x y) naar {x, y}", () => {
    expect(parseRdPoint("POINT(233563.02 582043.5)")).toEqual({ x: 233563.02, y: 582043.5 });
  });

  it("verwerkt extra spaties binnen de haakjes", () => {
    expect(parseRdPoint("POINT( 135782.745 452910.011 )")).toEqual({ x: 135782.745, y: 452910.011 });
  });

  it("geeft undefined bij ontbrekende of onparsebare invoer", () => {
    expect(parseRdPoint(undefined)).toBeUndefined();
    expect(parseRdPoint("")).toBeUndefined();
    expect(parseRdPoint("geen punt")).toBeUndefined();
  });
});

describe("bouwLuchtfotoFrame", () => {
  const frame = bouwLuchtfotoFrame({ x: 233500, y: 582500 }, { spanMeters: 100, width: 640, height: 480 });
  const params = new URL(frame.url).searchParams;

  it("wijst naar de PDOK luchtfoto-WMS met de HR-laag en jpeg", () => {
    expect(frame.url).toContain("service.pdok.nl/hwh/luchtfotorgb/wms/v1_0");
    expect(params.get("REQUEST")).toBe("GetMap");
    expect(params.get("VERSION")).toBe("1.3.0");
    expect(params.get("LAYERS")).toBe("Actueel_orthoHR");
    expect(params.get("CRS")).toBe("EPSG:28992");
    expect(params.get("FORMAT")).toBe("image/jpeg");
  });

  it("maakt een bbox met dezelfde beeldverhouding als de afbeelding (vierkante pixels)", () => {
    // spanX = 100, spanY = 100 * 480/640 = 75
    expect(frame.minx).toBe(233450);
    expect(frame.maxx).toBe(233550);
    expect(frame.miny).toBe(582462.5);
    expect(frame.maxy).toBe(582537.5);
    expect(params.get("BBOX")).toBe("233450.000,582462.500,233550.000,582537.500");
    expect(params.get("WIDTH")).toBe("640");
    expect(params.get("HEIGHT")).toBe("480");
  });
});

describe("projecteerOpFrame", () => {
  const frame = bouwLuchtfotoFrame({ x: 233500, y: 582500 }, { spanMeters: 100, width: 640, height: 480 });

  it("zet het middelpunt op het midden van het beeld", () => {
    expect(projecteerOpFrame([233500, 582500], frame)).toEqual([320, 240]);
  });

  it("spiegelt de Y-as: linksbovenhoek → (0,0), rechtsonderhoek → (width,height)", () => {
    expect(projecteerOpFrame([233450, 582537.5], frame)).toEqual([0, 0]);
    expect(projecteerOpFrame([233550, 582462.5], frame)).toEqual([640, 480]);
  });
});
