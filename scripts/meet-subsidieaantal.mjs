// Meet hoeveel regelingen de subsidiecheck per adres vindt.
//
// Waarom dit script bestaat: op stap 1 van de check staat een hard cijfer
// ("Gemiddeld 5 subsidies per adres"). Zo'n uitspraak op een publieke site moet
// je kunnen nameten, en over een jaar nog een keer. Dit script is die meting.
//
// Draaien:  node scripts/meet-subsidieaantal.mjs
//
// Wat het doet, in twee stappen:
//  1. Voor elke plaats hieronder haalt het bij PDOK een écht bestaande postcode
//     op. Zelf postcodes verzinnen ging eerder mis: de bron geeft voor een
//     niet-bestaande postcode netjes nul regelingen terug, en zo'n stille nul
//     trekt het gemiddelde omlaag zonder dat je het ziet.
//  2. Daarna roept het dezelfde productie-edge-function aan als de site, met de
//     standaard van stap 1 (woningeigenaar, alle acht maatregelen).
//
// De steekproef is landelijk, en dat is met opzet: de regel op de site noemt
// geen regio meer, dus het gemiddelde moet ook buiten Noord-Nederland kloppen.
// Het zwaartepunt ligt wel in het werkgebied, want daar komt het verkeer vandaan.
//
// Wijkt de uitkomst af van GEMIDDELD_AANTAL_SUBSIDIES in src/config/cijfers.ts,
// pas dan dat getal aan (en de toelichting erboven).
//
// Let op: de function cachet 12 uur, dus een tweede run kost de bron niets.

const FUNCTIE = "https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/subsidiecheck";
// Publieke anon-key van het CRM-project, gelijk aan
// src/integrations/supabase/external-client.ts. Geen secret.
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWxuZnVrYnJ4em5rZXZuZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI3MTQsImV4cCI6MjA5MzIxODcxNH0.jtOD3z4ElwfXSNaZeekWKwfBZGBIXnWRvNl72n9uYQ0";

const PDOK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

// MAATREGEL_FILTER_ID uit src/lib/subsidies/types.ts, alle acht (= "Alles").
const FILTERS = ["1503", "1564", "1571", "1584", "1581", "1594", "1601", "1602"];

// Eerst het werkgebied: één plaats per gemeente in Groningen en Drenthe (alle
// 22). Daarna de rest van het land, zodat het gemiddelde ook geldt voor iemand
// uit Friesland of Overijssel.
const PLAATSEN = [
  // Groningen
  "Groningen",
  "Appingedam",
  "Delfzijl",
  "Winsum",
  "Uithuizen",
  "Hoogezand",
  "Winschoten",
  "Oude Pekela",
  "Stadskanaal",
  "Veendam",
  "Leek",
  "Zuidhorn",
  "Ter Apel",
  "Vlagtwedde",
  // Drenthe
  "Assen",
  "Gieten",
  "Borger",
  "Coevorden",
  "Zuidwolde",
  "Emmen",
  "Hoogeveen",
  "Meppel",
  "Beilen",
  "Roden",
  "Vries",
  "Diever",
  // Friesland
  "Leeuwarden",
  "Drachten",
  "Sneek",
  "Heerenveen",
  "Harlingen",
  // Overijssel
  "Zwolle",
  "Enschede",
  "Deventer",
  "Hardenberg",
  // De rest van het land
  "Lelystad",
  "Apeldoorn",
  "Nijmegen",
  "Utrecht",
  "Amersfoort",
  "Amsterdam",
  "Haarlem",
  "Den Haag",
  "Rotterdam",
  "Dordrecht",
  "Middelburg",
  "Eindhoven",
  "Tilburg",
  "Breda",
  "Maastricht",
  "Venlo",
];

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

// Een bestaand adres in deze plaats, rechtstreeks uit de BAG via PDOK.
//
// Bewust filteren op `woonplaatsnaam` en niet vrij zoeken op de plaatsnaam: dat
// laatste vond voor de meeste steden niets (de vrije zoekterm moet op straat +
// plaats matchen) en koos bij "Vries" een adres in de provincie Groningen. Met
// `q=*` plus een woonplaatsfilter krijg je gegarandeerd een adres in díe plaats.
async function zoekAdres(plaats) {
  const q = new URLSearchParams({ q: "*", rows: "1" });
  q.append("fq", "type:adres");
  q.append("fq", `woonplaatsnaam:"${plaats}"`);
  const res = await fetch(`${PDOK}?${q}`);
  if (!res.ok) return null;
  const doc = (await res.json())?.response?.docs?.[0];
  if (!doc?.postcode) return null;
  return { postcode: doc.postcode, gemeente: doc.gemeentenaam, provincie: doc.provincienaam };
}

const query = (postcode) => {
  const p = new URLSearchParams();
  p.set("postalcode", postcode);
  p.set("type-of-resident", "Woningeigenaar");
  for (const f of FILTERS) p.append("filter", f);
  return p.toString();
};

const uitkomsten = [];
for (const plaats of PLAATSEN) {
  const adres = await zoekAdres(plaats);
  if (!adres) {
    console.log(`${plaats.padEnd(14)} GEEN ADRES GEVONDEN bij PDOK — overgeslagen`);
    continue;
  }
  try {
    const res = await fetch(`${FUNCTIE}?${query(adres.postcode)}`, {
      headers: { Accept: "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    if (!res.ok) {
      console.log(`${plaats.padEnd(14)} ${adres.postcode}  FOUT status ${res.status}`);
      continue;
    }
    const { regelingen = [] } = await res.json();
    // Nul is hier geen geldige meting maar een signaal dat er iets misging: elk
    // Nederlands adres valt onder minstens de landelijke regelingen.
    if (regelingen.length === 0) {
      console.log(`${plaats.padEnd(14)} ${adres.postcode}  0 regelingen — verdacht, overgeslagen`);
      continue;
    }
    const subsidies = regelingen.filter((r) => r.type === "subsidie").length;
    const leningen = regelingen.filter((r) => r.type === "lening").length;
    uitkomsten.push({ ...adres, plaats, totaal: regelingen.length, subsidies, leningen });
    console.log(
      `${plaats.padEnd(14)} ${adres.postcode}  ${adres.provincie.padEnd(14)}` +
        `totaal ${String(regelingen.length).padStart(2)}  subsidies ${String(subsidies).padStart(2)}` +
        `  leningen ${String(leningen).padStart(2)}`,
    );
  } catch (e) {
    console.log(`${plaats.padEnd(14)} ${adres.postcode}  FOUT ${e.message}`);
  }
  // Rustig aan tegen de bron: dit is data van een ander (Verbeterjehuis, CC-0).
  await wacht(400);
}

if (uitkomsten.length === 0) {
  console.error("\nGeen enkele meting gelukt — is de edge function bereikbaar?");
  process.exit(1);
}

const gem = (rijen, sel) => rijen.reduce((s, u) => s + sel(u), 0) / rijen.length;
const min = (rijen, sel) => Math.min(...rijen.map(sel));
const max = (rijen, sel) => Math.max(...rijen.map(sel));

const rapporteer = (naam, rijen) => {
  console.log(`\n--- ${naam} (${rijen.length} adressen) ---`);
  for (const [label, sel] of [
    ["subsidies", (u) => u.subsidies],
    ["leningen", (u) => u.leningen],
    ["totaal", (u) => u.totaal],
  ]) {
    console.log(
      `${label.padEnd(10)} gemiddeld ${gem(rijen, sel).toFixed(2)}  min ${min(rijen, sel)}  max ${max(rijen, sel)}`,
    );
  }
};

rapporteer("heel Nederland", uitkomsten);
const noord = uitkomsten.filter((u) => ["Groningen", "Drenthe"].includes(u.provincie));
if (noord.length) rapporteer("werkgebied Groningen en Drenthe", noord);
const laagste = uitkomsten.reduce((a, b) => (b.subsidies < a.subsidies ? b : a));
console.log(`\nMagerste adres: ${laagste.plaats} (${laagste.provincie}) met ${laagste.subsidies} subsidies.`);
console.log(
  `GEMIDDELD_AANTAL_SUBSIDIES (src/config/cijfers.ts) hoort ${Math.floor(gem(uitkomsten, (u) => u.subsidies))}` +
    ` te zijn: het landelijke gemiddelde naar beneden afgerond.`,
);
