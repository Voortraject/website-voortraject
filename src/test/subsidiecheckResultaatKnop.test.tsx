import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Het resultaatscherm in de huisstijl van oktober 2026 (variant A): één oker
// knop die met één klik het verzoek indient, tellers in plaats van de
// verhoudingsbalk, en in het Nij Begun-gebied een isolatieplan-tegel.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));
vi.mock("@/hooks/useWoningInfo", () => ({
  useWoningInfo: () => ({ data: { energielabel: null }, isPending: false }),
}));
vi.mock("@/hooks/usePandContour", () => ({
  usePandContour: () => ({ data: { pandId: "0014100000000001", bouwjaar: 1914 }, isPending: false }),
}));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined, isPending: false }) }));
vi.mock("@/components/subsidiecheck/uitzoekAanvraag", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/subsidiecheck/uitzoekAanvraag")>()),
  vraagUitzoekenAan: vi.fn(async () => "verstuurd"),
}));

import { StapResultaat } from "@/components/subsidiecheck/StapResultaat";
import { vraagUitzoekenAan } from "@/components/subsidiecheck/uitzoekAanvraag";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

const regeling = (id: string, type: "subsidie" | "lening", niveau: "rijk" | "gemeente"): SubsidieRegeling => ({
  id,
  titel: `Regeling ${id}`,
  niveau,
  type,
  aanbieder: "Rijksoverheid",
  omschrijving: "Uitleg over deze regeling. Met een tweede zin.",
  bedragIndicatie: type === "lening" ? "tot € 28.000" : "tot 100% van de kosten",
  bronUrl: "https://www.rvo.nl",
  maatregelen: ["isolatie"],
  doelgroepen: ["woningeigenaar"],
});
const regelingen = [
  regeling("a", "subsidie", "rijk"),
  regeling("b", "subsidie", "gemeente"),
  regeling("c", "lening", "rijk"),
];

const groningen: { input: SubsidieCheckInput; adres: PdokAdres } = {
  input: { postcode: "9722AB", huisnummer: "12", gemeente: "Groningen", provincie: "Groningen", bewonertype: "woningeigenaar", maatregelen: ["isolatie"] },
  adres: { straatnaam: "Verlengde Hereweg", woonplaatsnaam: "Groningen", gemeentenaam: "Groningen", provincienaam: "Groningen" },
};
const emmen: { input: SubsidieCheckInput; adres: PdokAdres } = {
  input: { postcode: "7811EP", huisnummer: "34", gemeente: "Emmen", provincie: "Drenthe", bewonertype: "woningeigenaar", maatregelen: ["isolatie"] },
  adres: { straatnaam: "Hoofdstraat", woonplaatsnaam: "Emmen", gemeentenaam: "Emmen", provincienaam: "Drenthe" },
};

const toon = (situatie: typeof groningen, extra: Record<string, unknown> = {}) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <StapResultaat input={situatie.input} adres={situatie.adres} {...extra} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

const hoofdtegel = async () => within(await screen.findByRole("region", { name: /jouw subsidieoverzicht/i }));

describe("resultaatscherm in de huisstijl", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(subsidieProvider.check).mockReset();
    vi.mocked(subsidieProvider.check).mockResolvedValue(regelingen);
    vi.mocked(vraagUitzoekenAan).mockClear();
    vi.mocked(vraagUitzoekenAan).mockResolvedValue("verstuurd");
  });

  it("heeft in de hoofdtegel één oker knop met de geruststelling eronder", async () => {
    toon(groningen);
    const tegel = await hoofdtegel();
    expect(tegel.getByRole("button", { name: "Laat gratis uitzoeken wat ik krijg" })).toBeInTheDocument();
    expect(
      tegel.getByText(
        "Dit overzicht is een indicatie. We zoeken voor je uit wat er voor jouw huis echt in zit.",
      ),
    ).toBeInTheDocument();
    expect(tegel.queryByText(/nergens aan vast/i)).toBeNull();
    expect(tegel.getByText("3")).toBeInTheDocument();
  });

  it("één klik dient het verzoek in en toont dat het binnen is, met de vraag wat het lastigst is", async () => {
    toon(groningen);
    const tegel = await hoofdtegel();
    fireEvent.click(tegel.getByRole("button", { name: "Laat gratis uitzoeken wat ik krijg" }));

    expect(await tegel.findByText("Je aanvraag is binnen")).toBeInTheDocument();
    expect(
      tegel.getByText("We nemen contact met je op en zoeken uit wat er voor jouw huis echt in zit."),
    ).toBeInTheDocument();
    expect(tegel.getByText("Wat vind je het lastigst?")).toBeInTheDocument();
    expect(tegel.getAllByRole("checkbox")).toHaveLength(4);
    expect(vraagUitzoekenAan).toHaveBeenCalledTimes(1);
    expect(tegel.queryByRole("button", { name: "Laat gratis uitzoeken wat ik krijg" })).toBeNull();
  });

  it("de hoofdtegel herhaalt het adres niet: dat staat bij de luchtfoto", async () => {
    toon(groningen);
    const tegel = await hoofdtegel();
    expect(tegel.queryByText(/Verlengde Hereweg/)).toBeNull();
    expect(screen.getByRole("region", { name: "Jouw woning" })).toHaveTextContent("Verlengde Hereweg 12");
  });

  it("toont een eerlijke melding als het verzoek niet aankomt", async () => {
    vi.mocked(vraagUitzoekenAan).mockRejectedValueOnce(new Error("stuk"));
    toon(groningen);
    const tegel = await hoofdtegel();
    fireEvent.click(tegel.getByRole("button", { name: "Laat gratis uitzoeken wat ik krijg" }));
    expect(await tegel.findByRole("alert")).toHaveTextContent(/050 211 26 89|probeer het/i);
    expect(tegel.queryByText("Je aanvraag is binnen")).toBeNull();
  });

  it("zonder bekende gegevens springt hij naar het vraagblok in plaats van iets te beloven", async () => {
    vi.mocked(vraagUitzoekenAan).mockResolvedValueOnce("geen-contact");
    toon(groningen);
    const tegel = await hoofdtegel();
    fireEvent.click(tegel.getByRole("button", { name: "Laat gratis uitzoeken wat ik krijg" }));
    const veld = document.getElementById("sc-vraag-tekst") as HTMLTextAreaElement;
    await vi.waitFor(() => expect(veld.value).toMatch(/uitzoeken/i));
    expect(tegel.queryByText("Je aanvraag is binnen")).toBeNull();
  });

  it("telefoon: subsidies en leningen als mini-rij in de hoofdtegel, zonder verhoudingsbalk", async () => {
    toon(groningen);
    const tegel = await hoofdtegel();
    expect(tegel.getByRole("group", { name: "2 subsidies" })).toBeInTheDocument();
    expect(tegel.getByRole("group", { name: "1 lening" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /subsidies en .* leningen/i })).toBeNull();
  });

  it("telefoon: de eerste regeling komt vóór de woning, en de kaart toont alleen de eerste zin", async () => {
    toon(groningen);
    const eersteKaart = await screen.findByText("Regeling a");
    const woning = screen.getByRole("region", { name: "Jouw woning" });
    // DOCUMENT_POSITION_FOLLOWING: de woning staat ná de eerste kaart.
    expect(eersteKaart.compareDocumentPosition(woning) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText("Uitleg over deze regeling.").length).toBe(3);
    expect(screen.queryByText(/Met een tweede zin/)).toBeNull();
  });

  it("breed scherm: tellers als tegels naast het isolatieplan, woning bovenaan", async () => {
    const oud = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...oud(query),
      matches: query.includes("min-width: 1024px") || query.includes("prefers-reduced-motion"),
    })) as typeof window.matchMedia;
    try {
      toon(groningen);
      const subsidies = await screen.findByRole("group", { name: "Subsidies" });
      expect(within(subsidies).getByText("2")).toBeInTheDocument();
      expect(within(screen.getByRole("group", { name: "Leningen" })).getByText("1")).toBeInTheDocument();
      const woning = screen.getByRole("region", { name: "Jouw woning" });
      expect(woning.compareDocumentPosition(screen.getByText("Regeling a")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    } finally {
      window.matchMedia = oud;
    }
  });

  it("in het Nij Begun-gebied: een tegel om een isolatieplan aan te vragen", async () => {
    toon(groningen);
    fireEvent.click(await screen.findByRole("button", { name: /Ik wil een isolatieplan aanvragen/i }));
    expect((document.getElementById("sc-vraag-tekst") as HTMLTextAreaElement).value).toBe(
      "Ik wil graag een isolatieplan aanvragen voor mijn woning. Kunnen jullie dat voor mij regelen?",
    );
    // Het label staat in dezelfde tegel.
    expect(screen.getByRole("button", { name: /Label aanvragen/i })).toBeInTheDocument();
  });

  it("'Label aanvragen' heeft dezelfde vorm als 'Vraag het aan': een tekstlink met pijl, geen knop-pil", async () => {
    for (const situatie of [groningen, emmen]) {
      const { unmount } = toon(situatie);
      const label = await screen.findByRole("button", { name: /Label aanvragen/i });
      expect(label.className).not.toMatch(/rs-knop/);
      expect(label.querySelector("svg")).not.toBeNull();
      unmount();
    }
  });

  it("buiten het gebied: geen isolatieplan, wel de energielabel-tegel", async () => {
    toon(emmen);
    expect(await screen.findByRole("button", { name: /Label aanvragen/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /isolatieplan/i })).toBeNull();
  });

  it("toont van een regeling de omschrijving en de uitklap met voorwaarden", async () => {
    toon(groningen);
    expect(await screen.findByText("Regeling a")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /bekijk voorwaarden/i }).length).toBe(3);
  });
});
