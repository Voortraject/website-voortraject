import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

import {
  ADRES_MAX,
  huisnummerGeldig,
  stadGeldig,
  straatGeldig,
  toevoegingGeldig,
} from "@/lib/adresVelden";

// Deze grenzen bestaan omdat de website rechtstreeks in de CRM-database schrijft
// met de publieke anon-key: wat een bezoeker meestuurt, komt in het CRM, in de
// bevestigingsmail en in de CSV-export. Zie src/lib/adresVelden.ts.
describe("adresVelden", () => {
  it("laat echte Nederlandse adressen door", () => {
    for (const straat of [
      "Grote Markt",
      "1e Emmastraat",
      "Burg. J. Grommersstraat",
      "'t Zandt",
      "Sint-Annen",
      "Rijksstraatweg (noord)",
      "Súdhoekstermiddenwei",
    ]) {
      expect(straatGeldig(straat), straat).toBe(true);
    }
    for (const plaats of ["Groningen", "Ter Apelkanaal", "'s-Gravenhage", "Nij Beets"]) {
      expect(stadGeldig(plaats), plaats).toBe(true);
    }
    // Huisnummers zijn niet altijd puur numeriek.
    for (const nr of ["1", "12", "12-14", "3 rd", "104"]) {
      expect(huisnummerGeldig(nr), nr).toBe(true);
    }
    for (const tv of ["", "A", "bis", "zwart", "0042"]) {
      expect(toevoegingGeldig(tv), tv).toBe(true);
    }
  });

  it("weert tekst die te lang is", () => {
    expect(straatGeldig("a".repeat(ADRES_MAX.straat))).toBe(true);
    expect(straatGeldig("a".repeat(ADRES_MAX.straat + 1))).toBe(false);
    expect(stadGeldig("a".repeat(ADRES_MAX.stad + 1))).toBe(false);
    expect(toevoegingGeldig("a".repeat(ADRES_MAX.toevoeging + 1))).toBe(false);
    // Het gat waar dit om begonnen is: een megabyte tekst via ?str= in de URL.
    expect(straatGeldig("x".repeat(100_000))).toBe(false);
  });

  it("weert de bouwstenen van een HTML-tag", () => {
    expect(straatGeldig('<a href="https://kwaad.nl">Bevestig uw aanvraag</a>')).toBe(false);
    expect(straatGeldig("Grote Markt <script>")).toBe(false);
    expect(stadGeldig("Groningen >")).toBe(false);
    expect(toevoegingGeldig("<b>")).toBe(false);
  });

  it("eist dat een huisnummer met een cijfer begint en kort blijft", () => {
    expect(huisnummerGeldig("")).toBe(false);
    expect(huisnummerGeldig("abc")).toBe(false);
    expect(huisnummerGeldig("1".repeat(ADRES_MAX.huisnummer + 1))).toBe(false);
  });

  // Dezelfde grenzen staan nog een keer in de edge function, omdat Deno niets uit
  // src/ kan importeren. Lopen ze uiteen, dan is de serverside laag strenger of
  // juist losser dan de client en klopt de belofte "dit is de laag die telt" niet
  // meer. Zelfde bewaking als src/test/eersteStap.test.ts doet voor de mailtekst.
  it("houdt de kopie in de edge function gelijk", () => {
    const bron = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");
    const regel = bron.match(/const ADRES_MAX = \{([^}]*)\}/);
    expect(regel, "ADRES_MAX niet gevonden in de edge function").not.toBeNull();

    const uitFunctie = Object.fromEntries(
      regel![1]
        .split(",")
        .map((deel) => deel.trim())
        .filter(Boolean)
        .map((deel) => {
          const [sleutel, waarde] = deel.split(":").map((s) => s.trim());
          return [sleutel, Number(waarde)];
        }),
    );

    expect(uitFunctie).toEqual({ ...ADRES_MAX });
  });
});
