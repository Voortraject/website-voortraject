import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { CtaButton } from "@/components/CtaButton";
import { Header } from "@/components/Header";
import { STER_PAD, Sterren } from "@/components/Sterren";
import { useStaffel } from "@/lib/beweging";

// De gedeelde basis van de huisstijl van oktober 2026 (src/styles/huisstijl.css).
// Deze test bewaakt de keuzes die sitebreed doorwerken: één knopvorm zonder
// zwevende glans, een headerknop die op de homepagina wacht tot de hero-knop
// uit beeld is, en beweging die bij "minder beweging" helemaal stilstaat.

describe("CtaButton", () => {
  it("is standaard de oker hoofdknop, zonder glans", () => {
    const { container } = render(<CtaButton href="/contact">Plan een gratis gesprek</CtaButton>);
    const knop = screen.getByRole("link", { name: "Plan een gratis gesprek" });
    expect(knop).toHaveClass("hs-knop", "hs-knop-oker");
    expect(container.querySelector(".btn-sheen")).toBeNull();
  });

  it("kent de secundaire vormen en laat extra klassen staan", () => {
    render(
      <>
        <CtaButton href="/a" variant="licht">Licht</CtaButton>
        <CtaButton href="/b" variant="glas" className="w-full">Glas</CtaButton>
        <CtaButton href="/c" variant="primary">Inkt</CtaButton>
      </>,
    );
    expect(screen.getByRole("link", { name: "Licht" })).toHaveClass("hs-knop-licht");
    expect(screen.getByRole("link", { name: "Glas" })).toHaveClass("hs-knop-glas", "w-full");
    expect(screen.getByRole("link", { name: "Inkt" })).toHaveClass("hs-knop-ink");
  });
});

describe("de headerknop", () => {
  const headerKnop = (container: HTMLElement) =>
    container.querySelector<HTMLAnchorElement>('header a[aria-label="Check jouw subsidies"]');

  it("staat er gewoon op elke pagina zonder ctaNaElement", () => {
    const { container } = render(<Header />);
    const knop = headerKnop(container);
    expect(knop).toHaveClass("hs-knop-oker");
    expect(knop).not.toHaveAttribute("tabindex");
    expect(knop).toHaveAttribute("data-verborgen", "false");
  });

  it("wacht op de homepagina tot de hero-knop uit beeld is, en is dan niet focusbaar", () => {
    document.body.insertAdjacentHTML("beforeend", '<a id="hero-knop" href="/subsidiecheck">x</a>');
    const { container } = render(<Header ctaNaElement="hero-knop" />);
    const knop = headerKnop(container);
    // In jsdom meldt de observer nooit dat de hero-knop uit beeld is: dus verborgen.
    expect(knop).toHaveAttribute("data-verborgen", "true");
    expect(knop).toHaveAttribute("tabindex", "-1");
    expect(knop).toHaveAttribute("aria-hidden", "true");
    document.getElementById("hero-knop")?.remove();
  });

  it("heeft geen inline animatie meer (die negeerde minder beweging)", () => {
    const bron = readFileSync(resolve(__dirname, "../components/Header.tsx"), "utf8");
    expect(bron).not.toMatch(/sheen/);
  });
});

describe("useStaffel", () => {
  const Lijst = () => {
    const ref = useRef<HTMLDivElement>(null);
    useStaffel(ref);
    return (
      <div ref={ref}>
        <p data-veer>een</p>
        <p data-veer>twee</p>
      </div>
    );
  };

  it("doet niets bij minder beweging: alles staat meteen op zijn plek", () => {
    // src/test/setup.ts zet prefers-reduced-motion aan.
    render(<Lijst />);
    for (const p of screen.getAllByText(/een|twee/)) {
      expect(p).not.toHaveClass("hs-wacht");
      expect(p).not.toHaveClass("hs-in");
    }
  });
});

describe("Sterren", () => {
  it("tekent puntige sterren, niet de ronde van lucide", () => {
    const { container } = render(<Sterren waarde={4.9} />);
    const paden = container.querySelectorAll("path");
    expect(paden).toHaveLength(10);
    paden.forEach((p) => expect(p.getAttribute("d")).toBe(STER_PAD));
    expect(container.querySelector(".lucide")).toBeNull();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "4,9 van 5 sterren");
  });
});
