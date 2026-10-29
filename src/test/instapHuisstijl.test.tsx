import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// De instap van de subsidietool in de huisstijl van oktober 2026 (prototype:
// claude.ai/artifact/NVEtD8X7M8ESajMGEZ1X94, akkoord gebruiker 2026-10-21).
// Geen test op de opmaak zelf, wel op de afspraken over tekst en gedrag die bij
// een volgende redactieronde ongemerkt kunnen wegvallen.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));
vi.mock("@/hooks/useWoningInfo", () => ({ useWoningInfo: () => ({ data: undefined, isPending: false }) }));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined, isPending: false }) }));
vi.mock("@/hooks/useGoogleReviews", () => ({
  useGoogleReviews: () => ({ stats: { rating: 4.9, user_rating_count: 33 } }),
}));

import { StapAdres } from "@/components/subsidiecheck/StapAdres";
import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { TOESTEMMING_TEKST } from "@/components/subsidiecheck/toestemming";
import { ZoekKaart } from "@/components/subsidiecheck/Zoeksequentie";
import { GEMIDDELDE_REGELINGEN_ZIN } from "@/config/cijfers";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

const toon = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

const input: SubsidieCheckInput = {
  postcode: "9722AB",
  huisnummer: "12",
  gemeente: "Groningen",
  provincie: "Groningen",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};
const adres: PdokAdres = {
  straatnaam: "Verlengde Hereweg",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};
const regeling = (i: number): SubsidieRegeling => ({
  id: `r${i}`,
  titel: `Regeling ${i}`,
  niveau: "rijk",
  type: "subsidie",
  aanbieder: "Rijk",
  omschrijving: "Omschrijving.",
  bronUrl: "https://example.nl",
  maatregelen: ["isolatie"],
  doelgroepen: ["woningeigenaar"],
});

const stapAdres = (overschrijf: Partial<React.ComponentProps<typeof StapAdres>> = {}) =>
  toon(
    <StapAdres
      initPostcode=""
      initHuisnummer=""
      initToevoeging=""
      initBewonertype={null}
      initMaatregelen={[]}
      bevestigdAdres={null}
      onStart={() => {}}
      onHandmatig={() => {}}
      onAdresWijzigen={() => {}}
      {...overschrijf}
    />,
  );

describe("het beginscherm", () => {
  it("zegt in twee korte zinnen wat de bezoeker doet en wat het oplevert", () => {
    stapAdres();
    expect(GEMIDDELDE_REGELINGEN_ZIN).toBe("Gemiddeld vinden we 9 regelingen per adres.");
    expect(screen.getByText(/^Vul je adres in\./)).toBeInTheDocument();
    expect(screen.getByText(GEMIDDELDE_REGELINGEN_ZIN)).toBeInTheDocument();
  });

  it("vat de keuzes samen in één korte regel", () => {
    stapAdres();
    expect(screen.getByText(/^Woningeigenaar, alle maatregelen\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Aanpassen/ })).toBeInTheDocument();
  });

  it("volgt de gekozen situatie en klapt dicht met Klaar", () => {
    stapAdres({ initBewonertype: "huurder" });
    expect(screen.getByText(/^Huurder, alle maatregelen\./)).toBeInTheDocument();
    // Afwijkend van de standaard: de keuzes staan meteen open.
    expect(screen.getByText("Ik ben…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Klaar" }));
    expect(screen.getByRole("button", { name: /Aanpassen/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("zet 'optioneel' in het toevoegingsveld zelf", () => {
    stapAdres();
    expect(screen.getByLabelText(/Toevoeging/)).toHaveAttribute("placeholder", "Optioneel");
  });

  it("toont de Google-score zonder aantal reviews", () => {
    stapAdres();
    expect(screen.getByText("4,9")).toBeInTheDocument();
    expect(screen.queryByText(/reviews/)).toBeNull();
  });
});

describe("het zoekscherm", () => {
  const kaart = (fase: number, klaar = false) =>
    render(<ZoekKaart adresRegel="Verlengde Hereweg 12, Groningen" gemeente="Groningen" provincie="Groningen" fase={fase} klaar={klaar} />);

  it("meldt pas iets als er een bron doorzocht is", () => {
    kaart(0);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("noemt per afgeronde bron de echte provincie en gemeente", () => {
    const { rerender } = kaart(1);
    expect(screen.getByRole("status")).toHaveTextContent("Landelijke regelingen");
    rerender(<ZoekKaart adresRegel="x" gemeente="Groningen" provincie="Groningen" fase={2} klaar={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("Provincie Groningen");
    // De gemeente staat pas als afgerond als de bron echt geantwoord heeft.
    rerender(<ZoekKaart adresRegel="x" gemeente="Groningen" provincie="Groningen" fase={2} klaar />);
    expect(screen.getByRole("status")).toHaveTextContent("Gemeente Groningen");
  });
});

describe("de gegevenspagina", () => {
  beforeEach(() => vi.mocked(subsidieProvider.check).mockReset());

  it("noemt de telling in de woningtegel en herhaalt hem op de knop", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue(Array.from({ length: 11 }, (_, i) => regeling(i)));
    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(await screen.findByText("regelingen gevonden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bekijk mijn 11 regelingen" })).toBeInTheDocument();
    // Het zichtbare getal (dat optelt) eindigt op dezelfde telling als de knop,
    // naast de tekst voor schermlezers.
    await waitFor(() => expect(screen.getAllByText("11")).toHaveLength(2));
    expect(screen.queryByText(/Nog geen geregistreerd energielabel/)).toBeNull();
  });

  it("valt terug op de gewone knoptekst zonder telling", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([]);
    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(await screen.findByRole("button", { name: "Bekijk mijn subsidieoverzicht" })).toBeInTheDocument();
  });

  it("toont de Google-score onder de knop, zonder Tim en zonder aantal reviews", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([regeling(1)]);
    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    const knop = await screen.findByRole("button", { name: /^Bekijk mijn/ });
    const score = screen.getByRole("img", { name: "4,9 van 5 op Google" });
    expect(knop.compareDocumentPosition(score) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(/denkt graag met je mee/)).toBeNull();
    expect(screen.queryByText(/reviews/)).toBeNull();
  });

  it("vraagt 'Wat mogen we ook voor je regelen?' met drie tegels van één woord", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([regeling(1)]);
    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(await screen.findByText("Wat mogen we ook voor je regelen?")).toBeInTheDocument();
    const tegels = screen.getAllByRole("checkbox").map((t) => t.textContent);
    expect(tegels).toEqual(["Papierwerk", "Vakbedrijf", "Stappenplan"]);
    // "Subsidies uitzoeken" zegt niets wat de check zelf niet al zegt.
    expect(screen.queryByText("Subsidies uitzoeken")).toBeNull();
  });

  it("zet onder de knop alleen de toestemmingstekst", async () => {
    vi.mocked(subsidieProvider.check).mockResolvedValue([regeling(1)]);
    toon(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);

    expect(TOESTEMMING_TEKST).toBe("We mailen of bellen je alleen over je verduurzaming.");
    expect(await screen.findByText(TOESTEMMING_TEKST)).toBeInTheDocument();
    expect(screen.queryByText(/Je gegevens blijven bij ons/)).toBeNull();
  });
});
