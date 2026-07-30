import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// De aangevinkte interesses horen in de eigen kolom `subsidiecheck_interesses`
// te landen: platte tekst, komma-gescheiden, in de volgorde van de chips op de
// site. `notities` en `gewenste_maatregelen` blijven daarbij leeg.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

import { MailOverzicht } from "@/components/subsidiecheck/MailOverzicht";
import { bouwSubsidiecheckInteresses } from "@/components/subsidiecheck/leadFormulier";

const adres: PdokAdres = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

// Bewust in een andere volgorde aangeklikt dan de chips op de site staan.
const input: SubsidieCheckInput = {
  postcode: "9711AA",
  huisnummer: "1",
  bewonertype: "woningeigenaar",
  maatregelen: ["thuisbatterij", "isolatie", "warmtepomp"],
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

describe("bouwSubsidiecheckInteresses", () => {
  it("gebruikt de site-volgorde, niet de klikvolgorde", () => {
    expect(bouwSubsidiecheckInteresses(["thuisbatterij", "isolatie", "warmtepomp"])).toBe(
      "Isolatie & glas, Warmtepomp, Thuisbatterij",
    );
  });

  it("houdt de ampersand rauw (escapen hoort bij het renderen)", () => {
    expect(bouwSubsidiecheckInteresses(["isolatie"])).toBe("Isolatie & glas");
    expect(bouwSubsidiecheckInteresses(["isolatie"])).not.toContain("&amp;");
  });

  it("geeft een lege string bij geen selectie", () => {
    expect(bouwSubsidiecheckInteresses([])).toBe("");
  });
});

describe("subsidiecheck-lead", () => {
  it("schrijft de interesses naar de eigen kolom en laat notities leeg", async () => {
    metQuery(<MailOverzicht input={input} adres={adres} regelingen={[]} />);
    vul(screen.getByPlaceholderText(/Je voornaam/), "Jan");
    vul(screen.getByPlaceholderText(/Je achternaam/), "de Vries");
    vul(screen.getByPlaceholderText(/Je e-mailadres/), "jan@example.nl");
    vul(screen.getByPlaceholderText(/Je telefoonnummer/), "0612345678");
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /Mail mij dit overzicht/ }));

    await screen.findByText(/Dankjewel!/);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.subsidiecheck_interesses).toBe("Isolatie & glas, Warmtepomp, Thuisbatterij");
    expect(rij.notities).toBeNull();
    expect(rij.gewenste_maatregelen).toBeUndefined();
  });
});
