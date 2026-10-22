import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useGoogleReviews", () => ({
  useGoogleReviews: () => ({ reviews: null, stats: { rating: 4.9, user_rating_count: 40 } }),
}));

import { Header } from "@/components/Header";
import { Hero, HERO_KNOP_ID } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";

// De bovenkant van de homepagina in de huisstijl van oktober 2026: de hero
// veert niet in (laadsnelheid), de oker knop staat er één keer, en de
// headerknop wacht tot die hero-knop uit beeld is.

describe("de hero", () => {
  const toon = () =>
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );

  it("veert niet in: het eerste scherm wacht nergens op", () => {
    const { container } = toon();
    expect(container.querySelector(".animate-fade-up, [data-veer], .hs-wacht")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("fetchpriority", "high");
  });

  it("heeft één oker knop, in de wikkel waarop de header wacht", () => {
    const { container } = toon();
    expect(container.querySelectorAll(".hs-knop-oker")).toHaveLength(1);
    const wikkel = container.querySelector(`#${HERO_KNOP_ID}`) as HTMLElement;
    expect(within(wikkel).getByRole("link", { name: /Check jouw subsidies/ })).toHaveClass("hs-knop-oker");
    expect(screen.getByRole("link", { name: "Plan een gratis gesprek" })).toHaveClass("hs-knop-glas");
  });

  it("houdt de kop als twee regels en de Google-score in een glazen pil", () => {
    toon();
    const kop = screen.getByRole("heading", { level: 1 });
    expect(kop.textContent).toBe("Gratis advies oververduurzamen en subsidies");
    expect(kop.querySelectorAll(":scope > span")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /beoordelingen op Google \(4,9 van 5\)/ })).toHaveClass("hs-glas-pil");
  });

  it("verbergt de headerknop zolang de hero-knop in beeld is", () => {
    const { container } = render(
      <MemoryRouter>
        <Header ctaNaElement={HERO_KNOP_ID} />
        <Hero />
      </MemoryRouter>,
    );
    const kopKnop = container.querySelector('header a[aria-label="Check jouw subsidies"]');
    expect(kopKnop).toHaveAttribute("data-verborgen", "true");
  });

  it("is op de homepagina aan de header gekoppeld", () => {
    const bron = readFileSync(resolve(__dirname, "../pages/Index.tsx"), "utf8");
    expect(bron).toContain("<Header ctaNaElement={HERO_KNOP_ID} />");
  });
});

describe("de logotegel", () => {
  it("is één tegel met het accentwoord, zonder witte band", () => {
    render(<LogoCarousel />);
    const sectie = screen.getByRole("region", { name: "Regelingen en instanties waarmee wij werken" });
    expect(sectie).toHaveClass("hs-tegel");
    expect(sectie.getAttribute("style")).toBeNull();
    expect(within(sectie).getByText("regelingen")).toHaveClass("hs-accent");
    // Elk logo één keer zichtbaar voor schermlezers, de kopieën verborgen.
    expect(within(sectie).getAllByRole("img")).toHaveLength(6);
  });
});

describe("de subsidiecheck-tegel", () => {
  it("staat op off-white, in de instaptegel van de tool, met één oker knop", () => {
    const { container } = render(
      <MemoryRouter>
        <SubsidiecheckCta />
      </MemoryRouter>,
    );
    expect(container.querySelector("section")).toHaveClass("bg-background");
    expect(screen.getByText("jouw woning")).toHaveClass("hs-accent");
    expect(container.querySelector(".hs-tegel.hs-blauw-zacht")).not.toBeNull();
    for (const label of ["Postcode", "Huisnummer", "Toevoeging (optioneel)"]) {
      expect(screen.getByLabelText(label)).toHaveClass("instap-invoer");
    }
    expect(container.querySelectorAll(".hs-knop-oker")).toHaveLength(1);
  });
});
