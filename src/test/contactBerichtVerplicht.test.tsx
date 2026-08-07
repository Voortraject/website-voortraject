import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Het berichtveld is verplicht: zonder bericht mag er geen lead ontstaan, want
// een lead zonder context kost de adviseur een extra belronde.

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

const vulNaamEnContact = () => {
  vul(screen.getByLabelText(/^Voornaam/), "Jan");
  vul(screen.getByLabelText(/^Achternaam/), "de Vries");
  vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
  vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
};

const verstuur = () => {
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
};

describe("contactformulier: bericht is verplicht", () => {
  it("weigert een lege inzending en toont een foutmelding", async () => {
    render(<Contact />);
    vulNaamEnContact();
    verstuur();

    expect(await screen.findByText("Vul je bericht in.")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("weigert een bericht van alleen spaties", async () => {
    render(<Contact />);
    vulNaamEnContact();
    vul(screen.getByLabelText(/^Bericht/), "   ");
    verstuur();

    expect(await screen.findByText("Vul je bericht in.")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("verstuurt wél zodra er een bericht staat", async () => {
    render(<Contact />);
    vulNaamEnContact();
    vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
    verstuur();

    await screen.findByText(/Bedankt!/);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.notities).toBe("Graag advies over isolatie.");
  });
});
