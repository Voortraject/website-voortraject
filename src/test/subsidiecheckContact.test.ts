import { beforeEach, describe, expect, it } from "vitest";

import { bewaarContact, leesContact, vulContactAan } from "@/components/subsidiecheck/contactOpslag";
import { MAX_BERICHT, valideerBericht, valideerContact } from "@/components/subsidiecheck/leadFormulier";

// De contactroute op het resultaat leunt op twee dingen: een vraag mag alleen
// geldig de deur uit, en wie door de gegevens-poort kwam moet herkend worden
// zodat hij niet opnieuw zijn naam en e-mailadres hoeft in te vullen.

describe("valideerBericht", () => {
  it("weigert een lege vraag", () => {
    expect(valideerBericht("   ")).toBe("Vul je vraag in.");
  });

  it("laat een gewone vraag door", () => {
    expect(valideerBericht("Kan ik ISDE en de gemeentesubsidie combineren?")).toBeNull();
  });

  it("weigert een vraag boven de tekenlimiet", () => {
    expect(valideerBericht("a".repeat(MAX_BERICHT + 1))).toContain("te lang");
  });
});

describe("valideerContact met optioneel telefoonnummer", () => {
  const basis = { voornaam: "Jan", tussenvoegsel: "", achternaam: "Jansen", email: "jan@example.com" };

  it("vraagt normaal wél om een telefoonnummer", () => {
    const uitkomst = valideerContact({ ...basis, telefoon: "" });
    expect(uitkomst).toEqual({ fout: "Vul je telefoonnummer in." });
  });

  it("laat een leeg nummer toe op de vraag-route", () => {
    const uitkomst = valideerContact({ ...basis, telefoon: "" }, { telefoonVerplicht: false });
    expect("waarden" in uitkomst).toBe(true);
  });

  it("blijft een ingevuld maar onbruikbaar nummer weigeren", () => {
    const uitkomst = valideerContact({ ...basis, telefoon: "12" }, { telefoonVerplicht: false });
    expect("fout" in uitkomst).toBe(true);
  });
});

describe("contactOpslag", () => {
  beforeEach(() => sessionStorage.clear());

  it("geeft null zonder opgeslagen contact", () => {
    expect(leesContact()).toBeNull();
  });

  it("bewaart en leest het contact van deze sessie terug", () => {
    bewaarContact({
      voornaam: "Jan",
      achternaam: "Jansen",
      email: "jan@example.com",
      telefoon: "0612345678",
      leadId: "11111111-2222-3333-4444-555555555555",
    });
    expect(leesContact()).toMatchObject({
      voornaam: "Jan",
      email: "jan@example.com",
      leadId: "11111111-2222-3333-4444-555555555555",
    });
  });

  it("negeert opslag zonder bruikbaar e-mailadres", () => {
    sessionStorage.setItem("sc_contact", JSON.stringify({ voornaam: "Jan", email: "geen-adres" }));
    expect(leesContact()).toBeNull();
  });

  it("negeert onleesbare inhoud in plaats van te struikelen", () => {
    sessionStorage.setItem("sc_contact", "{kapot");
    expect(leesContact()).toBeNull();
  });

  it("vult een later opgegeven telefoonnummer aan zonder de rest te wissen", () => {
    bewaarContact({ voornaam: "Jan", achternaam: "Jansen", email: "jan@example.com" });
    vulContactAan({ telefoon: "0612345678" });
    expect(leesContact()).toMatchObject({ voornaam: "Jan", telefoon: "0612345678" });
  });
});
