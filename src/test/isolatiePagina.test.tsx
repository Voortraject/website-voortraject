import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De isolatiepagina zet harde cijfers op een publieke site. Die mogen niet
 * stilletjes verkeerd raken.
 *
 * Twee soorten bewaking:
 * 1. De bedragen komen uit één module (src/data/isde.ts) en worden ook echt
 *    daaruit gerenderd, dus tabel en rekenvoorbeeld kunnen niet uit elkaar
 *    lopen.
 * 2. De verdubbelingsregel klopt rekenkundig én de uitzondering staat er
 *    (ventilatie telt niet mee als tweede maatregel). Dat laatste is de
 *    valkuil waar bezoekers geld op verliezen.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Isolatie from "@/pages/maatregelen/Isolatie";
import { ISDE_ISOLATIE, euro } from "@/data/isde";

const toon = () => render(<MemoryRouter><Isolatie /></MemoryRouter>);

describe("isolatiepagina: de schil met ISDE-bedragen", () => {
  it("zet elke isolatiemaatregel met eis, ondergrens en beide bedragen in de tabel", () => {
    toon();
    const tabel = screen.getByRole("table");

    for (const m of ISDE_ISOLATIE) {
      const rij = within(tabel).getByText(m.naam).closest("tr");
      expect(rij, `rij voor ${m.naam} ontbreekt`).not.toBeNull();

      const cellen = within(rij as HTMLElement).getAllByRole("cell").map((c) => c.textContent ?? "");
      expect(cellen.join(" | ")).toContain(m.eis);
      expect(cellen.join(" | ")).toContain(`${m.vanafM2} m²`);
      expect(cellen.join(" | ")).toContain(euro(m.perM2));
      expect(cellen.join(" | ")).toContain(euro(m.perM2Dubbel));
    }
  });

  it("houdt het dubbele bedrag precies twee keer het enkele", () => {
    // Rekenkundige controle op de brondata zelf: als iemand een bedrag bijwerkt
    // en de andere kolom vergeet, staat er een verkeerde belofte op de site.
    for (const m of ISDE_ISOLATIE) {
      expect(m.perM2Dubbel, `${m.naam}: dubbel bedrag klopt niet`).toBeCloseTo(m.perM2 * 2, 2);
    }
  });

  it("noemt de uitzondering dat ventilatie niet meetelt als tweede maatregel", () => {
    toon();
    expect(
      screen.getAllByText(/ventilatie.*verdubbelt.*niet|verdubbelt.*niet.*ventilatie/i).length,
    ).toBeGreaterThan(0);
  });

  it("verwijst naar de bron met een controledatum", () => {
    const { container } = toon();
    const bronlink = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
      a.href.includes("rvo.nl"),
    );
    expect(bronlink).toBeDefined();
    expect(screen.getAllByText(/gecontroleerd op 10 augustus 2026/).length).toBeGreaterThan(0);
  });
});

describe("isolatiepagina: het rekenvoorbeeld", () => {
  it("rekent de verdubbeling goed door", () => {
    toon();
    const spouw = ISDE_ISOLATIE.find((m) => m.deel === "spouw")!;
    const dak = ISDE_ISOLATIE.find((m) => m.deel === "dak")!;

    // 50 m² spouw en 40 m² dak, de oppervlaktes uit het voorbeeld.
    const los = 50 * spouw.perM2 + 40 * dak.perM2;
    const samen = 50 * spouw.perM2Dubbel + 40 * dak.perM2Dubbel;

    expect(screen.getAllByText(euro(los)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(euro(samen)).length).toBeGreaterThan(0);
    // Het verschil is de kern van het voorbeeld.
    expect(screen.getByText(new RegExp(`${euro(samen - los)} meer subsidie`))).toBeInTheDocument();
  });

  it("presenteert de oppervlaktes als voorbeeld, niet als gemiddelde", () => {
    toon();
    expect(screen.getByText(/Rekenvoorbeeld met gekozen oppervlaktes/)).toBeInTheDocument();
  });
});

describe("isolatiepagina: het ventilatieblok", () => {
  it("behandelt de drie soorten ventilatie", () => {
    toon();
    expect(screen.getByText("Natuurlijke ventilatie")).toBeInTheDocument();
    expect(screen.getByText("Mechanische afzuiging")).toBeInTheDocument();
    expect(screen.getByText("Balansventilatie met WTW")).toBeInTheDocument();
  });

  it("noemt het vochtrisico en de ventilatiesubsidie van 2026", () => {
    toon();
    // Staat bewust op meer plekken: het ventilatieblok, de aandachtspunten en de FAQ.
    expect(screen.getAllByText(/vocht en schimmel/).length).toBeGreaterThan(1);
    expect(screen.getByText(/Nieuw in 2026:/)).toBeInTheDocument();
    expect(screen.getByText(/€ 400/)).toBeInTheDocument();
  });
});
