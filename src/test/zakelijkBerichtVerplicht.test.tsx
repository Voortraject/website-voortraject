import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Zelfde eis als bij het bewonersformulier (zie contactBerichtVerplicht.test.tsx):
// zonder bericht geen lead. Bij een zakelijke lead weegt dat extra, want
// "wij willen kennismaken" zonder context zegt niets over waar we kunnen helpen.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";

// Het formulier weigert een inzending binnen 2 seconden na laden (anti-bot).
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

const vulBedrijfEnContact = () => {
  vul(screen.getByLabelText(/^Bedrijfsnaam/), "Bouwbedrijf Test");
  vul(screen.getByLabelText(/Voornaam contactpersoon/), "Jan");
  vul(screen.getByLabelText(/Achternaam contactpersoon/), "de Vries");
  vul(screen.getByLabelText(/^E-mailadres/), "jan@bouwbedrijf.nl");
  vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
};

const verstuur = () => {
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
};

describe("zakelijk formulier: bericht is verplicht", () => {
  it("weigert een lege inzending en toont een foutmelding", async () => {
    render(<ZakelijkContactFormulier />);
    vulBedrijfEnContact();
    verstuur();

    expect(await screen.findByText("Vul je bericht in.")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("weigert een bericht van alleen spaties", async () => {
    render(<ZakelijkContactFormulier />);
    vulBedrijfEnContact();
    vul(screen.getByLabelText(/^Bericht/), "   ");
    verstuur();

    expect(await screen.findByText("Vul je bericht in.")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("verstuurt wél zodra er een bericht staat", async () => {
    render(<ZakelijkContactFormulier />);
    vulBedrijfEnContact();
    vul(screen.getByLabelText(/^Bericht/), "Wij lopen vast op de offerte-opvolging.");
    verstuur();

    await screen.findByText(/Bedankt!/);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_uitvoerders");
    expect(rij.notities).toBe("Wij lopen vast op de offerte-opvolging.");
  });
});
