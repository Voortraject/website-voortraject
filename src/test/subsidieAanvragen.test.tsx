import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import SubsidieAanvragen from "@/pages/SubsidieAanvragen";
import SubsidiesLandelijk from "@/pages/SubsidiesLandelijk";
import SubsidiesNijBegun from "@/pages/SubsidiesNijBegun";
import { Footer } from "@/components/Footer";
import { AANMELDEN_URL } from "@/lib/aanmelden";

// De ingang naar de subsidiedienst: /subsidies/aanvragen, met knoppen naar het
// aanmelden op mijn.voortraject.nl en links vanaf de bestaande subsidiepagina's.

const lees = (pad: string) => readFileSync(resolve(process.cwd(), pad), "utf-8");

const toon = (Pagina: () => JSX.Element) =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Pagina />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("/subsidies/aanvragen", () => {
  it("heeft één h1 en een oker hoofdknop naar het aanmelden, waar de headerknop op wacht", () => {
    const { container } = toon(SubsidieAanvragen);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const hero = container.querySelector("#subsidie-hero-knop") as HTMLElement;
    const knop = within(hero).getByRole("link", { name: "Meld je aan" });
    expect(knop).toHaveClass("hs-knop-oker");
    expect(knop).toHaveAttribute("href", AANMELDEN_URL);
    expect(AANMELDEN_URL).toBe("https://mijn.voortraject.nl/aanmelden");
  });

  it("kiest de regeling vooraf met ?regeling=, zoals het portaal hem leest", () => {
    toon(SubsidieAanvragen);
    expect(screen.getByRole("link", { name: "Meld je aan voor Nij Begun" })).toHaveAttribute("href", `${AANMELDEN_URL}?regeling=nij-begun`);
    expect(screen.getByRole("link", { name: "Meld je aan voor VVG" })).toHaveAttribute("href", `${AANMELDEN_URL}?regeling=vvg`);
    expect(screen.getByRole("link", { name: "Meld je aan voor ISDE" })).toHaveAttribute("href", `${AANMELDEN_URL}?regeling=isde`);
  });

  it("noemt beide vergoedingen", () => {
    const { container } = toon(SubsidieAanvragen);
    const prijzen = container.querySelector("#prijzen") as HTMLElement;
    expect(within(prijzen).getByText("€275")).toBeInTheDocument();
    expect(within(prijzen).getByText("7,5%")).toBeInTheDocument();
  });

  it("zet de eigen slot-CTA in het donkere footerpaneel", () => {
    toon(SubsidieAanvragen);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("heading", { name: "Laat je subsidieaanvraag aan ons over" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Meld je aan" })).toHaveAttribute("href", AANMELDEN_URL);
  });

  it("houdt zich aan de schrijfregels: geen em-dash, geen gratis of kost, geen u-vorm, geen hexkleuren", () => {
    const tekst = lees("src/pages/SubsidieAanvragen.tsx");
    // Alleen de tekst buiten het commentaar bovenaan telt.
    const code = tekst.replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toMatch(/—/);
    expect(code).not.toMatch(/\bgratis\b|\bkost\b|\bkosten\b/i);
    expect(code).not.toMatch(/\b(u|uw)\b/);
    expect(code).not.toMatch(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba\(/);
  });
});

describe("de ingang bestaat echt", () => {
  it("staat als route in App.tsx en in de sitemap", () => {
    expect(lees("src/App.tsx")).toMatch(/<Route path="\/subsidies\/aanvragen" element=\{<SubsidieAanvragen \/>\} \/>/);
    expect(lees("scripts/generate-sitemap.ts")).toContain('{ path: "/subsidies/aanvragen"');
  });

  it("staat in het subsidiemenu en in de footer", () => {
    expect(lees("src/components/Header.tsx")).toContain('{ href: "/subsidies/aanvragen", label: "Subsidie laten aanvragen" }');
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Subsidie laten aanvragen" })).toHaveAttribute("href", "/subsidies/aanvragen");
  });

  it.each([
    ["Nij Begun", SubsidiesNijBegun],
    ["landelijk", SubsidiesLandelijk],
  ])("de pagina %s linkt ernaar", (_naam, Pagina) => {
    toon(Pagina);
    // Het menu en de footer hebben de link ook; het gaat om de link op de pagina zelf.
    const footer = screen.getByRole("contentinfo");
    const kop = screen.getByRole("banner");
    const opDePagina = screen
      .getAllByRole("link", { name: "Subsidie laten aanvragen" })
      .filter((a) => !footer.contains(a) && !kop.contains(a));
    expect(opDePagina).toHaveLength(1);
    expect(opDePagina[0]).toHaveAttribute("href", "/subsidies/aanvragen");
  });
});
