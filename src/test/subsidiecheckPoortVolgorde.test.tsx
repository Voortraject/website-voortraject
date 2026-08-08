import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// De volgorde van de poort. De zoekstap stond eerst op het resultaat, dus ná
// het moment waarop de bezoeker zijn gegevens al had afgestaan. Zichtbaar werk
// bouwt daar geen waarde meer op; het laat iemand wachten die al betaald heeft.
// Nu draait de sequentie vóór de gegevensvraag en noemt de poort daarna het
// aantal gevonden regelingen, zonder titels of bedragen.
//
// Wat deze test bewaakt:
//  - de telling verschijnt en klopt met wat de bron gaf;
//  - er lekt geen inhoud (titels, bedragen) naar de poort;
//  - bij nul regelingen of een bronfout staat er geen ontmoedigende "0"-regel,
//    en komt het formulier er hoe dan ook, want de lead is leidend.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

vi.mock("@/hooks/useWoningInfo", () => ({ useWoningInfo: () => ({ data: undefined, isPending: false }) }));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined, isPending: false }) }));

import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "7811AB",
  huisnummer: "12",
  gemeente: "Emmen",
  provincie: "Drenthe",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

const adres: PdokAdres = {
  straatnaam: "Hoofdstraat",
  woonplaatsnaam: "Emmen",
  gemeentenaam: "Emmen",
  provincienaam: "Drenthe",
};

const regeling = (i: number): SubsidieRegeling => ({
  id: `r${i}`,
  titel: `Subsidie lokale aanpak isolatie ${i}`,
  niveau: "gemeente",
  type: "subsidie",
  aanbieder: "Gemeente",
  omschrijving: "Voor woningeigenaren die hun huis willen isoleren.",
  bedragIndicatie: "tot € 1.500",
  bronUrl: "https://example.nl",
  maatregelen: ["isolatie"],
  doelgroepen: ["woningeigenaar"],
});

const toon = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

describe("de poort zoekt eerst, vraagt daarna", () => {
  beforeEach(() => {
    vi.mocked(subsidieProvider.check).mockReset();
  });

  it("noemt het aantal gevonden regelingen boven de gegevensvraag", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue(Array.from({ length: 12 }, (_, i) => regeling(i)));

    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(await screen.findByText(/We vonden/)).toBeInTheDocument();
    expect(screen.getByText(/12 regelingen/)).toBeInTheDocument();
    // Het adres erbij, zodat het over dít huis gaat en niet over een gemiddelde.
    // Meerdere treffers: de telling noemt het adres én het woningkaartje eronder.
    expect(screen.getAllByText(/Hoofdstraat 12/).length).toBeGreaterThan(0);
  });

  it("geeft de inhoud van het overzicht niet weg", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([regeling(1), regeling(2)]);

    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);
    await screen.findByPlaceholderText(/Je voornaam/);

    // Geen titels en geen bedragen: dat is precies wat achter de poort hoort.
    expect(screen.queryByText(/Subsidie lokale aanpak/)).toBeNull();
    expect(screen.queryByText(/1\.500/)).toBeNull();
  });

  it("toont geen ontmoedigende nul en laat het formulier gewoon zien", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([]);

    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(await screen.findByPlaceholderText(/Je voornaam/)).toBeInTheDocument();
    expect(screen.queryByText(/We vonden/)).toBeNull();
  });

  it("laat de bezoeker ook bij een bronfout gewoon bij het formulier komen", async () => {
    vi.mocked(subsidieProvider.check).mockRejectedValue(new Error("bron plat"));

    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    // useSubsidieCheck zet zelf `retry: 1`, dus de client-instelling telt hier
    // niet: de fout is pas na de retry definitief.
    expect(await screen.findByPlaceholderText(/Je voornaam/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText(/We vonden/)).toBeNull();
  });
});
