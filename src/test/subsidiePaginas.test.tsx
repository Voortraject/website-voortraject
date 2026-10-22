import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

import SubsidiesLandelijk from "@/pages/SubsidiesLandelijk";
import SubsidiesNijBegun from "@/pages/SubsidiesNijBegun";
import SubsidiesRegionaal from "@/pages/SubsidiesRegionaal";
import SubsidiesStapelen from "@/pages/SubsidiesStapelen";

// De vier subsidiepagina's in de huisstijl van oktober 2026. Bewaakt het
// gedrag dat met de restyle veranderde: één FAQ-vraag tegelijk open, stappen
// die gewoon in beeld staan (geen eigen observer die ze onzichtbaar houdt),
// de slot-CTA in het donkere footerpaneel en geen losse hexkleuren meer.

const PAGINAS: [string, ComponentType, string][] = [
  ["landelijk", SubsidiesLandelijk, "src/pages/SubsidiesLandelijk.tsx"],
  ["nij-begun", SubsidiesNijBegun, "src/pages/SubsidiesNijBegun.tsx"],
  ["regionaal", SubsidiesRegionaal, "src/pages/SubsidiesRegionaal.tsx"],
  ["stapelen", SubsidiesStapelen, "src/pages/SubsidiesStapelen.tsx"],
];

const toon = (Pagina: ComponentType) =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Pagina />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe.each(PAGINAS)("/subsidies/%s", (_naam, Pagina, bron) => {
  it("heeft één h1 en een oker hoofdknop waar de headerknop op wacht", () => {
    const { container } = toon(Pagina);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const heroKnoppen = container.querySelector("#subsidie-hero-knop");
    expect(heroKnoppen).not.toBeNull();
    expect(within(heroKnoppen as HTMLElement).getByRole("link", { name: "Ja ik wil gratis advies" })).toHaveClass("hs-knop-oker");
  });

  it("opent één vraag tegelijk in de FAQ", () => {
    toon(Pagina);
    const faq = screen.getByRole("heading", { level: 2, name: /Veelgestelde vragen/ }).closest("section") as HTMLElement;
    const vragen = within(faq).getAllByRole("button");
    expect(vragen.length).toBeGreaterThanOrEqual(4);
    vragen.forEach((v) => expect(v).toHaveAttribute("aria-expanded", "false"));

    fireEvent.click(vragen[0]);
    expect(vragen[0]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(vragen[1]);
    expect(vragen[0]).toHaveAttribute("aria-expanded", "false");
    expect(vragen[1]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(vragen[1]);
    expect(vragen[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("houdt niets onzichtbaar tot het in beeld scrolt", () => {
    const { container } = toon(Pagina);
    const verstopt = [...container.querySelectorAll<HTMLElement>("[style]")].filter((el) => el.style.opacity === "0");
    expect(verstopt).toHaveLength(0);
    expect(container.querySelectorAll(".hs-wacht")).toHaveLength(0);
  });

  it("zet de slot-CTA in het donkere footerpaneel", () => {
    toon(Pagina);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("heading", { name: "Ontdek welke subsidies voor jouw woning gelden" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Plan een gratis gesprek" })).toHaveClass("hs-knop-oker");
  });

  it("gebruikt geen losse hexkleuren of rgba meer", () => {
    const tekst = readFileSync(resolve(process.cwd(), bron), "utf-8");
    expect(tekst).not.toMatch(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba\(/);
  });
});

describe("Nij Begun: de uitleg bij een maatregel", () => {
  it("klapt open en sluit met Escape", () => {
    toon(SubsidiesNijBegun);
    const knop = screen.getByRole("button", { name: "Meer informatie over Spouwmuurisolatie" });
    fireEvent.click(knop);
    expect(screen.getByRole("tooltip")).toHaveTextContent(/spouwmuren/);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
