import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Compass } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Herkenning } from "@/components/sections/Herkenning";
import { Subsidies } from "@/components/sections/Subsidies";
import { TrustCardList } from "@/components/sections/TrustCardList";
import { WaarWeBijHelpen } from "@/components/sections/WaarWeBijHelpen";
import { WaaromKiezen } from "@/components/sections/WaaromKiezen";

// De middensecties van de homepagina in de huisstijl van oktober 2026: tegels
// zonder rand met een rond icoon, chips in plaats van onderstreepte links, en
// swipen op de telefoon met puntjes die je ook kunt aantikken.

const BESTANDEN = ["Herkenning", "TrustCardList", "WaarWeBijHelpen", "Subsidies", "WaaromKiezen"];

describe("de middensecties van de homepagina", () => {
  it("bevatten geen losse hex-kleuren meer", () => {
    for (const naam of BESTANDEN) {
      const bron = readFileSync(resolve(__dirname, `../components/sections/${naam}.tsx`), "utf8");
      expect(bron, naam).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("zetten het accentwoord van elke kop in de markeerstreep", () => {
    const { container } = render(
      <>
        <Herkenning />
        <WaarWeBijHelpen />
        <Subsidies />
        <WaaromKiezen />
      </>,
    );
    const koppen = [...container.querySelectorAll("h2")];
    expect(koppen).toHaveLength(5);
    for (const kop of koppen) {
      expect(kop).toHaveClass("hs-h2");
      expect(kop.querySelector(".hs-accent")).not.toBeNull();
      expect(kop.querySelector(".text-accent")).toBeNull();
    }
  });
});

describe("TrustCardList", () => {
  const items = [
    { icon: Compass, title: "Een", body: "Uitleg een" },
    { icon: Compass, title: "Twee", body: "Uitleg twee" },
    { icon: Compass, title: "Drie", body: "Uitleg drie" },
  ];

  it("toont tegels zonder rand in de gekozen tint, met het icoon in een inktblauw rondje", () => {
    const { container } = render(<TrustCardList items={items} tint="zand" />);
    const tegels = container.querySelectorAll("ul > li");
    expect(tegels).toHaveLength(3);
    for (const tegel of tegels) {
      expect(tegel).toHaveClass("hs-tegel", "hs-zand");
      expect(tegel.className).not.toMatch(/\bborder\b/);
      expect(tegel.querySelector(".hs-rondje.hs-rondje-ink")).not.toBeNull();
      expect(tegel.querySelector("h3")).toHaveClass("hs-h3");
      expect(tegel.querySelector("p")).toHaveClass("hs-tekst");
    }
  });

  it("kent ook de blauwgrijze tint", () => {
    const { container } = render(<TrustCardList items={items} tint="blauw" />);
    expect(container.querySelector("ul > li")).toHaveClass("hs-blauw-zacht");
  });

  it("heeft aantikbare puntjes die naar de juiste tegel scrollen", () => {
    render(<TrustCardList items={items} tint="zand" />);
    const puntjes = screen.getAllByRole("button", { name: /tegel \d van 3/i });
    expect(puntjes).toHaveLength(3);
    expect(puntjes[0]).toHaveAttribute("aria-current", "true");
    expect(puntjes[1]).not.toHaveAttribute("aria-current");

    const lijst = screen.getByRole("list");
    const scrollTo = vi.fn();
    lijst.scrollTo = scrollTo as unknown as typeof lijst.scrollTo;
    fireEvent.click(puntjes[2]);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    // Bij minder beweging (in tests aan) springt de rij, zonder vloeiend scrollen.
    expect(scrollTo.mock.calls[0][0]).toMatchObject({ behavior: "auto" });
  });
});

describe("Herkenning", () => {
  it("nummert de stappen in een inktblauw rondje en houdt de knop naar contact", () => {
    const { container } = render(<Herkenning />);
    const stappen = container.querySelectorAll("ol > li");
    expect(stappen).toHaveLength(3);
    expect([...stappen].map((s) => s.querySelector(".hs-rondje-ink")?.textContent)).toEqual(["01", "02", "03"]);
    expect(screen.getByRole("link", { name: "Plan een gratis gesprek" })).toHaveAttribute("href", "/contact");
    expect(screen.getByAltText("Adviseur van Voortraject in gesprek met een bewoner aan tafel")).toHaveClass("hs-foto");
  });
});

describe("WaarWeBijHelpen", () => {
  it("geeft elk onderwerp een kaart met chips naar dezelfde pagina's", () => {
    const { container } = render(<WaarWeBijHelpen />);
    const kaarten = container.querySelectorAll("article");
    expect(kaarten).toHaveLength(3);
    for (const kaart of kaarten) expect(kaart).toHaveClass("hs-tegel", "hs-klik");
    const chips = [...container.querySelectorAll("a.hs-chip")].map((a) => a.getAttribute("href"));
    expect(chips).toEqual([
      "/verduurzamen/isolatie",
      "/verduurzamen/warmtepomp",
      "/verduurzamen/zonnepanelen",
      "/verduurzamen/thuisbatterij",
      "/verduurzamen/airco",
      "/verduurzamen/laadpaal",
      "/subsidies/nij-begun",
      "/subsidies/landelijk",
      "/subsidies/regionaal",
      "/subsidies/stapelen",
    ]);
  });
});

describe("Subsidies", () => {
  it("toont drie niveaus in hun eigen tint, met plustekens die niet worden voorgelezen", () => {
    const { container } = render(<Subsidies />);
    const kaarten = container.querySelectorAll("article");
    expect([...kaarten].map((k) => k.querySelector(".hs-rondje")?.className)).toEqual([
      expect.stringContaining("hs-rondje-ink"),
      expect.stringContaining("hs-rondje-provincie"),
      expect.stringContaining("hs-rondje-gemeente"),
    ]);
    expect(kaarten[0]).toHaveClass("hs-blauw");
    expect(kaarten[1]).toHaveClass("hs-tint-provincie");
    expect(kaarten[2]).toHaveClass("hs-zand");
    const plussen = container.querySelectorAll(".hs-rondje-wit");
    expect(plussen).toHaveLength(2);
    for (const plus of plussen) expect(plus.closest("[aria-hidden='true']")).not.toBeNull();

    const knop = screen.getByRole("link", { name: "Meer over subsidies stapelen" });
    expect(knop).toHaveClass("hs-knop-licht");
    expect(knop).toHaveAttribute("href", "/subsidies/stapelen");
    const links = [...kaarten].map((k) => within(k as HTMLElement).getByRole("link"));
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/subsidies/landelijk",
      "/subsidies/regionaal",
      "/subsidies/regionaal",
    ]);
    for (const l of links) expect(l).toHaveClass("hs-pijl-link");
  });
});
