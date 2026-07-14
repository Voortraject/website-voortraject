// Pure normalisatie van een EP-Online `PandEnergielabel/Adres`-response naar ons
// EnergielabelData-model. Bewust vrij van Deno-/netwerk-API's zodat dezelfde
// functie in vitest getest kan worden (zie src/test/woninginfo.test.ts).
//
// EP-Online geeft een ARRAY met registraties terug (een adres kan er meerdere
// hebben). Wij kiezen de meest recente registratie met een ingevulde
// Energieklasse. Veldnamen komen exact uit de v5-swagger (public.ep-online.nl).

import type { EnergielabelData } from "./types.ts";

type EpRow = {
  Energieklasse?: string | null;
  Registratiedatum?: string | null;
  Geldig_tot?: string | null;
  IsVereenvoudigdLabel?: boolean | null;
};

function tijd(iso?: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
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
