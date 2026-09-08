import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// De cijferband toont feitelijke claims op een publieke site. Twee dingen
// moeten vaststaan: de getallen komen uit src/config/cijfers.ts (en niet uit
// een los stukje tekst in het component), en bij de Google-beoordeling staat
// nooit het aantal beoordelingen. Dat laatste is een bewuste keuze: 26 maakt
// een 4,9 zwakker. Boven de 50 mag het terugkomen, maar dan bewust, via het
// onderschrift in de config.

const { useGoogleReviewsMock } = vi.hoisted(() => ({ useGoogleReviewsMock: vi.fn() }));

vi.mock("@/hooks/useGoogleReviews", () => ({ useGoogleReviews: useGoogleReviewsMock }));

import { Cijfers } from "@/components/sections/Cijfers";
import { CIJFER_GOOGLE, CIJFER_ISOLATIE, CIJFER_VERDUURZAMING } from "@/config/cijfers";

const STATS_LIVE = { reviews: null, stats: { rating: 4.9, user_rating_count: 26 } };

describe("cijferband", () => {
  it("toont de drie getallen uit de config, met de live Google-beoordeling", () => {
    useGoogleReviewsMock.mockReturnValue(STATS_LIVE);

    const tekst = render(<Cijfers />).container.textContent ?? "";

    expect(tekst).toContain(`${CIJFER_ISOLATIE.getal}${CIJFER_ISOLATIE.achtervoegsel}`);
    expect(tekst).toContain(CIJFER_ISOLATIE.onderschrift);
    expect(tekst).toContain(`${CIJFER_VERDUURZAMING.getal}${CIJFER_VERDUURZAMING.achtervoegsel}`);
    expect(tekst).toContain(CIJFER_VERDUURZAMING.onderschrift);
    expect(tekst).toContain("4,9");
    expect(tekst).toContain(CIJFER_GOOGLE.onderschrift);
  });

  it("noemt het aantal beoordelingen nergens", () => {
    useGoogleReviewsMock.mockReturnValue(STATS_LIVE);

    const tekst = render(<Cijfers />).container.textContent ?? "";

    expect(tekst).not.toMatch(/26/);
    expect(tekst).not.toMatch(/beoordelingen/);
  });

  it("valt terug op het cijfer uit de config als de sync niet bereikbaar is", () => {
    useGoogleReviewsMock.mockReturnValue({ reviews: null, stats: null });

    const tekst = render(<Cijfers />).container.textContent ?? "";

    const terugval = CIJFER_GOOGLE.terugval.toLocaleString("nl-NL", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    expect(tekst).toContain(terugval);
  });
});
