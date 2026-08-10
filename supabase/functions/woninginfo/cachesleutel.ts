// De cachesleutel van het 3D-model, apart gezet omdat hier de begrenzing van de
// rijgroei in `pand_3d_cache` zit. Puur (geen Deno-API's), dus testbaar vanuit
// vitest: zie src/test/cachesleutel.test.ts.
//
// Het gat dat dit dicht: de sleutel was `${pandid}@${Math.round(x)},${Math.round(y)}`
// met x en y rechtstreeks uit de queryparameters. Eén geldige pand-id plus een x
// die per verzoek één meter opschuift leverde dus onbeperkt véle rijen op voor
// hetzelfde gebouw, elk met een volledig 3D-model erin. De function is publiek en
// anoniem aanroepbaar en schrijft met service_role in de CRM-database, dus dat is
// rijgroei die een willekeurige bezoeker aanstuurt.

/**
 * Grenzen van het Rijksdriehoekstelsel, ruim genomen. Heel Nederland valt
 * hierbinnen; alles daarbuiten is onzin of een poging tot sleutelvariatie.
 */
export const RD_GRENZEN = { xMin: 0, xMax: 300_000, yMin: 280_000, yMax: 640_000 } as const;

/**
 * Roostermaat in meters. Een pand heeft één plek, dus een echte bezoeker levert
 * per adres steeds dezelfde sleutel op; het rooster maakt alleen dat een
 * aanvaller er niet oneindig veel van kan maken. De buurpanden worden binnen 42m
 * gekozen, dus een verschuiving van hooguit 10m verandert daar hooguit een grijs
 * contextgebouw aan de rand aan.
 */
export const ROOSTER_M = 10;

/** Rondt af op het rooster, zodat bijna-gelijke coördinaten dezelfde sleutel delen. */
export const opRooster = (n: number) => Math.round(n / ROOSTER_M) * ROOSTER_M;

export type RdCoord = { x: number; y: number };

/**
 * Leest x/y uit de query en geeft ze alleen terug als het getallen binnen
 * Nederland zijn, al afgerond op het rooster. Anders null: dan bestaat er geen
 * coördinaat, dus geen buurpanden en een sleutel zonder plek.
 */
export function leesRdCoord(params: URLSearchParams): RdCoord | null {
  const x = Number(params.get("x"));
  const y = Number(params.get("y"));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const { xMin, xMax, yMin, yMax } = RD_GRENZEN;
  if (x < xMin || x > xMax || y < yMin || y > yMax) return null;
  return { x: opRooster(x), y: opRooster(y) };
}

/** De cachesleutel: pand-id, en de plek alleen als die geldig is. */
export function bouwCacheSleutel(pandid: string, coord: RdCoord | null): string {
  return coord ? `${pandid}@${coord.x},${coord.y}` : pandid;
}
