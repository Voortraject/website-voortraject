// Pure normalisatie van een EP-Online `PandEnergielabel/Adres`-response naar ons
// EnergielabelData-model. Bewust vrij van Deno-/netwerk-API's zodat dezelfde
// functie in vitest getest kan worden (zie src/test/woninginfo.test.ts).
//
// EP-Online geeft een ARRAY met registraties terug (een adres kan er meerdere
// hebben). Wij kiezen de meest recente registratie met een ingevulde
// Energieklasse. Veldnamen komen exact uit de v5-swagger (public.ep-online.nl).

import type { EnergielabelData, GebouwData } from "./types.ts";

type EpRow = {
  Energieklasse?: string | null;
  Registratiedatum?: string | null;
  Geldig_tot?: string | null;
  IsVereenvoudigdLabel?: boolean | null;
  Gebouwklasse?: string | null;
  Gebouwtype?: string | null;
  Gebouwsubtype?: string | null;
};

function tijd(iso?: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/** Trimt een bronveld; lege of niet-tekstwaarden worden `undefined`. */
function tekst(waarde?: string | null): string | undefined {
  if (typeof waarde !== "string") return undefined;
  const schoon = waarde.trim();
  return schoon === "" ? undefined : schoon;
}

export function normaliseerEpOnline(rows: unknown): EnergielabelData | null {
  if (!Array.isArray(rows)) return null;

  const metKlasse = (rows as EpRow[]).filter(
    (r) => r && typeof r.Energieklasse === "string" && r.Energieklasse.trim() !== "",
  );
  if (metKlasse.length === 0) return null;

  // Meest recente registratie eerst.
  metKlasse.sort((a, b) => tijd(b.Registratiedatum) - tijd(a.Registratiedatum));
  const r = metKlasse[0];

  return {
    klasse: r.Energieklasse!.trim().toUpperCase(),
    registratiedatum: r.Registratiedatum ?? undefined,
    geldigTot: r.Geldig_tot ?? undefined,
    isVereenvoudigd: r.IsVereenvoudigdLabel ?? undefined,
  };
}

// Gebouwgegevens uit dezelfde response. Bewust een eigen selectie in plaats van
// meeliften op de labelregistratie hierboven: een registratie zónder
// energieklasse kan het woningtype wél hebben, en dan is dat nog steeds waar.
//
// De waarden gaan ongewijzigd door (alleen getrimd). EP-Online publiceert voor
// deze drie velden geen enum in de v5-swagger, dus een vertaling naar een eigen
// lijst zou gokwerk zijn dat stil de verkeerde kant op kan vallen: een onbekende
// bronwaarde wordt dan "onbekend" in plaats van zichtbaar afwijkend.
export function normaliseerGebouw(rows: unknown): GebouwData | null {
  if (!Array.isArray(rows)) return null;

  const metGebouw = (rows as EpRow[]).filter(
    (r) => r && (tekst(r.Gebouwtype) || tekst(r.Gebouwklasse) || tekst(r.Gebouwsubtype)),
  );
  if (metGebouw.length === 0) return null;

  // Meest recente registratie eerst: een woning kan zijn verbouwd (rijwoning →
  // twee-onder-een-kap na een aanbouw) en dan is de nieuwste opname leidend.
  metGebouw.sort((a, b) => tijd(b.Registratiedatum) - tijd(a.Registratiedatum));
  const r = metGebouw[0];

  return {
    type: tekst(r.Gebouwtype),
    klasse: tekst(r.Gebouwklasse),
    subtype: tekst(r.Gebouwsubtype),
  };
}
