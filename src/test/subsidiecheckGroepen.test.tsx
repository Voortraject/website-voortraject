import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// De groepskoppen op het resultaat, en de zin die uitlegt waarom er groepen zijn.
//
// De lijst staat gegroepeerd per overheidslaag. Dat is een goede ordening, maar
// de boodschap die erachter zit werd nergens uitgesproken: dat dit geld uit
// verschillende potten komt en je het daarom vaak naast elkaar kunt aanvragen.
// Die zin stond ooit op élke kaart, is toen weggehaald omdat hij twaalf keer
// herhaald werd, en hoorde daarna één keer op het resultaat terug te komen.
// Dat is er nooit van gekomen; deze test houdt hem op zijn plek.
//
// En "Leningen en overig" was als kop onwaar: leningen staan verspreid over
// álle groepen en zijn aan hun blauwe kleur te herkennen.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

vi.mock("@/hooks/useWoningInfo", () => ({
  useWoningInfo: () => ({ data: { energielabel: null }, isPending: false }),
}));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined, isPending: false }) }));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined, isPending: false }) }));

import { StapResultaat } from "@/components/subsidiecheck/StapResultaat";
import type { PdokAdres } from "@/lib/pdok";
import {
  subsidieProvider,
  WAAROM_GROEPEN,
  type SubsidieCheckInput,
  type SubsidieRegeling,
} from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "9742HJ",
  huisnummer: "263",
  gemeente: "Groningen",
  provincie: "Groningen",
  bewonertype: "woningeigenaar",
  maatregelen: [],
};

const adres: PdokAdres = {
  straatnaam: "Planetenlaan",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

function regeling(id: string, niveau: SubsidieRegeling["niveau"]): SubsidieRegeling {
  return {
    id,
    titel: `Regeling ${id}`,
    niveau,
    type: "subsidie",
    aanbieder: "RVO",
    omschrijving: "Een regeling.",
    bronUrl: "https://www.rvo.nl",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
  };
}

function toon(regelingen: SubsidieRegeling[]) {
  vi.mocked(subsidieProvider.check).mockResolvedValue(regelingen);
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <StapResultaat input={input} adres={adres} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("groepen op het resultaat", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(subsidieProvider.check).mockReset();
  });

  it("noemt de groepen in bewonerstaal", async () => {
    toon([regeling("a", "rijk"), regeling("b", "gemeente"), regeling("c", "provincie")]);

    expect(await screen.findByText("Van de Rijksoverheid")).toBeInTheDocument();
    expect(screen.getByText("Van jouw gemeente")).toBeInTheDocument();
    expect(screen.getByText("Van de provincie")).toBeInTheDocument();
  });

  it("belooft geen leningen meer in een groepskop", async () => {
    toon([regeling("a", "rijk"), regeling("b", "overig")]);

    await screen.findByText("Van de Rijksoverheid");
    expect(screen.queryByText(/leningen en overig/i)).toBeNull();
    expect(screen.getByText("Van andere aanbieders")).toBeInTheDocument();
  });

  it("legt één keer uit waarom er groepen zijn", async () => {
    toon([regeling("a", "rijk"), regeling("b", "gemeente")]);

    expect(await screen.findAllByText(WAAROM_GROEPEN)).toHaveLength(1);
  });

  it("laat die uitleg weg als alles in één groep valt", async () => {
    // Dan valt er niets naast elkaar te leggen en zou de zin een loze belofte zijn.
    toon([regeling("a", "rijk"), regeling("b", "rijk")]);

    await screen.findByText("Van de Rijksoverheid");
    expect(screen.queryByText(WAAROM_GROEPEN)).toBeNull();
  });
});
