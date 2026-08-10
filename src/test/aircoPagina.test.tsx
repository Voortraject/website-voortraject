import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De aircopagina noemde eerder geen enkel cijfer en begon met "aangename
 * verkoeling". Nu staat het verbruik vooraan, mét de ventilator ernaast, want
 * dat is het eerlijke antwoord van een partij die zelf geen airco's verkoopt.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Airco from "@/pages/maatregelen/Airco";
import { EERST_DIT, GELUID, KOELSYSTEMEN, VERWARMEN, euro, getal } from "@/data/airco";

const toon = () => render(<MemoryRouter><Airco /></MemoryRouter>);

describe("aircopagina: wat koelen kost", () => {
  it("zet alle vier de manieren met verbruik, kosten en CO2 naast elkaar", () => {
    const { container } = toon();
    for (const systeem of KOELSYSTEMEN) {
      expect(container.textContent).toContain(systeem.naam);
      expect(container.textContent).toContain(`${getal(systeem.kwh)} kWh`);
      expect(container.textContent).toContain(euro(systeem.euro));
      expect(container.textContent).toContain(`${getal(systeem.co2)} kg CO2`);
    }
  });

  it("houdt de ventilator in de vergelijking, ook al verkoopt niemand die", () => {
    const { container } = toon();
    const ventilator = KOELSYSTEMEN.find((s) => s.naam === "Ventilator")!;
    const mobiel = KOELSYSTEMEN.find((s) => s.naam === "Mobiele airco")!;
    // Het punt van de tabel: het verschil is een factor twintig.
    expect(mobiel.kwh / ventilator.kwh).toBeGreaterThan(15);
    expect(container.textContent).toMatch(/twintig keer zoveel stroom als een ventilator/);
  });

  it("noemt wat je vóór een airco probeert", () => {
    toon();
    for (const punt of EERST_DIT) {
      expect(screen.getByText(punt.kop)).toBeInTheDocument();
    }
  });
});

describe("aircopagina: de grens met de warmtepomp", () => {
  it("legt uit dat een split-airco dezelfde techniek is", () => {
    const { container } = toon();
    expect(container.textContent).toContain(VERWARMEN.kern);
    expect(container.textContent).toContain(VERWARMEN.grens);
  });

  it("verwijst door naar de warmtepomppagina", () => {
    const { container } = toon();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain("/verduurzamen/warmtepomp");
    expect(links).toContain("/verduurzamen/onderhoud");
  });
});

describe("aircopagina: vakmanschap, geluid en opbouw", () => {
  it("noemt de geluidsnorm met het artikel erbij", () => {
    const { container } = toon();
    expect(container.textContent).toContain(`${GELUID.grenswaarde} dB`);
    expect(container.textContent).toContain(GELUID.artikel);
  });

  it("zet F-gassen neer als de wettelijke eis en STEK als aanvulling", () => {
    const { container } = toon();
    expect(screen.getByText("F-gassen")).toBeInTheDocument();
    expect(container.textContent).toMatch(/Geen wettelijke eis, wel een goed teken/);
    // De oude tekst noemde STEK "verplichte certificering"; dat klopt niet.
    expect(container.textContent).not.toMatch(/STEK, verplichte certificering/);
  });

  it("neemt geen landelijk subsidiebedrag als uitgangspunt", () => {
    const { container } = toon();
    expect(container.textContent).not.toMatch(/ISDE/);
  });

  it("blijft op maximaal zes inhoudelijke secties", () => {
    const { container } = toon();
    const metAchtergrond = Array.from(container.querySelectorAll("main > section")).filter((s) =>
      s.hasAttribute("data-bg"),
    );
    // Eerste is de hero, laatste de FAQ.
    expect(metAchtergrond.slice(1, -1).length).toBeLessThanOrEqual(6);
  });

  it("verwijst naar de bronnen met een controledatum", () => {
    const { container } = toon();
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
    expect(hrefs.some((h) => h.includes("milieucentraal.nl"))).toBe(true);
    expect(hrefs.some((h) => h.includes("iplo.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });
});
