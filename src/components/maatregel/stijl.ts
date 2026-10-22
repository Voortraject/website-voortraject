/**
 * Kleuren voor de pagina's onder /verduurzamen.
 *
 * Kleuren komen uit de design-tokens (src/index.css), niet uit hexcodes. De
 * constanten hieronder zijn bewust verwijzingen naar CSS-variabelen, zodat een
 * huisstijlwijziging op één plek doorwerkt en deze pagina's niet achterblijven.
 */
export const KLEUR = {
  navy: "hsl(var(--primary))",
  goud: "hsl(var(--accent))",
  wit: "hsl(var(--card))",
  zand: "hsl(var(--background))",
  warm: "var(--card-soft)",
  sand: "hsl(var(--secondary))",
  rand: "hsl(var(--primary) / 0.1)",
  /** Uitleg en kleine tekst: leesbaar grijsblauw, nooit lichtgrijs. */
  zacht: "hsl(var(--rs-tekst-zacht))",
} as const;

/**
 * Achtergrondkeuze per sectie, zodat het ritme van de pagina expliciet is.
 *
 * Sinds de huisstijl van oktober 2026 zijn er twee lichte tinten: off-white
 * (`zand`) en de warme band (`warm`). `wit` en `sand` zijn er nog voor oudere
 * aanroepen en vallen op de band; `navy` is het donkere vlak, spaarzaam.
 */
export type SectieBg = "zand" | "wit" | "warm" | "sand" | "navy";

export const SECTIE_KLASSE: Record<SectieBg, string> = {
  zand: "bg-background",
  wit: "hs-band",
  warm: "hs-band",
  sand: "hs-band",
  navy: "hs-donker hs-op-donker",
};

/** Wat een sectie in de reeks is: licht (krijgt een tint), donker, of een vast blok met eigen kleur. */
export type SectieSoort = "licht" | "donker" | "vast";

/**
 * Kiest de tint van elke lichte sectie op een pagina, zodat er nooit twee
 * gelijke naast elkaar staan, bij elke combinatie van optionele secties.
 *
 * Een donkere sectie of een vast blok (de subsidiecheck brengt zijn eigen kleur
 * mee) breekt de reeks. Binnen elk stuk wisselen off-white en band om en om.
 * Het eerste stuk begint bovenaan met off-white (de hero), elk volgend stuk
 * eindigt met off-white: zo staat de laatste sectie boven de footer altijd op
 * off-white en valt de afgeronde bovenkant van de footer daar rustig op.
 */
export const toonReeks = (soorten: SectieSoort[]): (SectieBg | null)[] => {
  const uit: (SectieBg | null)[] = soorten.map((s) => (s === "donker" ? "navy" : null));
  const stukken: number[][] = [];
  let huidig: number[] = [];
  soorten.forEach((s, i) => {
    if (s === "licht") huidig.push(i);
    else {
      if (huidig.length) stukken.push(huidig);
      huidig = [];
    }
  });
  if (huidig.length) stukken.push(huidig);

  stukken.forEach((stuk, n) => {
    stuk.forEach((index, j) => {
      const plek = n === 0 ? j : stuk.length - 1 - j;
      uit[index] = plek % 2 === 0 ? "zand" : "warm";
    });
  });
  return uit;
};
