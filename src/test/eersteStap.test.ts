import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

import { eersteStapTekst } from "../components/subsidiecheck/eersteStapTekst";

// De regel die deze tekst bestaat: nooit een uitspraak over dít huis, altijd
// over woningen uit die bouwperiode. Zie eersteStapTekst.ts voor de bronnen.
describe("eersteStapTekst", () => {
  it("zegt niets zonder bruikbaar bouwjaar", () => {
    expect(eersteStapTekst(undefined, "woningeigenaar")).toBeNull();
    expect(eersteStapTekst(0, "woningeigenaar")).toBeNull();
    expect(eersteStapTekst(Number.NaN, "woningeigenaar")).toBeNull();
    // BAG-plaatshouder voor "bouwjaar onbekend".
    expect(eersteStapTekst(1005, "woningeigenaar")).toBeNull();
    // Nieuwbouw in aanbouw: er is nog geen "sindsdien".
    expect(eersteStapTekst(new Date().getFullYear() + 1, "woningeigenaar")).toBeNull();
  });

  it("kiest de periode op de grenzen 1975 en 1992", () => {
    expect(eersteStapTekst(1974, "woningeigenaar")?.zinnen[1]).toMatch(/geen isolatie mee/);
    expect(eersteStapTekst(1975, "woningeigenaar")?.zinnen[1]).toMatch(/dunne laag isolatie/);
    expect(eersteStapTekst(1991, "woningeigenaar")?.zinnen[1]).toMatch(/dunne laag isolatie/);
    expect(eersteStapTekst(1992, "woningeigenaar")?.zinnen[1]).toMatch(/al redelijke isolatie mee/);
  });

  it("noemt het bouwjaar in de openingszin", () => {
    expect(eersteStapTekst(1962, "woningeigenaar")?.zinnen[0]).toBe("Jouw huis is uit 1962.");
  });

  it("doet nooit een uitspraak over deze woning zelf", () => {
    for (const jaar of [1900, 1962, 1975, 1991, 1992, 2007, 2023]) {
      const tekst = eersteStapTekst(jaar, "woningeigenaar");
      const alles = tekst!.zinnen.join(" ");
      // "Jouw huis is uit <jaar>" is een feit uit de BAG en mag; elke andere
      // bewering moet over de voorraad gaan, niet over dit adres.
      const naOpening = tekst!.zinnen.slice(1).join(" ");
      expect(naOpening).not.toMatch(/jouw (huis|woning|muren|dak|vloer)/i);
      expect(alles).toMatch(/Woningen uit die (tijd|jaren)/);
    }
  });

  it("noemt geen enkele maatregel bij naam", () => {
    for (const jaar of [1900, 1980, 2000]) {
      const alles = eersteStapTekst(jaar, "woningeigenaar")!.zinnen.join(" ");
      expect(alles).not.toMatch(/spouw|dakisolatie|vloerisolatie|glas/i);
    }
  });

  it("vraagt huurders wat er in hun situatie mogelijk is", () => {
    const huurder = eersteStapTekst(1962, "huurder");
    expect(huurder?.vraag).toBe("Zullen we uitzoeken wat er in jouw situatie mogelijk is?");
    expect(huurder?.voorstel).toMatch(/^Ik huur een woning uit 1962\./);
    // De uitspraak over de voorraad blijft wél gewoon staan.
    expect(huurder?.zinnen[1]).toMatch(/geen isolatie mee/);
  });

  it("stuurt bij nieuwere woningen naar verwarming en opwek in plaats van de schil", () => {
    const nieuw = eersteStapTekst(2007, "woningeigenaar");
    expect(nieuw?.zinnen[2]).toMatch(/verwarming en opwek/);
    expect(nieuw?.vraag).toBe("Zullen we uitzoeken wat voor jouw huis interessant is?");
  });

  it("geeft een voorstel dat het bouwjaar meeneemt, zodat het team context heeft", () => {
    expect(eersteStapTekst(1962, "woningeigenaar")?.voorstel).toContain("1962");
    expect(eersteStapTekst(2007, "woningeigenaar")?.voorstel).toContain("2007");
  });
});

// De overzichtsmail zegt hetzelfde als het resultaat. De edge function draait op
// Deno en kan niets uit src/ importeren, dus staat die tekst daar noodgedwongen
// een tweede keer. Deze test faalt zodra de twee uit elkaar lopen: dan leest de
// bewoner op de site iets anders dan in zijn mail, over hetzelfde huis.
describe("eersteStapTekst in de overzichtsmail", () => {
  const mail = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");

  it("gebruikt letterlijk dezelfde uitspraken over de woningvoorraad", () => {
    for (const jaar of [1900, 1980, 2000]) {
      // De openingszin bevat het bouwjaar en staat daar als template; de rest is
      // vaste tekst en moet woord voor woord kloppen.
      for (const zin of eersteStapTekst(jaar, "woningeigenaar")!.zinnen.slice(1)) {
        expect(mail).toContain(zin);
      }
    }
  });

  it("houdt dezelfde openingszin en periodegrenzen aan", () => {
    expect(mail).toContain("Jouw huis is uit ${bouwjaar}.");
    expect(mail).toMatch(/bouwjaar >= 1992/);
    expect(mail).toMatch(/bouwjaar >= 1975/);
  });
});
