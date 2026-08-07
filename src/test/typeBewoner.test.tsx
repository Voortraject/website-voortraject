import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { Bewonertype, SubsidieCheckInput } from "@/lib/subsidies";

// Het bewonertype uit stap 1 hoort in `leads_bewoners.subsidiecheck_type_bewoner`
// te landen, in de codes van `Bewonertype` (dezelfde waarden als `?type=` in de
// deel-link). Er staat een CHECK op de kolom (alleen NULL of 'woningeigenaar' |
// 'huurder' | 'vve' | 'verhuurder'), dus een label of andere spelling laat de
// insert falen en kost de lead. Vandaar deze exacte strings.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

import { MailOverzicht } from "@/components/subsidiecheck/MailOverzicht";

const adres: PdokAdres = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

const maakInput = (bewonertype: Bewonertype): SubsidieCheckInput => ({
  postcode: "9711AA",
  huisnummer: "1",
  bewonertype,
  maatregelen: ["isolatie"],
});

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

const verstuur = async (bewonertype: Bewonertype) => {
  metQuery(<MailOverzicht input={maakInput(bewonertype)} adres={adres} regelingen={[]} />);
  vul(screen.getByPlaceholderText(/Je voornaam/), "Jan");
  vul(screen.getByPlaceholderText(/Je achternaam/), "de Vries");
  vul(screen.getByPlaceholderText(/Je e-mailadres/), "jan@example.nl");
  vul(screen.getByPlaceholderText(/Je telefoonnummer/), "0612345678");
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Mail mij dit overzicht/ }));
  await screen.findByText(/Dankjewel!/);
  return insertMock.mock.calls[0];
};

describe("subsidiecheck_type_bewoner", () => {
  it.each<Bewonertype>(["woningeigenaar", "huurder", "vve", "verhuurder"])(
    "schrijft de code '%s' onvertaald weg",
    async (bewonertype) => {
      const [tabel, rij] = await verstuur(bewonertype);
      expect(tabel).toBe("leads_bewoners");
      expect(rij.subsidiecheck_type_bewoner).toBe(bewonertype);
    },
  );
});
