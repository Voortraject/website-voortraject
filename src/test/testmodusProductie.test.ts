// @vitest-environment-options { "url": "https://voortraject.nl/subsidiecheck?test=1" }

import { beforeEach, describe, expect, it, vi } from "vitest";

// Het belangrijkste slot van de testmodus: op het echte domein doet hij niets,
// hoe de URL er ook uitziet. Zonder deze grens zou één gedeelde of geïndexeerde
// link met ?test=1 ervoor zorgen dat leads van echte bezoekers stilletjes
// verdwijnen, met een normale bevestiging in beeld. Dat is precies het soort
// fout dat je pas weken later ontdekt.
//
// Apart bestand, want jsdom laat de hostname niet binnen één testbestand
// wisselen; die wordt hierboven via de docblock gezet.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

import { schrijfSubsidiecheckLead } from "@/components/subsidiecheck/leadFormulier";
import { isTestmodus, leesTestmodusUitUrl } from "@/config/testmodus";
import type { SubsidieCheckInput } from "@/lib/subsidies";

const input: SubsidieCheckInput = {
  postcode: "7811EP",
  huisnummer: "34",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

describe("testmodus op het productiedomein", () => {
  beforeEach(() => {
    sessionStorage.clear();
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
  });

  it("negeert ?test=1 op voortraject.nl", () => {
    expect(window.location.hostname).toBe("voortraject.nl");
    leesTestmodusUitUrl();
    expect(isTestmodus()).toBe(false);
  });

  it("onthoudt de keuze daar ook niet in sessionStorage", () => {
    leesTestmodusUitUrl();
    expect(sessionStorage.getItem("sc_testmodus")).toBeNull();
  });

  it("schrijft de lead daar gewoon weg", async () => {
    leesTestmodusUitUrl();

    await schrijfSubsidiecheckLead({
      waarden: {
        voornaam: "Jan",
        tussenvoegsel: "",
        achternaam: "de Vries",
        email: "jan@example.nl",
        telefoon: "0612345678",
      },
      input,
      adres: { straatnaam: "Hoofdstraat", woonplaatsnaam: "Emmen" },
    });

    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});
