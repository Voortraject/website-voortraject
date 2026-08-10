import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Bewijst dat de bezoeker de rem-melding ook echt te zien krijgt, niet alleen dat
// de helper hem kan samenstellen (dat doet src/test/rateLimitMelding.test.ts).
//
// De rem zit in het CRM: 5 inzendingen per uur per IP-adres. Een échte bezoeker
// die net pech heeft, kreeg hiervoor "Er ging iets mis... probeer het later nog
// eens" en dacht dus aan een storing van een minuut.

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

import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";
import { RATE_LIMIT_MELDING, TELEFOON_WEERGAVE } from "@/lib/formulierFout";
import Contact from "@/pages/Contact";

// Zoals supabase-js een fout van de CRM-trigger teruggeeft.
const PT429 = {
  code: "PT429",
  message: "Te veel aanvragen vanaf dit adres. Probeer het over een uur opnieuw.",
  details: null,
  hint: null,
};

let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  insertMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// De formulieren weigeren een inzending binnen 2 seconden na laden (anti-bot).
const wachtEvenAf = () => {
  nu += 5_000;
};

const vul = (veld: HTMLElement, waarde: string) => {
  fireEvent.change(veld, { target: { value: waarde } });
};

describe("volumerem in het formulier", () => {
  it("toont op het contactformulier de rem-melding met telefoonnummer", async () => {
    insertMock.mockResolvedValue({ error: PT429 });
    render(<Contact />);

    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    expect(await screen.findByText(RATE_LIMIT_MELDING)).toBeTruthy();
    expect(screen.getByText(RATE_LIMIT_MELDING).textContent).toContain(TELEFOON_WEERGAVE);
    // Geen bedankscherm: de lead is niet aangekomen en dat mag de bezoeker niet
    // denken. Dit is het "faalt stil"-scenario uit de opdracht.
    expect(screen.queryByText(/Bedankt!/)).toBeNull();
  });

  it("toont op het zakelijke formulier dezelfde melding", async () => {
    insertMock.mockResolvedValue({ error: PT429 });
    render(<ZakelijkContactFormulier />);

    vul(screen.getByLabelText(/^Bedrijfsnaam/), "Bouwbedrijf Test");
    vul(screen.getByLabelText(/Voornaam contactpersoon/), "Jan");
    vul(screen.getByLabelText(/Achternaam contactpersoon/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@bouwbedrijf.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Wij lopen vast op de offerte-opvolging.");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    expect(await screen.findByText(RATE_LIMIT_MELDING)).toBeTruthy();
    expect(screen.queryByText(/Bedankt!/)).toBeNull();
  });

  it("houdt bij een gewone storing de oude melding", async () => {
    // De tegenhanger: zonder deze test bewijst de bovenste alleen dat er ooit een
    // melding verschijnt, niet dat er onderscheid wordt gemaakt.
    insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    render(<Contact />);

    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    expect(await screen.findByText(/Er ging iets mis bij het versturen/)).toBeTruthy();
    expect(screen.queryByText(RATE_LIMIT_MELDING)).toBeNull();
  });
});
