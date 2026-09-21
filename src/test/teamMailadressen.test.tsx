import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// De teamkaarten op /over-ons geven per persoon een directe mailroute. Wie al
// weet wie hij nodig heeft, slaat het contactformulier over. Deze test bewaakt
// dat elk adres bij de juiste persoon staat: een verwisseld adres stuurt post
// naar de verkeerde collega en dat valt op de site zelf niet op.

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/components/sections/Cijfers", () => ({ Cijfers: () => null }));
vi.mock("@/components/CtaButton", () => ({ CtaButton: () => null }));

import OverOns from "@/pages/OverOns";
import { teamJsonLd } from "@/config/team";

const TEAM = [
  ["Michael", "michael@voortraject.nl"],
  ["Tim", "tim@voortraject.nl"],
  ["Wouter", "wouter@voortraject.nl"],
  ["Christian", "christian@voortraject.nl"],
];

describe("teamkaarten op /over-ons", () => {
  it("geeft iedere medewerker zijn eigen mailadres", () => {
    render(<OverOns />);

    for (const [naam, adres] of TEAM) {
      const link = screen.getByRole("link", { name: new RegExp(`Mail ${naam}`) });
      expect(link, naam).toHaveAttribute("href", `mailto:${adres}`);
      // Het adres staat alleen in de link, niet als tekst op de kaart. De
      // tooltip is dan de enige plek waar een ziende bezoeker het adres ziet
      // voordat hij klikt.
      expect(link, naam).toHaveAttribute("title", `Mail ${naam}: ${adres}`);
    }
  });

  it("zet op de teamkaarten geen andere mailroute dan die vier", () => {
    const { container } = render(<OverOns />);
    const adressen = Array.from(container.querySelectorAll('a[href^="mailto:"]')).map((a) =>
      (a.getAttribute("href") ?? "").replace("mailto:", ""),
    );

    expect(adressen.sort()).toEqual(TEAM.map(([, adres]) => adres).sort());
  });
  it("zet het team als Person-schema op de pagina", () => {
    const personen = teamJsonLd.employee;

    expect(teamJsonLd["@type"]).toBe("Organization");
    expect(personen).toHaveLength(TEAM.length);

    for (const [i, [naam, adres]] of TEAM.entries()) {
      // Volgorde volgt het team-array, zodat schema en kaarten niet uiteen lopen.
      expect(personen[i]["@type"], naam).toBe("Person");
      expect(personen[i].name).toBe(naam);
      expect(personen[i].email).toBe(adres);
      expect(personen[i].jobTitle, naam).toBeTruthy();
      expect(personen[i].image, naam).toContain("https://voortraject.nl/");
      expect(personen[i].worksFor["@id"]).toBe(teamJsonLd["@id"]);
    }
  });
});
