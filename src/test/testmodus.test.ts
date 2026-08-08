import { beforeEach, describe, expect, it, vi } from "vitest";

// De testmodus laat de subsidiecheck volledig doorlopen zónder dat er een lead
// in het CRM belandt. Dat is prettig, maar het is ook het gevaarlijkste soort
// schakelaar die er is: staat hij per ongeluk aan op de echte site, dan
// verdwijnen er stilletjes leads en merkt niemand het, want de bezoeker ziet een
// normale bevestiging.
//
// Vandaar twee sloten, en deze test bewaakt ze allebei. De productie-host-check
// zelf staat in testmodusProductie.test.ts, want jsdom laat de hostname niet
// binnen één bestand wisselen.

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

const waarden = {
  voornaam: "Jan",
  tussenvoegsel: "",
  achternaam: "de Vries",
  email: "jan@example.nl",
  telefoon: "0612345678",
};

const input: SubsidieCheckInput = {
  postcode: "7811EP",
  huisnummer: "34",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

const adres = { straatnaam: "Hoofdstraat", woonplaatsnaam: "Emmen" };

const ga = (zoekterm: string) => window.history.replaceState({}, "", `/subsidiecheck${zoekterm}`);

describe("testmodus buiten productie", () => {
  beforeEach(() => {
    sessionStorage.clear();
    insertMock.mockReset();
    ga("");
  });

  it("staat standaard uit", () => {
    expect(isTestmodus()).toBe(false);
  });

  it("gaat aan met ?test=1 en blijft aan als de parameter uit de URL verdwijnt", () => {
    ga("?test=1");
    leesTestmodusUitUrl();
    expect(isTestmodus()).toBe(true);

    // De stappen herschrijven hun queryparameters, dus test=1 valt weg. De keuze
    // moet dat overleven, anders schakelt de modus halverwege uit en gaat er
    // alsnog een lead het CRM in.
    ga("?pc=7811EP&hn=34&type=woningeigenaar");
    expect(isTestmodus()).toBe(true);
  });

  it("gaat weer uit met ?test=0", () => {
    ga("?test=1");
    leesTestmodusUitUrl();
    ga("?test=0");
    leesTestmodusUitUrl();
    expect(isTestmodus()).toBe(false);
  });

  it("schrijft geen lead weg zolang de modus aanstaat", async () => {
    ga("?test=1");
    leesTestmodusUitUrl();

    await schrijfSubsidiecheckLead({ waarden, input, adres, notitie: "Wil hulp met: Subsidies uitzoeken" });

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("schrijft wél gewoon weg zodra de modus uit staat", async () => {
    insertMock.mockResolvedValue({ error: null });

    await schrijfSubsidiecheckLead({ waarden, input, adres });

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0]).toBe("leads_bewoners");
  });
});
