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
      expect(link).toHaveTextContent(adres);
    }
  });

  it("zet op de teamkaarten geen andere mailroute dan die vier", () => {
    const { container } = render(<OverOns />);
    const adressen = Array.from(container.querySelectorAll('a[href^="mailto:"]')).map((a) =>
      (a.getAttribute("href") ?? "").replace("mailto:", ""),
    );

    expect(adressen.sort()).toEqual(TEAM.map(([, adres]) => adres).sort());
  });
});
