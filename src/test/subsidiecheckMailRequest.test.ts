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
});
