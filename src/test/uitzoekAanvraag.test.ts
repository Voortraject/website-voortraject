import { beforeEach, describe, expect, it, vi } from "vitest";

// De oker knop op het resultaat: "Laat gratis uitzoeken wat ik krijg". Eén klik,
// geen formulier. Hij gebruikt dezelfde route als een vraag op het resultaat
// (subsidiecheck-mail, actie "bericht"), met de gegevens die de bezoeker in de
// gegevens-poort al gaf en het lead-id, zodat het verzoek bij díe lead landt.

vi.mock("@/components/subsidiecheck/leadFormulier", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/subsidiecheck/leadFormulier")>()),
  verstuurSubsidiecheckBericht: vi.fn(async () => undefined),
}));

import { bewaarContact } from "@/components/subsidiecheck/contactOpslag";
import { MIN_INVULTIJD_MS, verstuurSubsidiecheckBericht } from "@/components/subsidiecheck/leadFormulier";
import { UITZOEK_BERICHT, vraagUitzoekenAan } from "@/components/subsidiecheck/uitzoekAanvraag";
import type { SubsidieCheckInput } from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "9722AB",
  huisnummer: "12",
  gemeente: "Groningen",
  provincie: "Groningen",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};
const adres = { straatnaam: "Verlengde Hereweg", woonplaatsnaam: "Groningen" };

describe("laat gratis uitzoeken wat ik krijg", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(verstuurSubsidiecheckBericht).mockClear();
  });

  it("stuurt het verzoek naar de lead uit de poort, zonder iets opnieuw te vragen", async () => {
    bewaarContact({ voornaam: "Sanne", achternaam: "de Vries", email: "sanne@example.nl", telefoon: "0612345678", leadId: "lead-1" });
    const uitkomst = await vraagUitzoekenAan({ input, adres, sindsMs: 0, nuMs: 60_000, wacht: async () => {} });

    expect(uitkomst).toBe("verstuurd");
    expect(verstuurSubsidiecheckBericht).toHaveBeenCalledTimes(1);
    const args = vi.mocked(verstuurSubsidiecheckBericht).mock.calls[0][0];
    expect(args.leadId).toBe("lead-1");
    expect(args.waarden.email).toBe("sanne@example.nl");
    expect(args.waarden.voornaam).toBe("Sanne");
    expect(args.bericht).toBe(UITZOEK_BERICHT);
    expect(args.duurMs).toBe(60_000);
  });

  it("wacht bij een heel snelle klik tot de minimale tijd voorbij is, in plaats van stil te worden genegeerd", async () => {
    // De function negeert inzendingen onder MIN_INVULTIJD_MS zonder foutmelding.
    // Zou de knop dan toch "Je aanvraag is binnen" tonen, dan belooft hij iets
    // wat nooit aankomt. Dus wachten we het restje uit.
    bewaarContact({ voornaam: "Sanne", achternaam: "de Vries", email: "sanne@example.nl", leadId: "lead-1" });
    const wacht = vi.fn(async () => {});
    await vraagUitzoekenAan({ input, adres, sindsMs: 10_000, nuMs: 11_000, wacht });

    expect(wacht).toHaveBeenCalledWith(MIN_INVULTIJD_MS - 1_000);
    expect(vi.mocked(verstuurSubsidiecheckBericht).mock.calls[0][0].duurMs).toBe(MIN_INVULTIJD_MS);
  });

  it("zonder bekend contact verstuurt hij niets: dan gaat de bezoeker naar het vraagblok", async () => {
    expect(await vraagUitzoekenAan({ input, adres, sindsMs: 0, nuMs: 60_000, wacht: async () => {} })).toBe(
      "geen-contact",
    );
    expect(verstuurSubsidiecheckBericht).not.toHaveBeenCalled();
  });

  it("geeft een fout van de route door, zodat de knop een eerlijke melding kan tonen", async () => {
    bewaarContact({ voornaam: "Sanne", achternaam: "de Vries", email: "sanne@example.nl", leadId: "lead-1" });
    vi.mocked(verstuurSubsidiecheckBericht).mockRejectedValueOnce(new Error("stuk"));
    await expect(vraagUitzoekenAan({ input, adres, sindsMs: 0, nuMs: 60_000, wacht: async () => {} })).rejects.toThrow(
      "stuk",
    );
  });

  it("het bericht noemt geen termijn en geen gedachtestreepje", () => {
    expect(UITZOEK_BERICHT).not.toMatch(/werkdag|[—–]/i);
  });
});
