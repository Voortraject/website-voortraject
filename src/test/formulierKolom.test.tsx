import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// `leads_bewoners.formulier` vertelt n8n welk formulier de lead opleverde: het
// bepaalt de taaktitel én of de bevestigingsmail uitgaat. Er staat een CHECK op
// de kolom (alleen 'contactformulier', 'subsidietool' of NULL), dus een andere
// waarde laat de insert falen en kost de lead. Vandaar deze exacte strings.

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
import { valideerContact, verstuurSubsidiecheckLead } from "@/components/subsidiecheck/leadFormulier";
import Contact from "@/pages/Contact";

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

// De insert wordt hier rechtstreeks aangeroepen. Het formulier dat deze test
// eerder gebruikte ("mail mij dit overzicht") hoorde bij de flow zonder
// gegevens-poort en bestaat niet meer; wat getest wordt is de kolomwaarde.
const contact = () => {
  const uitkomst = valideerContact({
    voornaam: "Jan",
    tussenvoegsel: "",
    achternaam: "de Vries",
    email: "jan@example.nl",
    telefoon: "0612345678",
  });
  if ("fout" in uitkomst) throw new Error(uitkomst.fout);
  return uitkomst.waarden;
};

describe("formulier-kolom", () => {
  it("contactformulier bewoners → 'contactformulier'", async () => {
    render(<Contact />);
    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    await screen.findByText(/Bedankt!/);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.formulier).toBe("contactformulier");
  });

  it("subsidiecheck → 'subsidietool'", async () => {
    await verstuurSubsidiecheckLead({ waarden: contact(), input, adres, regelingen: [] });

    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij.formulier).toBe("subsidietool");
  });
});
