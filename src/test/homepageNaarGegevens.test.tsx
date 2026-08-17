import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Wie op de homepage zijn adres invult en op "Bekijk mijn subsidies" klikt, heeft
// de vraag van stap 1 ("Jouw woning") al beantwoord. Kwam die daarna tóch op stap
// 1 uit, dan stond er een scherm zonder keuze tussen de bezoeker en zijn
// overzicht. Deze test legt vast dat de knop meteen op "Je gegevens" uitkomt, en
// dat dat niet per ongeluk de poort opent.

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
// Meldt ook of de keuzes uitgeklapt binnenkomen, want dat is precies wat de
// "Aanpassen"-link belooft.
vi.mock("@/components/subsidiecheck/StapAdres", () => ({
  StapAdres: ({ situatieOpen }: { situatieOpen?: boolean }) => (
    <div>{situatieOpen ? "stap-adres met open keuzes" : "stap-adres"}</div>
  ),
}));
vi.mock("@/components/subsidiecheck/StapGegevens", () => ({
  StapGegevens: () => <div>stap-gegevens</div>,
}));
vi.mock("@/components/subsidiecheck/StapResultaat", () => ({
  StapResultaat: () => <div>stap-resultaat</div>,
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/hooks/usePdokAdres", () => ({
  usePdokAdres: (postcode: string) => ({
    data: postcode
      ? {
          straatnaam: "Grote Markt",
          woonplaatsnaam: "Groningen",
          gemeentenaam: "Groningen",
          provincienaam: "Groningen",
        }
      : null,
    isPending: false,
  }),
}));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined }) }));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined }) }));
vi.mock("@/hooks/useWoningInfo", () => ({ useWoningInfo: () => ({ data: undefined }) }));

import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import Subsidiecheck from "@/pages/Subsidiecheck";

const Locatie = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="locatie">{pathname + search}</output>;
};

/** Vult de drie velden en klikt de knop; geeft de URL waar we belanden. */
const vulInEnVerstuur = (postcode: string, huisnummer: string, toevoeging = "") => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <SubsidiecheckCta />
      <Locatie />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText("Postcode"), { target: { value: postcode } });
  fireEvent.change(screen.getByLabelText("Huisnummer"), { target: { value: huisnummer } });
  if (toevoeging) {
    fireEvent.change(screen.getByLabelText(/Toevoeging/), { target: { value: toevoeging } });
  }
  fireEvent.click(screen.getByRole("button", { name: /Bekijk mijn subsidies/i }));

  return screen.getByTestId("locatie").textContent ?? "";
};

beforeEach(() => {
  sessionStorage.clear();
});

describe("de subsidiecheck-CTA op de homepage", () => {
  it("stuurt de bezoeker door met een ingevulde situatie, dus voorbij stap 1", () => {
    const url = vulInEnVerstuur("9711AB", "5");

    expect(url).toContain("/subsidiecheck");
    expect(url).toContain("pc=9711AB");
    expect(url).toContain("hn=5");
    // `type` is wat stap 1 afrondt; zonder deze parameter komt de bezoeker daar
    // alsnog uit. Woningeigenaar is dezelfde standaard als op stap 1 zelf.
    expect(url).toContain("type=woningeigenaar");
    // Geen m-parameter: dan zoeken we op alle maatregelen, net als de standaard
    // op stap 1.
    expect(url).not.toContain("m=");
  });

  it("neemt een toevoeging mee", () => {
    expect(vulInEnVerstuur("9711 ab", "5", "b")).toContain("tv=b");
  });

  it("navigeert niet bij een onvolledig adres", () => {
    expect(vulInEnVerstuur("9711", "5")).toBe("/");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("landt op de gegevensstap en niet op het overzicht", async () => {
    render(
      <MemoryRouter initialEntries={["/subsidiecheck?pc=9711AB&hn=5&type=woningeigenaar"]}>
        <Subsidiecheck />
      </MemoryRouter>,
    );

    expect(await screen.findByText("stap-gegevens")).toBeInTheDocument();
    // De poort blijft dicht: sneller bij de vraag zijn is iets anders dan hem
    // overslaan.
    expect(screen.queryByText("stap-resultaat")).toBeNull();
    expect(screen.queryByText("stap-adres")).toBeNull();
  });
});

// Omdat de knop nu voorbij stap 1 gaat, is dit de enige plek waar de bezoeker
// nog ziet waarop we zoeken. De zin moet er dus staan, en de uitweg erbij.
describe("de regel over waarop we zoeken", () => {
  const toonCta = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SubsidiecheckCta />
        <Locatie />
      </MemoryRouter>,
    );

  it("vertelt op welke standaard we zoeken", () => {
    toonCta();

    // Letterlijk dezelfde zin als op stap 1 (zie StapAdres).
    expect(screen.getByText(/We zoeken voor woningeigenaren op alle maatregelen/i)).toBeInTheDocument();
  });

  it("stuurt Aanpassen naar stap 1 met de keuzes open", () => {
    toonCta();

    fireEvent.click(screen.getByRole("button", { name: /Aanpassen/i }));

    const url = screen.getByTestId("locatie").textContent ?? "";
    expect(url).toContain("/subsidiecheck");
    // sit=1 klapt de keuzes uit; géén type, want dat zou stap 1 juist afronden
    // en de bezoeker meteen weer voorbij de keuzes sturen.
    expect(url).toContain("sit=1");
    expect(url).not.toContain("type=");
  });

  it("neemt mee wat er al ingevuld is, ook een half adres", () => {
    toonCta();

    fireEvent.change(screen.getByLabelText("Postcode"), { target: { value: "9711 ab" } });
    fireEvent.change(screen.getByLabelText("Huisnummer"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Aanpassen/i }));

    const url = screen.getByTestId("locatie").textContent ?? "";
    expect(url).toContain("pc=9711AB");
    expect(url).toContain("hn=5");
    expect(url).toContain("sit=1");
  });

  it("komt op stap 1 uit met de keuzes daadwerkelijk uitgeklapt", async () => {
    render(
      <MemoryRouter initialEntries={["/subsidiecheck?pc=9711AB&hn=5&sit=1"]}>
        <Subsidiecheck />
      </MemoryRouter>,
    );

    expect(await screen.findByText("stap-adres met open keuzes")).toBeInTheDocument();
    expect(screen.queryByText("stap-gegevens")).toBeNull();
  });
});
