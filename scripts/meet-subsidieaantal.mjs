// Meet hoeveel regelingen de subsidiecheck per adres vindt.
//
// Waarom dit script bestaat: op stap 1 van de check staat een hard cijfer
// ("Gemiddeld 5 subsidies per adres in Groningen en Drenthe"). Zo'n uitspraak op
// een publieke site moet je kunnen nameten, en over een jaar nog een keer. Dit
// script is die meting.
//
// Draaien:  bun run scripts/meet-subsidieaantal.mjs
//           (of: node scripts/meet-subsidieaantal.mjs)
//
// Wat het doet: het roept dezelfde productie-edge-function aan als de site,
// voor één bestaand adres per gemeente in het werkgebied, met de standaard van
// stap 1 (woningeigenaar, alle acht maatregelen). Wijkt de uitkomst af van
// GEMIDDELD_AANTAL_SUBSIDIES in src/config/cijfers.ts, pas dan dat getal aan
// (en de toelichting erboven).
//
// Let op: de function cachet 12 uur, dus een tweede run kost de bron niets.

const FUNCTIE = "https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/subsidiecheck";
// Publieke anon-key van het CRM-project, gelijk aan
// src/integrations/supabase/external-client.ts. Geen secret.
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWxuZnVrYnJ4em5rZXZuZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI3MTQsImV4cCI6MjA5MzIxODcxNH0.jtOD3z4ElwfXSNaZeekWKwfBZGBIXnWRvNl72n9uYQ0";

// MAATREGEL_FILTER_ID uit src/lib/subsidies/types.ts, alle acht (= "Alles").
const FILTERS = ["1503", "1564", "1571", "1584", "1581", "1594", "1601", "1602"];

// Eén bestaand adres per gemeente in Groningen en Drenthe (alle 22), plus een
// tweede postcode in de gemeenten met meerdere kernen. Alle postcodes zijn op
// 2026-08-09 gecontroleerd bij PDOK: ze bestaan écht. Dat is geen detail — de
// bron geeft voor een niet-bestaande postcode netjes nul regelingen terug, en
// zo'n nul zou het gemiddelde stilletjes omlaag trekken.
const STEEKPROEF = [
  ["Groningen", "9711AB"],
  ["Groningen", "9743AA"],
  ["Eemsdelta", "9901AA"],
  ["Eemsdelta", "9934AA"],
  ["Het Hogeland", "9951AA"],
  ["Het Hogeland", "9981AA"],
  ["Midden-Groningen", "9601AA"],
  ["Oldambt", "9671AA"],
  ["Pekela", "9665AA"],
  ["Stadskanaal", "9501AA"],
  ["Veendam", "9641AA"],
  ["Westerkwartier", "9351AA"],
  ["Westerkwartier", "9801AA"],
  ["Westerwolde", "9561AA"],
  ["Westerwolde", "9541AA"],
  ["Assen", "9401HW"],
  ["Aa en Hunze", "9461AA"],
  ["Borger-Odoorn", "9531AA"],
  ["Coevorden", "7741AA"],
  ["De Wolden", "7921AA"],
  ["Emmen", "7811KL"],
  ["Hoogeveen", "7901AA"],
  ["Meppel", "7941AA"],
  ["Midden-Drenthe", "9411AA"],
  ["Noordenveld", "9301AA"],
  ["Tynaarlo", "9481AA"],
  ["Westerveld", "7981AA"],
];

const query = (postcode) => {
  const p = new URLSearchParams();
  p.set("postalcode", postcode);
  p.set("type-of-resident", "Woningeigenaar");
  for (const f of FILTERS) p.append("filter", f);
  return p.toString();
};

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

const uitkomsten = [];
for (const [gemeente, postcode] of STEEKPROEF) {
  try {
    const res = await fetch(`${FUNCTIE}?${query(postcode)}`, {
      headers: { Accept: "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    if (!res.ok) {
      console.log(`${gemeente.padEnd(18)} ${postcode}  FOUT status ${res.status}`);
      continue;
    }
    const { regelingen = [] } = await res.json();
    const subsidies = regelingen.filter((r) => r.type === "subsidie").length;
    const leningen = regelingen.filter((r) => r.type === "lening").length;
    // Nul regelingen betekent bijna altijd: deze postcode bestaat niet (meer).
    // Meetellen zou het gemiddelde vervuilen, dus we melden het en slaan over.
    if (regelingen.length === 0) {
      console.log(`${gemeente.padEnd(18)} ${postcode}  0 regelingen — bestaat deze postcode nog? Overgeslagen.`);
      continue;
    }
    uitkomsten.push({ gemeente, postcode, totaal: regelingen.length, subsidies, leningen });
    console.log(
      `${gemeente.padEnd(18)} ${postcode}  totaal ${String(regelingen.length).padStart(2)}  ` +
        `subsidies ${String(subsidies).padStart(2)}  leningen ${String(leningen).padStart(2)}`,
    );
  } catch (e) {
    console.log(`${gemeente.padEnd(18)} ${postcode}  FOUT ${e.message}`);
  }
  // Rustig aan tegen de bron: dit is data van een ander (Verbeterjehuis, CC-0).
  await wacht(400);
}

if (uitkomsten.length === 0) {
  console.error("\nGeen enkele meting gelukt — is de edge function bereikbaar?");
  process.exit(1);
}

const gem = (sel) => uitkomsten.reduce((s, u) => s + sel(u), 0) / uitkomsten.length;
const min = (sel) => Math.min(...uitkomsten.map(sel));
const max = (sel) => Math.max(...uitkomsten.map(sel));

console.log(`\n--- ${uitkomsten.length} van ${STEEKPROEF.length} adressen gemeten ---`);
for (const [naam, sel] of [
  ["subsidies", (u) => u.subsidies],
  ["leningen", (u) => u.leningen],
  ["totaal", (u) => u.totaal],
]) {
  console.log(`${naam.padEnd(10)} gemiddeld ${gem(sel).toFixed(2)}  min ${min(sel)}  max ${max(sel)}`);
}
console.log(
  `\nGEMIDDELD_AANTAL_SUBSIDIES (src/config/cijfers.ts) hoort ${Math.floor(gem((u) => u.subsidies))} te zijn:` +
    ` het gemiddelde naar beneden afgerond.`,
);
