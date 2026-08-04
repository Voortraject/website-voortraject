import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// Wat er moet gebeuren als de Energiesubsidiewijzer hapert:
//   1. de provider slikt de fout NIET in (geen stille voorbeelddata),
//   2. de gegevens-poort verliest de lead niet, maar schrijft 'm direct weg
//      (zonder mail) en laat de bezoeker door naar de foutstaat van het
//      resultaat.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { subsidieProvider } from "@/lib/subsidies";
import { energiesubsidiewijzerProvider } from "@/lib/subsidies/energiesubsidiewijzerProvider";

const input: SubsidieCheckInput = {
  postcode: "9711AA",
  huisnummer: "1",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

const adres: PdokAdres = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

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
});

afterEach(() => {
  vi.restoreAllMocks();
});

const vul = (veld: HTMLElement, waarde: string) => {
  fireEvent.change(veld, { target: { value: waarde } });
};

describe("energiesubsidiewijzerProvider", () => {
  it("laat een bronfout doorgaan in plaats van stil voorbeelddata te tonen", async () => {
    // Geen VITE_SUBSIDIECHECK_URL in de tests → het proxypad; die fetch faalt hier.
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("bron plat"));

    await expect(energiesubsidiewijzerProvider.check(input)).rejects.toThrow();
  });
});

describe("gegevens-poort bij een bronfout", () => {
  const vulIn = () => {
    vul(screen.getByPlaceholderText(/Je voornaam/), "Jan");
    vul(screen.getByPlaceholderText(/Je achternaam/), "de Vries");
    vul(screen.getByPlaceholderText(/Je e-mailadres/), "jan@example.nl");
    vul(screen.getByPlaceholderText(/Je telefoonnummer/), "0612345678");
  };

  it("schrijft de lead alsnog weg en ontgrendelt het resultaat", async () => {
    vi.mocked(subsidieProvider.check).mockRejectedValue(new Error("bron plat"));
    const onOntgrendeld = vi.fn();
    metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={onOntgrendeld} />);
    vulIn();
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /Mail mij dit overzicht/ }));

    // De poort retry't de bron één keer (met backoff) voordat hij opgeeft.
    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled(), { timeout: 5_000 });
    expect(insertMock).toHaveBeenCalledTimes(1);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij).toMatchObject({ email: "jan@example.nl", bron: "Voortraject" });
    expect(rij.subsidiecheck_interesses).toBe("Isolatie & glas");
  });
});
