import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De laadpaalpagina noemde eerder geen enkel getal: één blok tekst met de
 * pillen Laag, Gemiddeld en Hoog. De vraag waarmee bezoekers binnenkomen, hoe
 * snel kan ik thuis laden en wat kost dat, werd nergens beantwoord.
 *
 * Twee dingen bewaakt deze test met opzet streng. Ten eerste dat de vergelijking
 * thuis tegenover openbaar uit de datamodule komt en niet uit een overgetypt
 * getal in de opmaak. Ten tweede dat STEK niet terugkeert: dat stond hier als
 * eis voor een laadpaal, terwijl STEK over koudemiddelen gaat en die zitten in
 * een laadpaal niet.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Laadpaal from "@/pages/maatregelen/Laadpaal";
import {
  AANSCHAF,
  AANSLUITINGEN,
  BENZINE,
  euro,
  INSTALLATIE,
  LADEN,
  perHonderdKm,
  VERSCHIL_PER_JAAR,
  ZELFVERBRUIK,
} from "@/data/laadpaal";

const toon = () => render(<MemoryRouter><Laadpaal /></MemoryRouter>);

describe("laadpaalpagina: 1-fase of 3-fase", () => {
  it("zet beide aansluitingen naast elkaar met vermogen en laadtijd", () => {
    const { container } = toon();
    for (const aansluiting of AANSLUITINGEN) {
      expect(container.textContent).toContain(aansluiting.naam);
      expect(container.textContent).toContain(aansluiting.laadvermogen);
      expect(container.textContent).toContain(aansluiting.vol.kern);
    }
    // Het getal dat de keuze in perspectief zet: de meeste woningen hebben geen
    // 3-fase, dus 3,7 kW is voor de meeste bezoekers het uitgangspunt.
    expect(container.textContent).toMatch(/70 procent van de huizen/);
  });

  it("noemt verzwaren als optie met een wachttijd, niet als oplossing", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/enkele jaren tot 10 jaar/);
  });
});

describe("laadpaalpagina: veilig laden en load balancing", () => {
  it("noemt alle eisen aan de installatie", () => {
    toon();
    for (const eis of INSTALLATIE.eisen) {
      expect(screen.getByText(eis.kop)).toBeInTheDocument();
    }
    expect(screen.getByText("Aangelegd volgens NEN 1010")).toBeInTheDocument();
  });

  it("waarschuwt voor het stopcontact en het verlengsnoer", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/wordt sterk afgeraden/);
    expect(container.textContent).toMatch(/Nooit via een verlengsnoer/);
  });

  it("laat zien wat er zonder load balancing gebeurt", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/hoofdzekering vliegt eruit/);
    expect(container.textContent).toMatch(/knijpt zichzelf af/);
    expect(container.textContent).toMatch(/voorrangsschakelaar/);
  });

  it("noemt STEK niet meer als eis voor een laadpaal", () => {
    const { container } = toon();
    // STEK gaat over koudemiddelen; een laadpaal heeft die niet.
    expect(container.textContent).not.toMatch(/STEK/);
  });
});

describe("laadpaalpagina: wat het kost", () => {
  it("zet de drie manieren van laden naast elkaar, per jaar en per 100 km", () => {
    const { container } = toon();
    for (const manier of LADEN) {
      expect(container.textContent).toContain(manier.naam);
      expect(container.textContent).toContain(euro(manier.perJaar));
      expect(container.textContent).toContain(perHonderdKm(manier.perJaar));
    }
  });

  it("houdt benzine als ijkpunt en noemt wat een laadpaal kost", () => {
    const { container } = toon();
    expect(container.textContent).toContain(euro(BENZINE.perJaar));
    expect(container.textContent).toContain(euro(AANSCHAF.van));
    expect(container.textContent).toContain(euro(AANSCHAF.tot));
    // Het verschil per jaar staat er, maar wordt geen terugverdientijd genoemd:
    // Milieu Centraal geeft die niet, dus wij verzinnen hem niet.
    expect(container.textContent).toContain(euro(VERSCHIL_PER_JAAR));
    expect(container.textContent).not.toMatch(/terugverdien/i);
  });

  it("rekent per 100 km uit de jaarbedragen en niet uit losse getallen", () => {
    expect(perHonderdKm(650)).toBe("€ 5,42");
    expect(perHonderdKm(1400)).toBe("€ 11,67");
    expect(VERSCHIL_PER_JAAR).toBe(750);
  });
});

describe("laadpaalpagina: laden op eigen zon", () => {
  it("toont het zelfverbruik en het einde van de saldering", () => {
    const { container } = toon();
    for (const rij of ZELFVERBRUIK) {
      expect(container.textContent).toContain(rij.naam);
      expect(container.textContent).toContain(`${rij.deel} procent`);
    }
    // De saldering stopt in één keer, niet stapsgewijs.
    expect(container.textContent).toMatch(/1 januari 2027 stopt de salderingsregeling/);
    expect(container.textContent).not.toMatch(/stapsgewijs afgebouwd/);
  });

  it("verwijst door naar zonnepanelen en thuisbatterij", () => {
    const { container } = toon();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain("/verduurzamen/zonnepanelen");
    expect(links).toContain("/verduurzamen/thuisbatterij");
  });
});

describe("laadpaalpagina: opbouw en bronnen", () => {
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
    expect(hrefs.some((h) => h.includes("nederlandelektrisch.nl"))).toBe(true);
    expect(hrefs.some((h) => h.includes("enexis.nl"))).toBe(true);
    expect(hrefs.some((h) => h.includes("rijksoverheid.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });
});
