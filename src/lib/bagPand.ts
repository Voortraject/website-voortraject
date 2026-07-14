// Haalt de BAG-pandcontour (footprint-polygoon) op rond een RD-coördinaat, om
// als omtrek over de luchtfoto te tekenen. Gratis, geen key: de PDOK BAG WFS
// stuurt CORS-headers (Access-Control-Allow-Origin: *), dus dit kan client-side.
//
// We filteren met een INTERSECTS op het adresmiddelpunt (centroide_rd), zodat we
// exact het pand krijgen waar het adres in ligt. Retourneert de buitenringen
// (één per polygoon; een pand kan uit meerdere delen bestaan), of null bij geen
// match of een fout — de aanroeper toont dan simpelweg geen omtrek.

const BAG_WFS = "https://service.pdok.nl/lv/bag/wfs/v2_0";

/** Buitenringen van het pand als arrays van [x, y] in RD (EPSG:28992). */
export type PandContour = number[][][];

/** Contour + BAG-pand-identificatie (voor het 3D-model) + bouwjaar. */
export type PandInfo = { rings: PandContour; pandId: string; bouwjaar?: number };

export async function haalPandContour(centrum?: { x: number; y: number }): Promise<PandInfo | null> {
  if (!centrum) return null;

  const filter =
    `<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">` +
    `<fes:Intersects><fes:ValueReference>geom</fes:ValueReference>` +
    `<gml:Point srsName="EPSG:28992"><gml:pos>${centrum.x} ${centrum.y}</gml:pos></gml:Point>` +
    `</fes:Intersects></fes:Filter>`;

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: "bag:pand",
    outputFormat: "application/json",
    srsName: "EPSG:28992",
    count: "1",
    filter,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BAG_WFS}?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    const geom = feature?.geometry;
    const pandId: string | undefined = feature?.properties?.identificatie;
    if (!geom || !pandId) return null;
    const bouwjaar = typeof feature?.properties?.bouwjaar === "number" ? feature.properties.bouwjaar : undefined;
    let rings: PandContour | null = null;
    if (geom.type === "Polygon") rings = [geom.coordinates[0]];
    else if (geom.type === "MultiPolygon") rings = geom.coordinates.map((poly: number[][][]) => poly[0]);
    if (!rings) return null;
    return { rings, pandId, bouwjaar };
  } catch (err) {
    console.error("BAG pandcontour ophalen mislukt", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
