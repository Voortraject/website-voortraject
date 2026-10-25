import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Wat de browser naar `subsidiecheck-mail` stuurt. Sinds oktober 2026 haalt de
 * function de regelingen voor de mail zelf op en zet hij nooit tekst uit de
 * request in de mail. De lijst meesturen heeft dan geen nut meer, en een veld
 * dat er niet is, kan ook niet per ongeluk weer gebruikt worden.
 */

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "anon",
  supabaseExternal: { from: vi.fn() },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("de request van de gegevensstap", () => {
  it("stuurt geen regelingen mee, wel de controles voor de function", async () => {
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functions.test/subsidiecheck-mail");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true, leadId: "abc" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { verstuurSubsidiecheckLead } = await import("@/components/subsidiecheck/leadFormulier");

    const uitkomst = await verstuurSubsidiecheckLead({
      waarden: { voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: "jan@example.nl", telefoon: "0612345678" },
      input: { postcode: "9725BG", huisnummer: "3", bewonertype: "woningeigenaar", maatregelen: ["isolatie"] },
      adres: { straatnaam: "Viaductstraat", woonplaatsnaam: "Groningen" },
      duurMs: 5000,
      turnstileToken: "tok",
    });

    expect(uitkomst).toEqual({ leadId: "abc" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://functions.test/subsidiecheck-mail");
    const body = JSON.parse(opties.body as string);
    expect(body).not.toHaveProperty("regelingen");
    expect(body).toMatchObject({ duurMs: 5000, turnstileToken: "tok", email: "jan@example.nl" });
    expect(body.input).toMatchObject({ postcode: "9725BG", huisnummer: "3", bewonertype: "woningeigenaar" });
  });

  it("stuurt de hulpvragen als lijst én, voor een oudere function, nog als tekstregel", async () => {
    // Cloudflare zet de site live bij de merge en de function wordt los uitgerold.
    // Tot die tijd draait er een function die alleen `notitie` kent; die mag de
    // hulpvragen dan niet kwijtraken.
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functions.test/subsidiecheck-mail");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { verstuurSubsidiecheckLead } = await import("@/components/subsidiecheck/leadFormulier");

    await verstuurSubsidiecheckLead({
      waarden: { voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: "jan@example.nl", telefoon: "0612345678" },
      input: { postcode: "9725BG", huisnummer: "3", bewonertype: "woningeigenaar", maatregelen: [] },
      adres: { straatnaam: "Viaductstraat", woonplaatsnaam: "Groningen" },
      notitie: "Wil hulp met: Subsidies uitzoeken, De aanvraag regelen",
      hulpvragen: ["Subsidies uitzoeken", "De aanvraag regelen"],
      duurMs: 5000,
    });

    const [, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(opties.body as string)).toMatchObject({
      hulpvragen: ["Subsidies uitzoeken", "De aanvraag regelen"],
      notitie: "Wil hulp met: Subsidies uitzoeken, De aanvraag regelen",
    });
  });
});

describe("de request van een klik of vraag na de poort", () => {
  it("stuurt soort en keuzes mee, plus de oude tekst", async () => {
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functions.test/subsidiecheck-mail");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { verstuurSubsidiecheckBericht } = await import("@/components/subsidiecheck/leadFormulier");

    await verstuurSubsidiecheckBericht({
      waarden: { voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: "jan@example.nl", telefoon: "" },
      bericht: "Lastigst: Het papierwerk",
      soort: "lastigst",
      keuzes: ["Het papierwerk"],
      hulpvragen: ["Subsidies uitzoeken"],
      leadId: "6f9619ff-8b86-4011-b42d-00c04fc964ff",
      input: { postcode: "9725BG", huisnummer: "3", bewonertype: "woningeigenaar", maatregelen: [] },
      adres: { straatnaam: "Viaductstraat", woonplaatsnaam: "Groningen" },
      duurMs: 5000,
    });

    const [, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(opties.body as string)).toMatchObject({
      actie: "bericht",
      soort: "lastigst",
      keuzes: ["Het papierwerk"],
      hulpvragen: ["Subsidies uitzoeken"],
      bericht: "Lastigst: Het papierwerk",
    });
  });
});
