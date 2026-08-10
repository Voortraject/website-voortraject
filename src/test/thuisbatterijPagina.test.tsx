import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De thuisbatterijpagina is de enige die als antwoord "voor de meeste mensen
 * nog niet" geeft. Dat is precies waarom bezoekers hier komen, dus het mag niet
 * ongemerkt verwateren tot een verkoopverhaal.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Thuisbatterij from "@/pages/maatregelen/Thuisbatterij";
import {
  CAPACITEITEN,
  EERST_DIT,
  LETTEN,
  ONTWIKKELINGEN,
  OORDEEL,
  UITZONDERINGEN,
} from "@/data/thuisbatterij";

const toon = () => render(<MemoryRouter><Thuisbatterij /></MemoryRouter>);

describe("thuisbatterijpagina: het eerlijke antwoord", () => {
  it("zet het oordeel bovenaan in plaats van in een voetnoot", () => {
    const { container } = toon();
    expect(screen.getByText(OORDEEL.kop)).toBeInTheDocument();
    expect(container.textContent).toContain(OORDEEL.kern);
    expect(screen.getByText(/Ons eerlijke antwoord/)).toBeInTheDocument();
  });

  it("verwijst het oordeel naar de bron in plaats van naar onszelf", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/conclusie van Milieu Centraal/);
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
    expect(hrefs.some((h) => h.includes("milieucentraal.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });

  it("zegt niet meer dat saldering stapsgewijs wordt afgebouwd", () => {
    const { container } = toon();
    // Stond in het oude contextblok en klopt niet: hij stopt in één keer.
    expect(container.textContent).not.toMatch(/stapsgewijs afgebouwd/);
    expect(container.textContent).toContain("1 januari 2027");
  });

  it("noemt geen terugverdientijd in jaren, want de bron geeft die niet", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/noemt geen terugverdientijd in jaren/);
    expect(container.textContent).not.toMatch(/terugverdientijd van \d+ jaar/);
  });
});

describe("thuisbatterijpagina: de nuance", () => {
  it("legt uit waarom batterijen nu in de belangstelling staan", () => {
    toon();
    for (const punt of ONTWIKKELINGEN) {
      expect(screen.getByText(punt.kop)).toBeInTheDocument();
    }
  });

  it("noemt de gevallen waarin de rekensom anders ligt", () => {
    toon();
    for (const geval of UITZONDERINGEN) {
      expect(screen.getByText(geval.kop)).toBeInTheDocument();
    }
  });

  it("wijst door naar wat op dit moment wél meer oplevert", () => {
    const { container } = toon();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    for (const item of EERST_DIT) {
      expect(links).toContain(item.href);
    }
  });

  it("weegt de milieu-impact mee", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/kritieke grondstoffen/);
  });
});

describe("thuisbatterijpagina: praktisch advies en opbouw", () => {
  it("waarschuwt voor batterijen in het stopcontact", () => {
    toon();
    expect(screen.getByText(LETTEN[0].kop)).toBeInTheDocument();
    expect(screen.getByText(/bedrading kan dan te heet worden/i)).toBeInTheDocument();
  });

  it("geeft de capaciteiten met waar ze voor bedoeld zijn", () => {
    const { container } = toon();
    for (const maat of CAPACITEITEN) {
      expect(container.textContent).toContain(maat.kwh);
      expect(container.textContent).toContain(maat.waarvoor);
    }
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
});
