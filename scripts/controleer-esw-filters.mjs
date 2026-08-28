// Controleert of Milieu Centraal zijn filterlijst heeft gewijzigd.
//
// De API Guide zegt met zoveel woorden dat filters niet hardcoded mogen worden,
// omdat ze kunnen wijzigen, en dat een filter dat niet meer bestaat simpelweg
// geen resultaten oplevert. Onze negen maatregel-id's stáán hardcoded (in
// src/lib/subsidies/types.ts, want ze bepalen de chips en de opgeslagen
// interesses). Zonder controle zou een gewijzigd id de tool stilletjes minder
// regelingen laten vinden, zonder één foutmelding. Dit script is die controle.
//
// Twee uitkomsten, bewust verschillend van gewicht:
//   - Een van ONZE id's is verdwenen  → exitcode 2. Dat is stuk en moet meteen
//     opgelost worden.
//   - De lijst is verder gewijzigd    → exitcode 1 plus een bijgewerkte
//     momentopname op schijf. De GitHub Action maakt daar een pull request van,
//     zodat de wijziging als leesbare diff langskomt.
//   - Niets veranderd                 → exitcode 0, geen ruis.
//
// De filterlijst wordt opgehaald via ONZE edge function (`?meta=filters`), niet
// rechtstreeks bij Milieu Centraal. Zo blijft de API-key op één plek staan (de
// Supabase-secrets van het CRM-project) en hoeft hij niet ook nog als
// GitHub-secret te bestaan. Bijkomend voordeel: als de function zelf stuk is,
// merken we dat hier ook. De workflow heeft dus helemaal geen secrets nodig.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url));
const MOMENTOPNAME = resolve(HIER, "../src/lib/subsidies/esw-filters.snapshot.json");
const TYPES = resolve(HIER, "../src/lib/subsidies/types.ts");
const EXTERNE_CLIENT = resolve(HIER, "../src/integrations/supabase/external-client.ts");

const FUNCTIE_URL =
  process.env.SUBSIDIECHECK_URL ?? "https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/subsidiecheck";

// De anon-key is publiek en staat al in de repo, dus die lezen we daar gewoon
// uit. Scheelt een GitHub-secret dat toch geen geheim is, en er is één plek waar
// hij staat. De échte API-key van Milieu Centraal zit in de edge function.
function anonKey() {
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;
  const bron = readFileSync(EXTERNE_CLIENT, "utf8");
  // De constante staat over twee regels in dat bestand, vandaar [\s\S].
  return bron.match(/SUPABASE_EXTERNAL_ANON_KEY[\s\S]{0,40}?"([^"]+)"/)?.[1];
}

// De velden die wij gebruiken. De 342 gemeenten laten we bewust weg: die
// wijzigen bij elke herindeling en zeggen niets over onze koppeling.
const VELDEN = ["Measures", "TypeOfResident", "Types"];

function opgeschoond(lijst) {
  return (lijst ?? [])
    .map((m) => ({ Label: m.Label, Value: m.Value }))
    .sort((a, b) => String(a.Value).localeCompare(String(b.Value)));
}

/** De id's die wij hardcoden, rechtstreeks uit types.ts gelezen. */
function onzeFilterIds() {
  const bron = readFileSync(TYPES, "utf8");
  const blok = bron.match(/MAATREGEL_FILTER_ID[^{]*\{([\s\S]*?)\n\};/);
  if (!blok) throw new Error("MAATREGEL_FILTER_ID niet gevonden in types.ts");
  return [...blok[1].matchAll(/^\s*"?([\w-]+)"?:\s*"([^"]+)"/gm)].map((m) => ({ code: m[1], id: m[2] }));
}

async function haalFilters() {
  const url = `${FUNCTIE_URL}?meta=filters`;
  const headers = { Accept: "application/json" };
  const sleutel = anonKey();
  if (sleutel) {
    // De Supabase-gateway wil een apikey, ook bij verify_jwt = false.
    headers.apikey = sleutel;
    headers.Authorization = `Bearer ${sleutel}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} gaf status ${res.status}`);
  return res.json();
}

function vergelijk(oud, nieuw) {
  const verschillen = [];
  for (const veld of VELDEN) {
    const a = new Map(opgeschoond(oud[veld]).map((m) => [m.Value, m.Label]));
    const b = new Map(opgeschoond(nieuw[veld]).map((m) => [m.Value, m.Label]));
    for (const [id, label] of b) {
      if (!a.has(id)) verschillen.push(`NIEUW      ${veld}: "${label}" (${id})`);
      else if (a.get(id) !== label) verschillen.push(`HERNOEMD   ${veld}: "${a.get(id)}" → "${label}" (${id})`);
    }
    for (const [id, label] of a) {
      if (!b.has(id)) verschillen.push(`VERDWENEN  ${veld}: "${label}" (${id})`);
    }
  }
  return verschillen;
}

const oud = JSON.parse(readFileSync(MOMENTOPNAME, "utf8"));
const bron = await haalFilters();

// Eerst het echte gevaar: staat een van onze eigen id's er nog?
const beschikbaar = new Set(opgeschoond(bron.Measures).map((m) => m.Value));
const kwijt = onzeFilterIds().filter((m) => !beschikbaar.has(m.id));
if (kwijt.length > 0) {
  console.error("KAPOT: maatregel-id's die wij gebruiken bestaan niet meer bij Milieu Centraal.");
  console.error("Zonder aanpassing vindt de subsidiecheck hiervoor stilletjes geen regelingen meer.\n");
  for (const m of kwijt) console.error(`  ${m.code} → ${m.id}`);
  console.error("\nPas MAATREGEL_FILTER_ID in src/lib/subsidies/types.ts aan (en de kopie in supabase/functions/subsidiecheck/types.ts).");
  process.exit(2);
}

const verschillen = vergelijk(oud, bron);
if (verschillen.length === 0) {
  console.log(`Filterlijst ongewijzigd (${opgeschoond(bron.Measures).length} maatregelen). Niets te doen.`);
  process.exit(0);
}

console.log("De filterlijst van Milieu Centraal is gewijzigd:\n");
for (const v of verschillen) console.log("  " + v);

const bijgewerkt = {
  _uitleg: oud._uitleg,
  _opgehaald: new Date().toISOString().slice(0, 10),
  ...Object.fromEntries(VELDEN.map((veld) => [veld, opgeschoond(bron[veld])])),
};
writeFileSync(MOMENTOPNAME, JSON.stringify(bijgewerkt, null, 2) + "\n");
console.log("\nMomentopname bijgewerkt. Loop de wijzigingen na: raakt er iets aan onze negen maatregelen,");
console.log("of is er een nieuwe maatregel die we zouden willen aanbieden?");
process.exit(1);
