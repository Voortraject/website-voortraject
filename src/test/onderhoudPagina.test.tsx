import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * Onderhoud was de laatste pagina met eigen opmaak en zat daardoor met twee
 * problemen: hij oogde als een andere website, en zijn eigen donkere
 * slotsectie stond direct boven de footer. De footer rendert zijn donkere
 * paneel met afgeronde bovenhoeken in een witte wikkel, dus precies in die
 * hoeken piepte het wit door. Beide zijn opgelost door de pagina op het
 * gedeelde template te zetten; de test hieronder bewaakt dat de slot-CTA
 * binnen de footer valt en niet als losse sectie terugkomt.
 *
 * Inhoudelijk is de afspraak dat deze pagina puur informatief is. De belofte
 * dat Voortraject overzicht houdt op je onderhoud moest eraf, en dat is hier
 * een test en niet een goede voornemen.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Onderhoud from "@/pages/maatregelen/Onderhoud";
import { KALENDER, OPBRENGST, SIGNALEN, VERPLICHT } from "@/data/onderhoud";

const toon = () => render(<MemoryRouter><Onderhoud /></MemoryRouter>);

describe("onderhoudspagina: de kalender", () => {
  it("toont elke installatie met alle beurten, termijnen en wie het doet", () => {
    const { container } = toon();
    for (const installatie of KALENDER) {
      expect(container.textContent).toContain(installatie.naam);
      for (const beurt of installatie.beurten) {
        expect(container.textContent).toContain(beurt.wat);
        expect(container.textContent).toContain(beurt.wanneer);
      }
    }
    // Zelf en specialist staan als merkteken bij de beurten, niet als eigen sectie.
    expect(screen.getAllByText("Zelf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Specialist").length).toBeGreaterThan(0);
  });

  it("geeft bij elke beurt de reden, want zonder reden is het huiswerk", () => {
    const { container } = toon();
    for (const installatie of KALENDER) {
      for (const beurt of installatie.beurten) {
        expect(container.textContent).toContain(beurt.waarom);
      }
    }
  });

  it("zegt het eerlijk waar een bron geen termijn geeft", () => {
    const { container } = toon();
    const metVoorbehoud = KALENDER.filter((i) => i.voorbehoud);
    expect(metVoorbehoud.length).toBeGreaterThan(0);
    for (const installatie of metVoorbehoud) {
      expect(container.textContent).toContain(installatie.voorbehoud);
    }
    // Voor warmtepomp en airco noemt Milieu Centraal alleen "regelmatig"; er
    // mag hier dus nergens een verzonnen jaarlijkse termijn staan.
    expect(container.textContent).toMatch(/wij verzinnen er geen/i);
  });
});

describe("onderhoudspagina: verplicht of garantie", () => {
  it("legt uit dat de wet over de uitvoerder gaat, niet over de termijn", () => {
    const { container } = toon();
    expect(container.textContent).toContain(VERPLICHT.kern);
    for (const eis of VERPLICHT.wettelijk) {
      expect(screen.getByText(eis.naam)).toBeInTheDocument();
    }
  });

  it("zet STEK neer als aanvulling en niet als wettelijke eis", () => {
    const { container } = toon();
    expect(container.textContent).toMatch(/STEK is geen wettelijke eis/);
    expect(container.textContent).not.toMatch(/STEK, verplichte certificering/);
  });

  it("verwijst voor de termijn naar de eigen garantievoorwaarden", () => {
    const { container } = toon();
    expect(container.textContent).toContain(VERPLICHT.garantie);
  });
});

describe("onderhoudspagina: signalen en opbrengst", () => {
  it("toont elk storingssignaal met wat het betekent en wat je doet", () => {
    const { container } = toon();
    for (const rij of SIGNALEN) {
      expect(container.textContent).toContain(rij.signaal);
      expect(container.textContent).toContain(rij.betekent);
      expect(container.textContent).toContain(rij.doen);
    }
  });

  it("onderbouwt elk voordeel met het mechanisme eronder", () => {
    const { container } = toon();
    for (const punt of OPBRENGST) {
      expect(container.textContent).toContain(punt.kop);
      expect(container.textContent).toContain(punt.tekst);
    }
    // De kop van de kostensectie is omgezet: onderhoud kent geen investering.
    expect(container.textContent).toContain("Wat onderhoud oplevert");
    expect(container.textContent).not.toMatch(/Wat je investering oplevert/);
  });
});

describe("onderhoudspagina: puur informatief", () => {
  it("belooft nergens meer dat Voortraject het onderhoud bijhoudt", () => {
    const { container } = toon();
    expect(container.textContent).not.toMatch(/houden overzicht op het onderhoud/i);
    expect(container.textContent).not.toMatch(/onderhoudscontract(en)? (af)?sluit/i);
    // Wat er wel staat: dat wij het níét doen.
    expect(container.textContent).toMatch(/Wij doen zelf geen onderhoud/);
    expect(container.textContent).toMatch(/Wij doen geen onderhoud/);
  });

  it("stuurt de afsluitende CTA naar het verduurzamingstraject", () => {
    const { container } = toon();
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain("/contact");
  });
});

describe("onderhoudspagina: opbouw", () => {
  it("zet de slot-CTA binnen de footer, zodat er geen witte hoekjes ontstaan", () => {
    const { container } = toon();
    // De footer rendert zijn donkere paneel met afgeronde bovenhoeken in een
    // witte wikkel. Staat de CTA als losse donkere sectie erboven, dan piept
    // dat wit in de hoeken door. Via de cta-prop zitten ze in één vlak.
    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(within(footer as HTMLElement).getByText(/Nog aan het begin van je/)).toBeInTheDocument();

    // En er hangt niets meer buiten het template: de laatste sectie in main is
    // de FAQ, niet een eigen donkere slotsectie.
    const secties = Array.from(container.querySelectorAll("main > section"));
    expect(secties.at(-1)?.getAttribute("data-bg")).toBe("zand");
  });

  it("blijft op maximaal zes inhoudelijke secties", () => {
    const { container } = toon();
    const metAchtergrond = Array.from(container.querySelectorAll("main > section")).filter((s) =>
      s.hasAttribute("data-bg"),
    );
    // Eerste is de hero, laatste de FAQ.
    expect(metAchtergrond.slice(1, -1).length).toBeLessThanOrEqual(6);
  });

  it("neemt geen landelijk subsidiebedrag als uitgangspunt", () => {
    const { container } = toon();
    expect(container.textContent).not.toMatch(/ISDE/);
  });

  it("verwijst naar de bronnen met een controledatum", () => {
    const { container } = toon();
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
    expect(hrefs.some((h) => h.includes("milieucentraal.nl"))).toBe(true);
    expect(hrefs.some((h) => h.includes("liander.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });
});
