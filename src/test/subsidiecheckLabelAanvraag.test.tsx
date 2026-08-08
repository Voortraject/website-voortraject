import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// "Label aanvragen" van begin tot eind. De knop stond in de samenvatting en
// linkte naar /contact, waar de bezoeker een leeg formulier kreeg en alles
// opnieuw invulde wat hij in de check al had gegeven. Nu moet één klik hem naar
// het vraagblok onderaan brengen mét de aanvraag ingevuld, zodat er alleen nog
// verstuurd hoeft te worden.
//
// Deze test dekt de hele keten (Samenvatting -> StapResultaat -> DirectContact);
// de losse stukken staan in subsidiecheckDoodlopendEind.test.tsx.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

// Geen geregistreerd energielabel: precies de situatie waarin het aanbod om er
// een te regelen verschijnt.
vi.mock("@/hooks/useWoningInfo", () => ({
  useWoningInfo: () => ({ data: { energielabel: null }, isPending: false }),
}));
vi.mock("@/hooks/usePandContour", () => ({
  usePandContour: () => ({ data: { pandId: "0114100000000001", bouwjaar: 1935 }, isPending: false }),
}));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined, isPending: false }) }));

import { StapResultaat } from "@/components/subsidiecheck/StapResultaat";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "7811EP",
  huisnummer: "34",
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

const regelingen: SubsidieRegeling[] = [
  {
    id: "isde",
    titel: "ISDE-subsidie Rijksoverheid",
    niveau: "rijk",
    type: "subsidie",
    aanbieder: "Rijksoverheid",
    omschrijving: "Subsidie op isolatie, warmtepompen en meer.",
    bedragIndicatie: "tot ± 30% van de kosten",
    bronUrl: "https://www.rvo.nl",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
  },
];

// Het tekstvak van het vraagblok. Op zijn id, want "je vraag" komt vaker voor
// op het resultaat (onder meer in de mobiele actiebalk).
const vraagVeld = () => document.getElementById("sc-vraag-tekst") as HTMLTextAreaElement;

describe("label aanvragen zonder de pagina te verlaten", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(subsidieProvider.check).mockReset();
    vi.mocked(subsidieProvider.check).mockResolvedValue(regelingen);
  });

  it("vult de aanvraag in het vraagblok in plaats van door te linken naar /contact", async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <StapResultaat input={input} adres={adres} verbergMail alGezocht />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const knop = await screen.findByRole("button", { name: /Label aanvragen/i });
    // Geen link meer: een <a href="/contact"> zou hier een role "link" geven.
    expect(screen.queryByRole("link", { name: /Label aanvragen/i })).toBeNull();

    expect(vraagVeld()).toHaveValue("");
    fireEvent.click(knop);

    expect(vraagVeld()).toHaveValue(
      "Ik wil graag een energielabel laten aanvragen voor mijn woning. Kunnen jullie dat voor mij regelen?",
    );
  });
});
