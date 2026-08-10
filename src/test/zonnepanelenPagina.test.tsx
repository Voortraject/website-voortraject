import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De zonnepanelenpagina staat of valt bij één feit: salderen stopt op
 * 1 januari 2027, in één keer en niet stapsgewijs. De oude tekst zei het
 * verkeerde, en een bezoeker die daarop afgaat rekent zich rijk. Deze tests
 * bewaken dat het nieuwe verhaal er staat, mét de bedragen erbij.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Zonnepanelen from "@/pages/maatregelen/Zonnepanelen";
import {
  DAK_HOEKEN,
  DAK_RICHTINGEN,
  euro,
  getal,
  SALDERING,
  SETS,
  ZELFVERBRUIK,
} from "@/data/zonnepanelen";

const toon = () => render(<MemoryRouter><Zonnepanelen /></MemoryRouter>);

describe("zonnepanelenpagina: het stoppen van de saldering", () => {
  it("zegt dat salderen in één keer stopt, niet stapsgewijs", () => {
    const { container } = toon();
    expect(container.textContent).toContain(SALDERING.stopt);
    expect(screen.getByText(/Niet stapsgewijs, maar in één keer/)).toBeInTheDocument();
    // De oude, achterhaalde formulering mag niet terugkomen.
    expect(container.textContent).not.toMatch(/stapsgewijs afgebouwd/);
    expect(container.textContent).not.toMatch(/wordt de komende jaren afgebouwd/);
  });

  it("noemt de ondergrens van de vergoeding na 2027", () => {
    const { container } = toon();
    expect(container.textContent).toContain(SALDERING.ondergrens);
    expect(container.textContent).toContain(String(SALDERING.ondergrensTot));
  });

  it("zet per set panelen naast elkaar wat het nu en straks scheelt", () => {
    const { container } = toon();
    for (const set of SETS) {
      expect(container.textContent).toContain(`${set.panelen} panelen`);
      expect(container.textContent).toContain(euro(set.besparingNu));
      expect(container.textContent).toContain(euro(set.besparingStraks));
      // Het hele punt: het wordt fors minder.
      expect(set.besparingStraks).toBeLessThan(set.besparingNu);
    }
  });

  it("wijst zelfverbruik aan als de knop waar je aan kunt draaien", () => {
    const { container } = toon();
    expect(container.textContent).toContain(`${ZELFVERBRUIK.gemiddeld} procent`);
    expect(container.textContent).toContain(ZELFVERBRUIK.verhouding);
    for (const manier of ZELFVERBRUIK.manieren) {
      expect(screen.getByText(manier.kop)).toBeInTheDocument();
    }
  });
});

describe("zonnepanelenpagina: wat jouw dak kan", () => {
  it("toont het volledige raster met richtingen en hoeken", () => {
    const { container } = toon();
    const tabel = container.querySelector("table");
    expect(tabel).toBeInTheDocument();

    for (const richting of DAK_RICHTINGEN) {
      expect(screen.getByRole("rowheader", { name: richting.naam })).toBeInTheDocument();
    }
    for (const hoek of DAK_HOEKEN) {
      expect(screen.getByRole("columnheader", { name: `${hoek}°` })).toBeInTheDocument();
    }
    // 8 richtingen maal 6 hoeken.
    expect(tabel?.querySelectorAll("tbody td")).toHaveLength(
      DAK_RICHTINGEN.length * DAK_HOEKEN.length,
    );
  });

  it("houdt zuid op 30 tot 45 graden als ijkpunt van 100 procent", () => {
    toon();
    const zuid = DAK_RICHTINGEN.find((r) => r.naam === "Zuid")!;
    expect(zuid.opbrengst[DAK_HOEKEN.indexOf(30)]).toBe(100);
    expect(zuid.opbrengst[DAK_HOEKEN.indexOf(45)]).toBe(100);
    expect(Math.max(...DAK_RICHTINGEN.flatMap((r) => r.opbrengst))).toBe(100);
  });
});

describe("zonnepanelenpagina: kosten, kruislinks en bronnen", () => {
  it("noemt per set de prijs en de opbrengst", () => {
    const { container } = toon();
    for (const set of SETS) {
      expect(container.textContent).toContain(euro(set.prijs));
      expect(container.textContent).toContain(`${getal(set.opbrengst)} kWh`);
    }
  });

  it("verwijst naar de maatregelen die het zelfverbruik verhogen", () => {
    const { container } = toon();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain("/verduurzamen/thuisbatterij");
    expect(links).toContain("/verduurzamen/warmtepomp");
    expect(links).toContain("/verduurzamen/laadpaal");
  });

  it("neemt geen landelijk subsidiebedrag als uitgangspunt", () => {
    const { container } = toon();
    // Zelfde afspraak als op de andere maatregelpagina's: ISDE geldt niet in
    // een groot deel van het werkgebied.
    expect(container.textContent).not.toMatch(/ISDE/);
  });

  it("verwijst naar de bronnen met een controledatum", () => {
    const { container } = toon();
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
    expect(hrefs.some((h) => h.includes("rijksoverheid.nl"))).toBe(true);
    expect(hrefs.some((h) => h.includes("milieucentraal.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });

  it("blijft op maximaal zes inhoudelijke secties", () => {
    const { container } = toon();
    const metAchtergrond = Array.from(container.querySelectorAll("main > section")).filter((s) =>
      s.hasAttribute("data-bg"),
    );
    // Eerste is de hero, laatste de FAQ.
    expect(metAchtergrond.slice(1, -1)).toHaveLength(6);
  });
});
