// Bouwt een luchtfoto-uitsnede van een woning uit de publieke PDOK-service
// "Landelijke Voorziening Beeldmateriaal" (luchtfoto RGB). Gratis, geen API-key,
// CC-BY 4.0 (bronvermelding verplicht — zie LUCHTFOTO_ATTRIBUTIE).
//
// Werkt puur client-side: de GetMap-URL is direct bruikbaar als `<img src>`
// (een gewone img-tag doet geen CORS-preflight). Input is het RD-middelpunt
// (EPSG:28992) uit de PDOK Locatieserver (zie src/lib/pdok.ts, `centroideRd`).
//
// Naast de URL levert een "frame" ook de bounding box + beeldgrootte, zodat we
// de BAG-pandcontour (RD) exact op de foto kunnen projecteren (zie
// projecteerOpFrame + src/lib/bagPand.ts).

const WMS = "https://service.pdok.nl/hwh/luchtfotorgb/wms/v1_0";
// Hoogste resolutie (8 cm, "Actueel_*" = altijd de nieuwste jaargang).
const LAYER = "Actueel_orthoHR";

// Kort gehouden: op mobiel staat de foto op halve breedte en dekte de lange
// variant het halve dak. PDOK is de bronhouder, dus de CC-BY-vermelding blijft
// kloppen.
export const LUCHTFOTO_ATTRIBUTIE = "Luchtfoto: PDOK";

export type LuchtfotoFrame = {
  url: string;
  /** Bounding box in RD (EPSG:28992). */
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
  /** Beeldgrootte in pixels. */
  width: number;
  height: number;
};

type FrameOpties = {
  /** Breedte van de uitsnede op de grond in meters (pand + directe omgeving). */
  spanMeters?: number;
  width?: number;
  height?: number;
};

/**
 * Bouwt een luchtfoto-frame rond een RD-coördinaat: een WMS GetMap-URL plus de
 * gebruikte bounding box + beeldgrootte. De grond-hoogte schaalt mee met de
 * beeldverhouding (vierkante pixels → geen vervorming, en de contour past exact).
 * WMS 1.3.0 met CRS=EPSG:28992 heeft BBOX-volgorde minx,miny,maxx,maxy (geen
 * as-swap voor RD). Enige uitvoerformaat: image/jpeg.
 */
export function bouwLuchtfotoFrame(
  centrum: { x: number; y: number },
  { spanMeters = 110, width = 720, height = 540 }: FrameOpties = {},
): LuchtfotoFrame {
  const spanX = spanMeters;
  const spanY = spanMeters * (height / width);
  const minx = centrum.x - spanX / 2;
  const maxx = centrum.x + spanX / 2;
  const miny = centrum.y - spanY / 2;
  const maxy = centrum.y + spanY / 2;

  // Op 3 decimalen (mm) is ruim voldoende en houdt de URL kort.
  const bbox = [minx, miny, maxx, maxy].map((n) => n.toFixed(3)).join(",");
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.3.0",
    REQUEST: "GetMap",
    LAYERS: LAYER,
    STYLES: "",
    CRS: "EPSG:28992",
    BBOX: bbox,
    WIDTH: String(width),
    HEIGHT: String(height),
    FORMAT: "image/jpeg",
  });

  return { url: `${WMS}?${params.toString()}`, minx, miny, maxx, maxy, width, height };
}

/**
 * Projecteert een RD-punt [x, y] naar pixelcoördinaten binnen het frame
 * (SVG-viewBox 0..width, 0..height). Y wordt gespiegeld: RD loopt naar boven,
 * schermpixels naar beneden.
 */
export function projecteerOpFrame([vx, vy]: number[], frame: LuchtfotoFrame): [number, number] {
  const px = ((vx - frame.minx) / (frame.maxx - frame.minx)) * frame.width;
  const py = ((frame.maxy - vy) / (frame.maxy - frame.miny)) * frame.height;
  return [px, py];
}

type OmvatOpties = {
  /** Extra ruimte rond het pand (1.5 = 50% marge). */
  padding?: number;
  /** Ondergrens voor de uitsnede in meters (kleine woning houdt context). */
  minSpan?: number;
  /** Bovengrens (heel groot complex zoomt niet eindeloos uit). */
  maxSpan?: number;
};

/**
 * Bepaalt een middelpunt + spanMeters die het hele pand (alle ringen) omvatten,
 * passend bij de 4:3-beeldverhouding van het frame. Zo valt de contour altijd
 * binnen beeld, ook als het adrespunt niet in het midden van het pand ligt
 * (bijv. bij een langwerpig flatgebouw).
 */
export function frameOmvat(
  rings: number[][][],
  { padding = 1.3, minSpan = 38, maxSpan = 250 }: OmvatOpties = {},
): { centrum: { x: number; y: number }; spanMeters: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const centrum = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  const pandW = maxX - minX;
  const pandH = maxY - minY;
  // Frame is 4:3 (spanY = spanX * 3/4), dus voor de hoogte spanX >= pandH * 4/3.
  const spanX = Math.min(Math.max(Math.max(pandW, pandH * (4 / 3)) * padding, minSpan), maxSpan);
  return { centrum, spanMeters: spanX };
}
