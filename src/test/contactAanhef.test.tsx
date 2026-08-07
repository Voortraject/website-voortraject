import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Het contactformulier schrijft de aanhef naar `leads_bewoners.aanhef` (CRM).
// Die kolom is vrije tekst, maar het CRM zelf biedt exact drie waarden aan; een
// afwijkende string laat de aanhef in het CRM en in de mailsjablonen rammelen.
// Leeg moet NULL worden, niet een lege string.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Contact from "@/pages/Contact";

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

const vulVerplichteVelden = () => {
  vul(screen.getByLabelText(/^Voornaam/), "Jan");
  vul(screen.getByLabelText(/^Achternaam/), "de Vries");
  vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
  vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
};

const verstuur = async () => {
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
  await screen.findByText(/Bedankt!/);
};

describe("contactformulier aanhef", () => {
  it("biedt exact de drie CRM-waarden aan", () => {
    render(<Contact />);
    const select = screen.getByLabelText(/^Aanhef/) as HTMLSelectElement;
    const waarden = Array.from(select.options).map((o) => o.value);
    expect(waarden).toEqual(["", "Dhr.", "Mevr.", "Fam."]);
  });

  it("stuurt de gekozen aanhef mee naar leads_bewoners", async () => {
    render(<Contact />);
    vul(screen.getByLabelText(/^Aanhef/), "Mevr.");
    vulVerplichteVelden();
    await verstuur();

    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.aanhef).toBe("Mevr.");
  });

  it("stuurt NULL als er geen aanhef is gekozen", async () => {
    render(<Contact />);
    vulVerplichteVelden();
    await verstuur();

    const [, rij] = insertMock.mock.calls[0];
    expect(rij.aanhef).toBeNull();
  });
});
