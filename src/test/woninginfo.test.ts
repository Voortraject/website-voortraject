import { describe, expect, it } from "vitest";

// De normalizer leeft in de edge function (Deno), maar is bewust puur zodat we
// 'm hier kunnen testen — één bron van waarheid, geen kopie.
import { normaliseerEpOnline } from "../../supabase/functions/woninginfo/normaliseer";

describe("normaliseerEpOnline", () => {
  it("geeft null bij een lege array of niet-array", () => {
    expect(normaliseerEpOnline([])).toBeNull();
    expect(normaliseerEpOnline(null)).toBeNull();
    expect(normaliseerEpOnline({})).toBeNull();
  });

  it("kiest de meest recente registratie met een energieklasse", () => {
    const rows = [
      { Energieklasse: "C", Registratiedatum: "2018-01-01T00:00:00", Geldig_tot: "2028-01-01T00:00:00" },
      {
        Energieklasse: "A",
        Registratiedatum: "2023-04-18T00:00:00",
        Geldig_tot: "2033-04-18T00:00:00",
        IsVereenvoudigdLabel: false,
      },
    ];
    const r = normaliseerEpOnline(rows);
    expect(r?.klasse).toBe("A");
    expect(r?.registratiedatum).toBe("2023-04-18T00:00:00");
    expect(r?.geldigTot).toBe("2033-04-18T00:00:00");
    expect(r?.isVereenvoudigd).toBe(false);
  });

  it("negeert registraties zonder ingevulde energieklasse", () => {
    const rows = [
      { Energieklasse: null, Registratiedatum: "2024-01-01T00:00:00" },
      { Energieklasse: "B", Registratiedatum: "2020-01-01T00:00:00" },
    ];
    expect(normaliseerEpOnline(rows)?.klasse).toBe("B");
  });
});
