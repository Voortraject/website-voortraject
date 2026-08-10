import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PandInfo } from "@/lib/bagPand";
import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";
import type { WoningInfo } from "@/lib/woninginfo";

// Energielabel (EP-Online) en bouwjaar (BAG) gaan als verrijking mee naar het
// CRM, zodat de adviseur ze niet hoeft op te zoeken. Dat ging stil mis: de
// waarden werden gelezen op het moment van verzenden, en wie sneller invulde dan
// de bronnen laadden, leverde een lead zonder beide velden op. Geen foutmelding,
// geen spoor. In de CRM-data van augustus 2026 gebeurde dat bij 1 van de 16
// leads (9744BJ 83, dat aantoonbaar wél een label B en bouwjaar 1958 heeft).
//
// Wat hier bewaakt wordt:
//   1. de velden gaan mee, óók als de bronnen pas ná het indrukken binnenkomen;
//   2. een bron die blijft hangen kost nooit de lead zelf.

const { insertMock, woningMock, pandMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  woningMock: vi.fn(),
  pandMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/woninginfo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/woninginfo")>()),
  haalWoningInfo: () => woningMock(),
}));

vi.mock("@/lib/bagPand", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/bagPand")>()),
  haalPandContour: () => pandMock(),
}));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { subsidieProvider } from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "9744BJ",
  huisnummer: "83",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

// Mét coördinaat, anders slaat de pandvraag (en dus het bouwjaar) over.
const adres: PdokAdres = {
  straatnaam: "Reddingiusweg",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
  centroideRd: { x: 229289.433, y: 581030.245 },
};

const LABEL: WoningInfo = { energielabel: { klasse: "B" }, gebouw: null };
const PAND: PandInfo = { rings: [], pandId: "0014100010933940", bouwjaar: 1958 };

const metQuery = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

// De formulieren weigeren een inzending binnen 2 seconden na laden (anti-bot).
let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  // Geen VITE_SUBSIDIECHECK_MAIL_URL in de tests, dus de poort valt terug op de
  // directe insert. Die rij is precies wat het CRM te zien krijgt.
  vi.mocked(subsidieProvider.check).mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const vulInEnVerstuur = () => {
  fireEvent.click(screen.getByRole("checkbox", { name: /Subsidies uitzoeken/ }));
  fireEvent.change(screen.getByPlaceholderText(/Je voornaam/), { target: { value: "Jan" } });
  fireEvent.change(screen.getByPlaceholderText(/Je achternaam/), { target: { value: "de Vries" } });
  fireEvent.change(screen.getByPlaceholderText(/Je e-mailadres/), { target: { value: "jan@example.nl" } });
  fireEvent.change(screen.getByPlaceholderText(/Je telefoonnummer/), { target: { value: "0612345678" } });
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Bekijk mijn subsidieoverzicht/ }));
};

describe("verrijking van de subsidietool-lead", () => {
  it("stuurt energielabel en bouwjaar mee, ook als de bronnen pas na het verzenden binnen zijn", async () => {
    // De twee bronnen blijven hangen tot we ze hier zelf loslaten. Zo is het
    // moment van verzenden gegarandeerd vóór het moment dat de data er is:
    // precies de situatie waarin de velden eerst verdwenen.
    let losWoning!: (w: WoningInfo) => void;
    let losPand!: (p: PandInfo) => void;
    woningMock.mockReturnValue(new Promise<WoningInfo>((klaar) => (losWoning = klaar)));
    pandMock.mockReturnValue(new Promise<PandInfo>((klaar) => (losPand = klaar)));

    metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={vi.fn()} />);
    await screen.findByPlaceholderText(/Je voornaam/, {}, { timeout: 5_000 });
    vulInEnVerstuur();

    // Pas nu komen de bronnen binnen. De poort moet er alsnog op wachten.
    losWoning(LABEL);
    losPand(PAND);

    await waitFor(() => expect(insertMock).toHaveBeenCalled(), { timeout: 5_000 });
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.energielabel).toBe("B");
    expect(rij.bouwjaar).toBe(1958);
  });

  it("verliest de lead niet als een bron blijft hangen", async () => {
    // Nooit loslaten: na de wachtgrens (2,5s) gaat het verzenden door met wat er
    // dan is. Een leeg veld is vervelend, een verloren lead is erger. Deze test
    // duurt daarom bewust een paar seconden.
    woningMock.mockReturnValue(new Promise<WoningInfo>(() => {}));
    pandMock.mockReturnValue(new Promise<PandInfo>(() => {}));

    const onOntgrendeld = vi.fn();
    metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={onOntgrendeld} />);
    await screen.findByPlaceholderText(/Je voornaam/, {}, { timeout: 5_000 });
    vulInEnVerstuur();

    await waitFor(() => expect(insertMock).toHaveBeenCalled(), { timeout: 10_000 });
    const [, rij] = insertMock.mock.calls[0];
    expect(rij.email).toBe("jan@example.nl");
    expect(rij.energielabel).toBeUndefined();
    expect(rij.bouwjaar).toBeUndefined();
    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled(), { timeout: 5_000 });
  }, 20_000);
});
