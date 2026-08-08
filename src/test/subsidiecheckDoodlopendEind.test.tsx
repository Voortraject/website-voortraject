import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Twee schermen waar de bezoeker vroeger vastliep.
//
//  1. Nul regelingen na eigen filtering. Wie alleen "Thuisbatterij" aanvinkt
//     krijgt op élk adres nul terug, terwijl er met alle maatregelen twaalf zijn
//     (geverifieerd tegen de bron voor 7811AB). Het scherm moet dat getal noemen
//     en de verbreding in één klik aanbieden, met behoud van adres en situatie.
//  2. "Label aanvragen" in de samenvatting. Dat was een link naar /contact met
//     een leeg formulier; nu moet de aanvraag beneden ingevuld klaarstaan.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

import { DirectContact } from "@/components/subsidiecheck/DirectContact";
import { GeenRegelingen } from "@/components/subsidiecheck/GeenRegelingen";
import type { PdokAdres } from "@/lib/pdok";
import { ALLE_MAATREGELEN, subsidieProvider, type SubsidieCheckInput } from "@/lib/subsidies";

const adres: PdokAdres = {
  straatnaam: "Hoofdstraat",
  woonplaatsnaam: "Emmen",
  gemeentenaam: "Emmen",
  provincienaam: "Drenthe",
};

const gefilterdeInput: SubsidieCheckInput = {
  postcode: "7811AB",
  huisnummer: "1",
  gemeente: "Emmen",
  provincie: "Drenthe",
  bewonertype: "woningeigenaar",
  maatregelen: ["thuisbatterij"],
};

// Toont het pad + de querystring, zodat we kunnen zien dat het verbreden de
// m-parameter weghaalt zónder adres of situatie kwijt te raken.
const HuidigeUrl = () => {
  const { pathname, search } = useLocation();
  return <span data-testid="url">{`${pathname}${search}`}</span>;
};

const toon = (ui: ReactElement, url: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route
            path="/subsidiecheck"
            element={
              <>
                {ui}
                <HuidigeUrl />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("nul regelingen na eigen filtering", () => {
  beforeEach(() => {
    vi.mocked(subsidieProvider.check).mockReset();
  });

  it("noemt hoeveel er wél zijn en verbreedt met één klik, met behoud van adres en situatie", async () => {
    // De verbrede zoekopdracht (alle acht maatregelen) levert er twaalf.
    vi.mocked(subsidieProvider.check).mockImplementation(async (invoer) =>
      invoer.maatregelen.length === ALLE_MAATREGELEN.length
        ? (Array.from({ length: 12 }, (_, i) => ({ id: `r${i}` })) as never)
        : [],
    );

    toon(<GeenRegelingen input={gefilterdeInput} />, "/subsidiecheck?pc=7811AB&hn=1&type=woningeigenaar&m=thuisbatterij");

    expect(await screen.findByText(/Thuisbatterij vonden we niets/i)).toBeInTheDocument();
    const knop = await screen.findByRole("button", { name: /Toon alle 12 regelingen/i });

    fireEvent.click(knop);

    await waitFor(() => {
      const url = screen.getByTestId("url").textContent ?? "";
      expect(url).not.toContain("m=");
      expect(url).toContain("pc=7811AB");
      expect(url).toContain("type=woningeigenaar");
    });
  });

  it("belooft geen verbreding als er ook breder niets is", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([]);

    toon(<GeenRegelingen input={gefilterdeInput} />, "/subsidiecheck?pc=7811AB&hn=1&m=thuisbatterij");

    expect(await screen.findByText(/Ook voor de andere maatregelen vonden we niets/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Toon alle/i })).toBeNull();
  });

  it("zoekt niet nog eens als de bezoeker helemaal niet gefilterd had", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([]);

    toon(
      <GeenRegelingen input={{ ...gefilterdeInput, maatregelen: [...ALLE_MAATREGELEN] }} />,
      "/subsidiecheck?pc=7811AB&hn=1",
    );

    expect(await screen.findByText(/Voor deze combinatie vonden we geen regelingen/i)).toBeInTheDocument();
    expect(subsidieProvider.check).not.toHaveBeenCalled();
  });
});

describe("vooringevulde aanvraag in het vraagblok", () => {
  const metVoorstel = (voorstel?: { tekst: string; n: number }) =>
    render(
      <DirectContact input={gefilterdeInput} adres={adres} voorstel={voorstel} />,
    );

  it("zet de labelaanvraag klaar in het lege vraagveld", () => {
    const { rerender } = metVoorstel();
    expect(screen.getByLabelText(/je vraag/i)).toHaveValue("");

    rerender(
      <DirectContact
        input={gefilterdeInput}
        adres={adres}
        voorstel={{ tekst: "Ik wil graag een energielabel laten aanvragen", n: 1 }}
      />,
    );

    expect(screen.getByLabelText(/je vraag/i)).toHaveValue("Ik wil graag een energielabel laten aanvragen");
  });

  it("overschrijft niet wat de bezoeker zelf al had getypt", () => {
    const { rerender } = metVoorstel();
    const veld = screen.getByLabelText(/je vraag/i);
    fireEvent.change(veld, { target: { value: "Kan ik deze regelingen combineren?" } });

    rerender(
      <DirectContact
        input={gefilterdeInput}
        adres={adres}
        voorstel={{ tekst: "Ik wil graag een energielabel laten aanvragen", n: 1 }}
      />,
    );

    expect(veld).toHaveValue("Kan ik deze regelingen combineren?");
  });
});
