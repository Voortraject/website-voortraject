import { SUPABASE_EXTERNAL_ANON_KEY } from "@/integrations/supabase/external-client";

import type { Model3d, WoningInfo } from "./types";

// Haalt woninginfo (nu: energielabel) op via de edge function `woninginfo` in
// het CRM-project. Zelfde patroon als energiesubsidiewijzerProvider:
//  - env `VITE_WONINGINFO_URL` gezet → praat met de function;
//  - leeg (bijv. lokaal zonder function) → nette degradatie: geen label, de
//    luchtfoto werkt sowieso client-side.
// Het label is niet-kritiek: elke hapering geeft `{ energielabel: null }` terug
// zodat het subsidieoverzicht nooit breekt.
const FUNCTIE_URL = import.meta.env.VITE_WONINGINFO_URL as string | undefined;

const LEEG: WoningInfo = { energielabel: null };

export async function haalWoningInfo(
  postcode: string,
  huisnummer: string,
  toevoeging?: string,
): Promise<WoningInfo> {
  if (!FUNCTIE_URL) return LEEG;

  try {
    const params = new URLSearchParams({ postcode, huisnummer });
    const tv = toevoeging?.trim();
    if (tv) params.set("toevoeging", tv);

    const res = await fetch(`${FUNCTIE_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        // Vereist door de Supabase function-gateway; anon-key is publiek.
        apikey: SUPABASE_EXTERNAL_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
      },
    });
    if (!res.ok) return LEEG;
    const data = (await res.json()) as Partial<WoningInfo>;
    return { energielabel: data.energielabel ?? null };
  } catch {
    return LEEG;
  }
}

// Haalt het 3D-massamodel op via dezelfde function (aparte tak: ?pandid=…).
// `pandId` is de 16-cijferige BAG-pand-identificatie; met een RD-middelpunt
// (`centrum`) worden ook de buurpanden meegenomen. Env leeg of fout → null.
export async function haalPand3d(pandId: string, centrum?: { x: number; y: number }): Promise<Model3d | null> {
  if (!FUNCTIE_URL) return null;
  try {
    const params = new URLSearchParams({ pandid: pandId });
    if (centrum) {
      params.set("x", String(centrum.x));
      params.set("y", String(centrum.y));
    }
    const res = await fetch(`${FUNCTIE_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        apikey: SUPABASE_EXTERNAL_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { model3d?: Model3d | null };
    return data.model3d ?? null;
  } catch {
    return null;
  }
}
