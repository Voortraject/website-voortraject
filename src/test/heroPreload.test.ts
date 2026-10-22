import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { HERO_BEELD } from "@/components/sections/heroBeeld";

// index.html laadt de heroafbeelding vooruit met een eigen kopie van de
// bestandslijst (die kan daar niet uit de React-code komen). Lopen die twee
// uit elkaar, dan haalt de browser een ander bestand vooruit dan de pagina
// toont: dubbel downloaden en geen winst. Deze test houdt ze gelijk.

const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

describe("preload van de heroafbeelding", () => {
  it("noemt dezelfde bestanden en sizes als de hero", () => {
    expect(html).toContain(`"${HERO_BEELD.mobielSrcSet}"`);
    expect(html).toContain(`"${HERO_BEELD.mobielSizes}"`);
    expect(html).toContain(`"${HERO_BEELD.breedSrcSet}"`);
    expect(html).toContain(`"${HERO_BEELD.breedSizes}"`);
  });

  it("laadt alleen vooruit op de homepagina", () => {
    expect(html).toContain('if (location.pathname !== "/") return;');
  });

  it("verwijst alleen naar bestanden die echt bestaan", () => {
    const paden = [HERO_BEELD.mobielSrcSet, HERO_BEELD.breedSrcSet, HERO_BEELD.terugval]
      .flatMap((s) => s.split(",").map((d) => d.trim().split(" ")[0]));
    for (const pad of paden) expect(existsSync(resolve(__dirname, "../../public" + pad)), pad).toBe(true);
  });
});
