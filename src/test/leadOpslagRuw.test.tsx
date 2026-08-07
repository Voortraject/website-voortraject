import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Regressie: de lead-formulieren mogen de invoer NIET HTML-escapen voordat die
// naar `leads_bewoners` gaat. Het CRM toont die kolommen
// als platte tekst, dus escapen bij opslag maakte van een apostrof letterlijk
// `&#39;` op het scherm van de gebruiker. Escapen hoort bij het renderen.

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

// Alle vier de tekens die de escape-helper omzette.
const BERICHT = `Test 'apostrof' & ampersand "quote" <tag>`;
const ENTITEITEN = ["&#39;", "&amp;", "&quot;", "&lt;", "&gt;"];

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

const verstuur = async () => {
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
  await screen.findByText(/Bedankt!/);
};

const geenEntiteiten = (waarde: unknown) => {
  for (const e of ENTITEITEN) expect(String(waarde)).not.toContain(e);
};

describe("lead-opslag bewaart de invoer onbewerkt", () => {
  it("bewonerformulier: bericht, naam en plaatsnaam gaan rauw naar de database", async () => {
    render(<Contact />);
    // NAME_RE staat letters, spaties, apostrof en streepje toe.
    vul(screen.getByLabelText(/^Voornaam/), "Jan-Peter");
    vul(screen.getByLabelText(/^Achternaam/), "O'Brien");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Vragen of opmerkingen/), BERICHT);
    await verstuur();

    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.notities).toBe(BERICHT);
    expect(rij.achternaam).toBe("O'Brien");
    for (const waarde of Object.values(rij)) geenEntiteiten(waarde);
  });

  it("bewonerformulier: belvoorkeur plus bericht blijft onbewerkt", async () => {
    render(<Contact />);
    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Voorkeur voor contact/), "Telefonisch: Ochtend");
    vul(screen.getByLabelText(/^Vragen of opmerkingen/), BERICHT);
    await verstuur();

    const [, rij] = insertMock.mock.calls[0];
    expect(rij.notities).toBe(`Voorkeur voor contact: Telefonisch: Ochtend\n${BERICHT}`);
  });

});
