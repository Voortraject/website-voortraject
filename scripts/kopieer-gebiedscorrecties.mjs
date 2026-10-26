// Maakt de Deno-kopieën van de gebiedscorrecties voor de edge function
// `subsidiecheck`. Die kan niet uit de Vite-app importeren en heeft een eigen
// kopie, met een kop erboven en `.ts` achter de importpaden. Met de hand
// kopiëren laat de test "Deno-kopieën" falen; dit script doet het precies goed.
//
// Draaien: `node scripts/kopieer-gebiedscorrecties.mjs`, daarna `bun run test`
// en de function deployen (zie de kop van src/lib/subsidies/postcodegebieden.ts).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url));

for (const naam of ["postcodegebieden", "gebiedscorrecties"]) {
  const bron = readFileSync(resolve(HIER, `../src/lib/subsidies/${naam}.ts`), "utf8").replace(/\r\n/g, "\n");
  const kop =
    `// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/${naam}.ts.\n` +
    "// Gegenereerd, niet met de hand bewerken: zie de kop van tekst.ts hiernaast.\n\n";
  const kopie = kop + bron.replace(/(from "\.\/[A-Za-z]+)";/g, '$1.ts";');
  writeFileSync(resolve(HIER, `../supabase/functions/subsidiecheck/${naam}.ts`), kopie);
  console.log(`supabase/functions/subsidiecheck/${naam}.ts bijgewerkt`);
}
