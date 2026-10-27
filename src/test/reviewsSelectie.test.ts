import { describe, expect, it } from "vitest";

import { aantalWoorden, fallbackKaarten, MAX_KAARTEN, naarKaarten } from "@/lib/reviews";
// De omzetting leeft in de edge function (Deno), maar is puur → hier testbaar.
import {
  contributorVan,
  eigenTekst,
  rijUitLegacy,
  rijUitNieuw,
  rijUitV4,
} from "../../supabase/functions/sync-google-reviews/reviewrij";

const TIEN = "een twee drie vier vijf zes zeven acht negen tien";
const review = (id: string, rating: number, text: string | null, author_name = `Persoon ${id}`) => ({
  id,
  author_name,
  profile_photo_url: null,
  rating,
  text,
});

describe("aantalWoorden", () => {
  it("telt woorden, geen losse leestekens of emoji", () => {
    expect(aantalWoorden("Top! 👍 - zeer   goed geholpen.")).toBe(4);
    expect(aantalWoorden("")).toBe(0);
  });
});

describe("naarKaarten", () => {
  it("laat reviews onder de 4 sterren of onder de 10 woorden vallen", () => {
    const kaarten = naarKaarten([
      review("a", 5, TIEN),
      review("b", 3, TIEN),
      review("c", 5, "negen woorden is net te weinig voor de site"),
      review("d", 4, TIEN),
      review("e", 5, null),
    ]);
    expect(kaarten.map((k) => k.id)).toEqual(["a", "d"]);
  });

  it("houdt de aangeleverde volgorde (nieuwste eerst) en toont er hooguit zes", () => {
    const rijen = Array.from({ length: 9 }, (_, i) => review(String(i), 5, TIEN));
    expect(naarKaarten(rijen).map((k) => k.id)).toEqual(["0", "1", "2", "3", "4", "5"].slice(0, MAX_KAARTEN));
  });

  it("korte reviews kosten geen plek: de zes komen uit wat overblijft", () => {
    const rijen = [
      ...Array.from({ length: 6 }, (_, i) => review(`kort${i}`, 5, "Top!")),
      ...Array.from({ length: 6 }, (_, i) => review(`lang${i}`, 5, TIEN)),
    ];
    expect(naarKaarten(rijen)).toHaveLength(6);
  });

  it("toont dezelfde persoon maar één keer, de nieuwste", () => {
    const kaarten = naarKaarten([review("nieuw", 5, TIEN, "Jan"), review("oud", 5, TIEN, "jan ")]);
    expect(kaarten.map((k) => k.id)).toEqual(["nieuw"]);
  });

  it("de fallback voldoet zelf ook aan de regels", () => {
    for (const k of fallbackKaarten) {
      expect(k.rating).toBeGreaterThanOrEqual(4);
      expect(aantalWoorden(k.tekst)).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("sync-google-reviews: omzetting naar rijen", () => {
  const PLACE = "ChIJtest";
  const URL_PROFIEL = "https://www.google.com/maps/contrib/1234567890/reviews";

  it("leest het contributor-nummer uit de profiel-URL", () => {
    expect(contributorVan(URL_PROFIEL)).toBe("1234567890");
    expect(contributorVan(undefined)).toBeNull();
  });

  it("geeft dezelfde review uit beide API's dezelfde sleutel", () => {
    const oud = rijUitLegacy(PLACE, { author_name: "Jan", author_url: URL_PROFIEL, rating: 5, time: 1760000000 });
    const nieuw = rijUitNieuw(PLACE, {
      name: "places/x/reviews/y",
      rating: 5,
      authorAttribution: { displayName: "Jan", uri: URL_PROFIEL },
      publishTime: "2025-10-09T08:53:20Z",
    });
    expect(oud.google_review_id).toBe(nieuw.google_review_id);
  });

  it("zet de unix-tijd van de oudere API om naar een ISO-tijdstip", () => {
    const rij = rijUitLegacy(PLACE, { author_name: "Jan", rating: 5, time: 1760000000, text: "  hoi  " });
    expect(rij.publish_time).toBe("2025-10-09T08:53:20.000Z");
    expect(rij.text).toBe("hoi");
  });
});

describe("sync-google-reviews: Business Profile API (v4)", () => {
  it("houdt alleen de eigen tekst als het origineel vooraan staat", () => {
    expect(
      eigenTekst("Snelle reactie, goed geholpen!\n\n(Translated by Google)\nQuick response, received great help!"),
    ).toBe("Snelle reactie, goed geholpen!");
  });

  it("houdt alleen de eigen tekst als de vertaling vooraan staat", () => {
    expect(
      eigenTekst("(Translated by Google) Very good help\n\n(Original)\nZeer goed geholpen"),
    ).toBe("Zeer goed geholpen");
  });

  it("laat tekst zonder vertaling heel en maakt van leeg null", () => {
    expect(eigenTekst("  Prima geholpen  ")).toBe("Prima geholpen");
    expect(eigenTekst(undefined)).toBeNull();
    expect(eigenTekst("")).toBeNull();
  });

  it("zet een v4-review om naar een rij met de review-naam als sleutel", () => {
    const rij = rijUitV4({
      name: "accounts/1/locations/2/reviews/abc",
      reviewId: "abc",
      starRating: "FOUR",
      reviewer: { displayName: "Jan", profilePhotoUrl: "https://foto" },
      comment: "Goed\n\n(Translated by Google)\nGood",
      createTime: "2026-10-15T18:32:26.276185Z",
      updateTime: "2026-10-16T09:32:03.470224Z",
    });
    expect(rij).toEqual({
      google_review_id: "accounts/1/locations/2/reviews/abc",
      author_name: "Jan",
      profile_photo_url: "https://foto",
      rating: 4,
      text: "Goed",
      relative_time: null,
      publish_time: "2026-10-15T18:32:26.276185Z",
      language: null,
    });
  });

  it("geeft een review met alleen sterren geen tekst en een onbekende waardering 0", () => {
    const rij = rijUitV4({ name: "r", starRating: "STAR_RATING_UNSPECIFIED" });
    expect(rij.text).toBeNull();
    expect(rij.rating).toBe(0);
    expect(rij.author_name).toBe("Google-gebruiker");
  });
});
