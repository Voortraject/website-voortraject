import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  beknoptBedrag,
  decodeEntities,
  parseDetail,
  parseResultaten,
  verrijk,
} from "@/lib/subsidies/energiesubsidiewijzer";

// Vitest draait vanaf de projectroot; een pad via process.cwd() is op Windows
// betrouwbaarder dan file-URL-resolutie met import.meta.url.
const fixture = (naam: string) =>
  readFileSync(resolve(process.cwd(), "src/test/fixtures", naam), "utf-8");

const resultaten = parseResultaten(fixture("esw-resultaten-9742hj.html"));

describe("parseResultaten (echte Verbeterjehuis-HTML, 9742HJ)", () => {
  it("vindt alle 18 regelingen", () => {
    expect(resultaten).toHaveLength(18);
  });

  it("mapt de niveau-labels correct (10 rijk, 4 gemeente, 4 overig, geen provincie)", () => {
    const per = (n: string) => resultaten.filter((r) => r.niveau === n).length;
    expect(per("rijk")).toBe(10);
    expect(per("gemeente")).toBe(4);
    expect(per("overig")).toBe(4);
    expect(per("provincie")).toBe(0); // Verbeterjehuis kent geen losse provincie
  });

  it("leidt type af uit het URL-pad (/leningen/ = lening; 7 leningen)", () => {
    expect(resultaten.filter((r) => r.type === "lening")).toHaveLength(7);
    expect(resultaten.filter((r) => r.type === "subsidie")).toHaveLength(11);
  });

  it("bevat de ISDE-subsidie met juiste niveau, type en id", () => {
    const isde = resultaten.find((r) => r.id === "isde-subsidie-rijksoverheid");
    expect(isde).toBeDefined();
    expect(isde!.titel).toBe("ISDE-subsidie Rijksoverheid");
    expect(isde!.niveau).toBe("rijk");
    expect(isde!.type).toBe("subsidie");
    expect(isde!.omschrijving.length).toBeGreaterThan(10);
    expect(isde!.bronUrl).toContain("verbeterjehuis.nl/energiesubsidiewijzer/subsidies/");
  });

  it("markeert de Energiebespaarlening als lening", () => {
    const lening = resultaten.find((r) => r.id === "energiebespaarlening-warmtefonds");
    expect(lening).toBeDefined();
    expect(lening!.type).toBe("lening");
  });

  it("geeft geen dubbele id's terug", () => {
    const ids = resultaten.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("parseDetail (echte detailpagina's)", () => {
  it("haalt de belangrijkste voorwaarde uit de ISDE-pagina (bedrag varieert → geen indicatie)", () => {
    const detail = parseDetail(fixture("esw-detail-subsidie-isde.html"));
    expect(detail.belangrijksteVoorwaarde).toBeDefined();
    expect(detail.belangrijksteVoorwaarde!.length).toBeGreaterThan(10);
    // Het ISDE-bedrag hangt af van de maatregel → geen concreet bedrag.
    expect(detail.bedragIndicatie).toBeUndefined();
  });

  it("vindt een officiële externe bron (rvo.nl) op de ISDE-pagina", () => {
    const detail = parseDetail(fixture("esw-detail-subsidie-isde.html"));
    expect(detail.officieleBronUrl).toBeDefined();
    expect(detail.officieleBronUrl).toContain("rvo.nl");
  });

  // Regressie: regelingen zonder uitvoerder uit de whitelist (rvo/snn/…) kregen
  // de generieke ministerie-footerlink (rijksoverheid.nl/ministeries/…) als bron.
  // De echte bron staat altijd in de content vóór de footer.
  it("pakt belastingdienst.nl als bron voor het lage btw-tarief (niet de ministerie-footerlink)", () => {
    const detail = parseDetail(fixture("esw-detail-overig-laag-btw-tarief.html"));
    expect(detail.officieleBronUrl).toContain("belastingdienst.nl");
  });

  it("pakt nijbegun.nl als bron voor de Isolatieaanpak Groningen en Noord-Drenthe", () => {
    const detail = parseDetail(fixture("esw-detail-subsidie-isolatieaanpak.html"));
    expect(detail.officieleBronUrl).toContain("nijbegun.nl");
  });

  it("geeft nooit een ministerie-pagina terug als officiële bron", () => {
    for (const naam of [
      "esw-detail-subsidie-isde.html",
      "esw-detail-lening-energiebespaarlening.html",
      "esw-detail-overig-laag-btw-tarief.html",
      "esw-detail-subsidie-isolatieaanpak.html",
    ]) {
      const detail = parseDetail(fixture(naam));
      expect(detail.officieleBronUrl ?? "").not.toContain("rijksoverheid.nl/ministeries");
    }
  });

  it("verrijkt een lijst-regeling met detailvelden", () => {
    const basis = resultaten.find((r) => r.id === "isde-subsidie-rijksoverheid")!;
    const detail = parseDetail(fixture("esw-detail-subsidie-isde.html"));
    const verrijkt = verrijk(basis, detail);
    expect(verrijkt.bedragIndicatie).toBe(detail.bedragIndicatie);
    expect(verrijkt.bronUrl).toContain("rvo.nl"); // officiële bron wint van de verbeterjehuis-link
    expect(verrijkt.titel).toBe(basis.titel); // rest blijft intact
  });
});

describe("beknoptBedrag", () => {
  it("pakt het hoogste euro-bedrag", () => {
    expect(beknoptBedrag("Per woning maximaal € 10.000, met zonneboiler € 15.000.")).toBe("tot € 15.000");
    expect(beknoptBedrag("Maximaal € 4.000.")).toBe("tot € 4.000");
  });
  it("valt terug op percentages", () => {
    expect(beknoptBedrag("Van 50% tot 100% van de kosten.")).toBe("50–100% van de kosten");
    expect(beknoptBedrag("Je krijgt tot 30% subsidie.")).toBe("tot 30% van de kosten");
  });
  it("geeft undefined zonder bedrag", () => {
    expect(beknoptBedrag("Het subsidiebedrag hangt af van de maatregel.")).toBeUndefined();
    expect(beknoptBedrag(undefined)).toBeUndefined();
  });
});

describe("decodeEntities", () => {
  it("decodeert hex, decimaal en named entities", () => {
    expect(decodeEntities("isolatie &amp; glas")).toBe("isolatie & glas");
    expect(decodeEntities("&#xE9;&#233;n")).toBe("één");
    expect(decodeEntities("5 &euro;")).toContain("&euro;"); // onbekende named blijft staan
  });
});
