// Controleert of onze gebiedscorrecties nog kloppen (src/lib/subsidies/postcodegebieden.ts).
//
// Een correctie die stilletjes niet meer werkt, merk je niet: de tool toont dan
// gewoon weer te veel, zonder foutmelding. Daarom kijkt dit script wekelijks:
//
//  1. Staat er op de pagina van SNN nog dezelfde postcodelijst? Een nieuwe PDF
//     (andere link) of een vervangen PDF (andere hash) betekent: lijst bijwerken.
//  2. Doet de live function wat we verwachten? Per correctie één postcode waar
//     de regeling wél hoort te staan en één waar niet. Zo vangen we ook een
//     regeling die bij Milieu Centraal een nieuwe slug kreeg (dan matcht onze
//     correctie niet meer) of die is verdwenen (dan kan de correctie weg).
//  3. Is er een nieuwe variant van Verduurzaming en Verbetering Groningen
//     bijgekomen die wij nog niet corrigeren?
//
// Draaien: `node scripts/controleer-gebiedscorrecties.mjs` (Node 24 of nieuwer,
// want het leest postcodegebieden.ts rechtstreeks). Exitcode 0 = alles klopt,
// 1 = er moet iets gebeuren; de melding zegt wat. Geen secrets nodig: de live
// proef gaat via onze eigen function, net als scripts/controleer-esw-filters.mjs.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GEBIEDSCORRECTIES, HOOGEVEEN, TEN_POST, VOLKSHUISVESTING_DRENTHE, VVG_10000 } from "../src/lib/subsidies/postcodegebieden.ts";

const HIER = dirname(fileURLToPath(import.meta.url));
const FUNCTIE_URL =
  process.env.SUBSIDIECHECK_URL ?? "https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/subsidiecheck";
// SNN weert kale bots; met een gewone browser-UA krijgen we de pagina.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function anonKey() {
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;
  const bron = readFileSync(resolve(HIER, "../src/integrations/supabase/external-client.ts"), "utf8");
  return bron.match(/SUPABASE_EXTERNAL_ANON_KEY[\s\S]{0,40}?"([^"]+)"/)?.[1];
}

// Per correctie een echte postcode (uit PDOK) waar de regeling wel en waar hij
// niet hoort te staan. Elke id uit GEBIEDSCORRECTIES moet hier staan; zo niet,
// dan faalt de controle, zodat een nieuwe correctie niet onbewaakt blijft.
const PROEVEN = [
  { id: "subsidie-verduurzaming-en-verbetering-groningen-10-000", bewoner: "Woningeigenaar", wel: "9901HT", niet: "9367VC" },
  {
    id: "subsidie-verduurzaming-en-verbetering-groningen-10-000-zakelijk",
    bewoner: "Particuliere woningverhuurder",
    wel: "9901HT",
    niet: "9367VC",
  },
  { id: "subsidie-verduurzaming-en-verbetering-groningen-17-000", bewoner: "Woningeigenaar", wel: "9901HT" },
  { id: "subsidie-verduurzaming-volkshuisvesting-drenthe", bewoner: "Woningeigenaar", wel: "9461TH", niet: "9462RE" },
  { id: "subsidie-energiemaatregelen-groningen", bewoner: "Woningeigenaar", wel: "9792PJ", niet: "9711CR" },
  { id: "isolatieaanpak-groningen-en-noord-drenthe", bewoner: "Woningeigenaar", wel: "9481BM", niet: "7901JA" },
];

// Waar we naar nieuwe varianten van de VVG-familie zoeken: Eemsdelta (op de
// lijst), Westerkwartier (niet op de lijst, wel bij Milieu Centraal gekoppeld)
// en Drenthe (Tynaarlo), zodat een variant die maar aan één gebied hangt ook
// opvalt. Voor alle vier de bewonertypes: de zakelijke variant kwam alleen bij
// verhuurders voorbij.
const FAMILIE_RE = /verduurzaming en verbetering groningen/i;
const FAMILIE_PROEF = ["9901HT", "9367VC", "9481BM"].flatMap((postcode) =>
  ["Woningeigenaar", "Particuliere woningverhuurder", "Vereniging van Eigenaren", "Huurder"].map((bewoner) => ({
    postcode,
    bewoner,
  })),
);

const fouten = [];
const fout = (tekst) => {
  fouten.push(tekst);
  console.error(`FOUT  ${tekst}`);
};
const ok = (tekst) => console.log(`ok    ${tekst}`);

async function haal(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} gaf status ${res.status}`);
  return res;
}

// --- 1. De postcodelijsten bij de bron ---
async function controleerBron(gebied) {
  if (gebied.bronPagina) {
    try {
      const html = await (await haal(gebied.bronPagina, { headers: { "User-Agent": UA } })).text();
      // Gedecodeerd vergelijken: "%20" en een spatie, of "%28" en "(", zijn
      // dezelfde link. Anders geeft een andere schrijfwijze vals alarm.
      const ontcijfer = (s) => {
        try {
          return decodeURIComponent(s.replace(/&amp;/g, "&"));
        } catch {
          return s;
        }
      };
      const pad = ontcijfer(new URL(gebied.bron).pathname);
      const links = [...html.matchAll(/href="([^"]+)"/gi)].map((m) => ontcijfer(m[1]));
      if (links.some((l) => l.endsWith(pad))) ok(`${gebied.naam}: de pagina linkt nog naar versie "${gebied.versie}"`);
      else {
        const pdfs = [...new Set([...html.matchAll(/href="([^"]*ostcode[^"]*\.pdf)"/gi)].map((m) => m[1]))];
        fout(
          `${gebied.naam}: de pagina linkt niet meer naar onze PDF. Nieuwe postcodelijst? ` +
            `Gevonden: ${pdfs.join(", ") || "geen postcode-PDF"}. Werk postcodegebieden.ts bij.`,
        );
      }
    } catch (e) {
      fout(`${gebied.naam}: bronpagina niet op te halen (${e.message})`);
    }
  }
  if (gebied.sha256) {
    try {
      const pdf = Buffer.from(await (await haal(gebied.bron, { headers: { "User-Agent": UA } })).arrayBuffer());
      const hash = createHash("sha256").update(pdf).digest("hex");
      if (hash === gebied.sha256) ok(`${gebied.naam}: PDF ongewijzigd`);
      else fout(`${gebied.naam}: de PDF is vervangen (sha256 ${hash}). Controleer de postcodes en werk de lijst bij.`);
    } catch (e) {
      fout(`${gebied.naam}: PDF niet op te halen (${e.message}). Verplaatst? Zoek de nieuwe op de bronpagina.`);
    }
  }
}

// --- 2. en 3. De live function ---
const cache = new Map();
async function regelingenVoor(postcode, bewoner) {
  const sleutel = `${postcode}|${bewoner}`;
  if (!cache.has(sleutel)) {
    const key = anonKey();
    const url = `${FUNCTIE_URL}?postalcode=${postcode}&type-of-resident=${encodeURIComponent(bewoner)}`;
    const res = await haal(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    cache.set(sleutel, (await res.json()).regelingen ?? []);
  }
  return cache.get(sleutel);
}

async function controleerProef(proef) {
  const correctie = GEBIEDSCORRECTIES.find((c) => c.regelingen.includes(proef.id));
  try {
    const wel = (await regelingenVoor(proef.wel, proef.bewoner)).find((r) => r.id === proef.id);
    if (!wel) {
      fout(
        `${proef.id} staat niet meer bij ${proef.wel}. Verdwenen bij Milieu Centraal (dan kan de correctie weg), ` +
          `of een nieuwe slug (dan werkt de correctie niet meer: id bijwerken).`,
      );
    } else if (correctie?.alleenAls && wel.alleenAls !== correctie.alleenAls) {
      fout(`${proef.id} bij ${proef.wel} mist de voorwaarde "Alleen als ${correctie.alleenAls}". Is de function gedeployed?`);
    } else ok(`${proef.id} staat bij ${proef.wel}`);

    if (proef.niet) {
      const niet = (await regelingenVoor(proef.niet, proef.bewoner)).some((r) => r.id === proef.id);
      if (niet) fout(`${proef.id} staat bij ${proef.niet}, waar hij niet hoort. Is de function gedeployed?`);
      else ok(`${proef.id} staat niet bij ${proef.niet}`);
    }
  } catch (e) {
    fout(`${proef.id}: live function niet bereikbaar (${e.message})`);
  }
}

async function controleerFamilie() {
  const bekend = new Set(GEBIEDSCORRECTIES.flatMap((c) => c.regelingen));
  const voor = fouten.length;
  for (const { postcode, bewoner } of FAMILIE_PROEF) {
    try {
      for (const r of await regelingenVoor(postcode, bewoner)) {
        if (FAMILIE_RE.test(r.titel ?? "") && !bekend.has(r.id)) {
          fout(`Nieuwe VVG-variant zonder correctie: "${r.titel}" (${r.id}). Bekijk de voorwaarden bij SNN.`);
        }
      }
    } catch (e) {
      fout(`familiecontrole bij ${postcode}: ${e.message}`);
    }
  }
  if (fouten.length === voor) ok("geen onbekende VVG-varianten");
}

const zonderProef = GEBIEDSCORRECTIES.flatMap((c) => c.regelingen).filter((id) => !PROEVEN.some((p) => p.id === id));
for (const id of zonderProef) fout(`${id} heeft geen proef in PROEVEN. Voeg er een toe in dit script.`);

for (const gebied of [VVG_10000, VOLKSHUISVESTING_DRENTHE, TEN_POST, HOOGEVEEN]) await controleerBron(gebied);
for (const proef of PROEVEN) await controleerProef(proef);
await controleerFamilie();

if (fouten.length > 0) {
  console.error(`\n${fouten.length} punt(en) om na te lopen. Uitleg bijwerken: zie de kop van src/lib/subsidies/postcodegebieden.ts.`);
  process.exit(1);
}
console.log("\nAlle gebiedscorrecties kloppen nog.");
