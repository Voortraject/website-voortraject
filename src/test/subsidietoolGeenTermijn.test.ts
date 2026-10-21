import { readdirSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";

// Afspraak van oktober 2026: de subsidietool belooft nergens een termijn. Het team
// belt alle leads, maar "binnen 1 werkdag" is een belofte die we niet altijd
// waarmaken. Commentaar mag de geschiedenis noemen, zichtbare tekst niet.
const MAP = "src/components/subsidiecheck";
const zonderCommentaar = (bron: string) =>
  bron.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("de subsidietool belooft geen termijn", () => {
  it("noemt nergens een werkdag in zichtbare tekst", () => {
    const bestanden = readdirSync(MAP).filter((f) => /\.(tsx|ts)$/.test(f));
    expect(bestanden.length).toBeGreaterThan(10);
    for (const f of bestanden) {
      expect(zonderCommentaar(readFileSync(`${MAP}/${f}`, "utf8")), f).not.toMatch(/werkdag/i);
    }
  });
});
