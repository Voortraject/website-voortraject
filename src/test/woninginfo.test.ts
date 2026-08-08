import { describe, expect, it } from "vitest";

// De normalizer leeft in de edge function (Deno), maar is bewust puur zodat we
// 'm hier kunnen testen — één bron van waarheid, geen kopie.
import { normaliseerEpOnline, normaliseerGebouw } from "../../supabase/functions/woninginfo/normaliseer";

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

describe("normaliseerGebouw", () => {
  it("geeft null als er niets over het gebouw bekend is", () => {
    expect(normaliseerGebouw([])).toBeNull();
    expect(normaliseerGebouw(null)).toBeNull();
    expect(normaliseerGebouw({})).toBeNull();
    expect(normaliseerGebouw([{ Energieklasse: "C", Registratiedatum: "2020-01-01T00:00:00" }])).toBeNull();
  });

  it("geeft de bronwaarden ongewijzigd door", () => {
    const r = normaliseerGebouw([
      {
        Gebouwklasse: "Woningbouw",
        Gebouwtype: "Vrijstaande woning",
        Gebouwsubtype: "Niet van toepassing",
        Registratiedatum: "2023-04-18T00:00:00",
      },
    ]);
    expect(r).toEqual({ type: "Vrijstaande woning", klasse: "Woningbouw", subtype: "Niet van toepassing" });
  });

  it("kiest de meest recente registratie", () => {
    const rows = [
      { Gebouwtype: "Rijwoning", Registratiedatum: "2015-01-01T00:00:00" },
      { Gebouwtype: "2 onder 1 kap", Registratiedatum: "2024-06-01T00:00:00" },
    ];
    expect(normaliseerGebouw(rows)?.type).toBe("2 onder 1 kap");
  });

  it("werkt ook zonder energieklasse: het woningtype staat los van het label", () => {
    const rows = [{ Energieklasse: null, Gebouwtype: "Galerijwoning", Registratiedatum: "2022-01-01T00:00:00" }];
    expect(normaliseerGebouw(rows)?.type).toBe("Galerijwoning");
    expect(normaliseerEpOnline(rows)).toBeNull();
  });

  it("maakt lege en niet-tekstwaarden undefined in plaats van lege strings", () => {
    const r = normaliseerGebouw([
      { Gebouwtype: "  Rijwoning  ", Gebouwklasse: "   ", Gebouwsubtype: null, Registratiedatum: "2022-01-01T00:00:00" },
    ]);
    expect(r).toEqual({ type: "Rijwoning", klasse: undefined, subtype: undefined });
  });
});
