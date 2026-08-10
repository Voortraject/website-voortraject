import { describe, expect, it } from "vitest";

import {
  formulierFoutMelding,
  isRateLimitFout,
  MailFunctieFout,
  RATE_LIMIT_MELDING,
  TELEFOON_WEERGAVE,
} from "@/lib/formulierFout";

const STANDAARD = "Er ging iets mis bij het versturen.";

// De rem in het CRM: 5 inzendingen per uur per IP-adres, 30 per uur over alle
// bezoekers samen. Postgres gooit dan SQLSTATE PT429 en PostgREST antwoordt met
// HTTP 429. Een échte bezoeker die net pech heeft, mag niet de indruk krijgen dat
// het een storing van een minuut is.
describe("volumerem herkennen", () => {
  it("herkent PT429 uit de directe insert", () => {
    // Zoals supabase-js een PostgrestError teruggeeft.
    const fout = {
      code: "PT429",
      message: "Te veel aanvragen vanaf dit adres. Probeer het over een uur opnieuw.",
      details: null,
      hint: null,
    };
    expect(isRateLimitFout(fout)).toBe(true);
    expect(formulierFoutMelding(fout, STANDAARD)).toBe(RATE_LIMIT_MELDING);
  });

  it("herkent HTTP 429 van de edge function", () => {
    const fout = new MailFunctieFout(429);
    expect(isRateLimitFout(fout)).toBe(true);
    expect(formulierFoutMelding(fout, STANDAARD)).toBe(RATE_LIMIT_MELDING);
  });

  it("laat een echte storing de gewone melding houden", () => {
    // Dit is het punt van de splitsing: een 500 of een netwerkfout is géén rem,
    // en "probeer het over een uur nog eens" zou daar misleidend zijn.
    for (const fout of [
      new MailFunctieFout(500),
      new Error("Failed to fetch"),
      { code: "23505", message: "duplicate key" },
      null,
      undefined,
      "kapot",
    ]) {
      expect(isRateLimitFout(fout), String(fout)).toBe(false);
      expect(formulierFoutMelding(fout, STANDAARD)).toBe(STANDAARD);
    }
  });

  it("noemt een wachttijd én een telefoonnummer", () => {
    // Zonder telefoonnummer raak je juist de lead kwijt van iemand die het
    // serieus meende. Met "een uur" weet de bezoeker dat opnieuw klikken niet helpt.
    expect(RATE_LIMIT_MELDING).toContain(TELEFOON_WEERGAVE);
    expect(RATE_LIMIT_MELDING).toMatch(/uur/);
    // Huisstijl: geen gedachtestreepjes in bezoeker-zichtbare copy.
    expect(RATE_LIMIT_MELDING).not.toContain("—");
  });
});
