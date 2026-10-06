import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// De herkomst uit `?via=` moet echt in `leads_bewoners.bron` landen, langs alle
// drie de schrijfroutes: het contactformulier, de directe insert van de
// subsidiecheck en de edge function.

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

import { schrijfSubsidiecheckLead } from "@/components/subsidiecheck/leadFormulier";
import { onthoudHerkomst } from "@/lib/herkomst";
import Contact from "@/pages/Contact";

const adres: PdokAdres = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

const input: SubsidieCheckInput = {
  postcode: "9711AA",
  huisnummer: "1",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

const waarden = {
  voornaam: "Jan",
  tussenvoegsel: "",
  achternaam: "de Vries",
  email: "jan@example.nl",
  telefoon: "0612345678",
};

let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

const vul = (label: RegExp, waarde: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: waarde } });

const verstuurContact = async () => {
  render(<Contact />);
  vul(/^Voornaam/, "Jan");
  vul(/^Achternaam/, "de Vries");
  vul(/^E-mailadres/, "jan@example.nl");
  vul(/^Telefoonnummer/, "0612345678");
  vul(/^Bericht/, "Graag advies over isolatie.");
  nu += 5_000;
  fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
  await screen.findByText(/Bedankt!/);
  return insertMock.mock.calls[0][1] as Record<string, unknown>;
};

describe("contactformulier", () => {
  it("schrijft 'Voortraject' zonder herkomst", async () => {
    expect((await verstuurContact()).bron).toBe("Voortraject");
  });

  it("schrijft de onthouden code als bron", async () => {
    onthoudHerkomst("?via=050energielabels");
    expect((await verstuurContact()).bron).toBe("050energielabels");
  });

  it("schrijft 'Voortraject' bij een onbekende via", async () => {
    onthoudHerkomst("?via=gratis-geld");
    expect((await verstuurContact()).bron).toBe("Voortraject");
  });
});

describe("subsidiecheck, directe insert (zonder edge function)", () => {
  it("schrijft de onthouden code als bron", async () => {
    onthoudHerkomst("?via=flyer");
    await schrijfSubsidiecheckLead({ waarden, input, adres });
    expect(insertMock.mock.calls[0][1].bron).toBe("flyer");
  });

  it("schrijft 'Voortraject' zonder herkomst", async () => {
    await schrijfSubsidiecheckLead({ waarden, input, adres });
    expect(insertMock.mock.calls[0][1].bron).toBe("Voortraject");
  });
});

describe("subsidiecheck, via de edge function", () => {
  // De URL van de function wordt bij het laden van de module gelezen, dus per
  // test een verse import met de env-var gezet.
  const laadMetFunctie = async () => {
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functie.test/subsidiecheck-mail");
    vi.resetModules();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const lead = await import("@/components/subsidiecheck/leadFormulier");
    const herkomst = await import("@/lib/herkomst");
    const body = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);
    return { lead, herkomst, body };
  };

  it("stuurt een bekende code mee als `herkomst`", async () => {
    const { lead, herkomst, body } = await laadMetFunctie();
    herkomst.onthoudHerkomst("?via=bord");
    await lead.verstuurSubsidiecheckLead({ waarden, input, adres, regelingen: [] });
    expect(body().herkomst).toBe("bord");
  });

  it("stuurt geen herkomst zonder bekende code", async () => {
    const { lead, herkomst, body } = await laadMetFunctie();
    herkomst.onthoudHerkomst("?via=onzin");
    await lead.verstuurSubsidiecheckLead({ waarden, input, adres, regelingen: [] });
    expect("herkomst" in body()).toBe(false);
  });

  it("stuurt de herkomst ook mee met een losse vraag (die kan een nieuwe lead worden)", async () => {
    const { lead, herkomst, body } = await laadMetFunctie();
    herkomst.onthoudHerkomst("?utm_source=deel&utm_medium=link");
    await lead.verstuurSubsidiecheckBericht({ waarden, bericht: "Kan dit ook voor een huurwoning?", input, adres });
    expect(body().herkomst).toBe("deel");
  });
});
