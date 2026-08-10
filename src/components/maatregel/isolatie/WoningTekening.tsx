import { useId } from "react";

import type { MaatregelId } from "@/data/isolatie";

/**
 * De woning die zichtbaar dichtgaat.
 *
 * Isometrisch getekend met echte texturen (metselwerk, dakpannen, glas met
 * reflectie) in plaats van een vlak schema. Zonder maatregelen ontsnapt de
 * warmte via dak, gevel, ramen en vloer: dat zijn de pijlen naar buiten. Zet je
 * een maatregel aan, dan verschijnt er een isolatielaag op de snede van dat
 * bouwdeel en verdwijnen de pijlen daar.
 *
 * Het metselwerk en de dakpannen staan schuin via `patternTransform`: de
 * hellingshoek van elk vlak is uitgerekend uit de vlakvectoren hieronder, zodat
 * de textuur netjes met het vlak meeloopt in plaats van er overheen te liggen.
 *
 * Alle overgangen respecteren prefers-reduced-motion via `.schil-overgang`
 * in index.css.
 */

type Punt = [number, number];

/* ---------- geometrie ---------- */

// Onderhoeken van het huisvolume, met de neus naar de kijker.
const A: Punt = [96, 300];   // links-voor
const B: Punt = [276, 340];  // midden-voor (de hoek naar de kijker)
const C: Punt = [408, 274];  // rechts-voor
const MUUR = 116;            // muurhoogte
const NOK = 62;              // hoogte van de nok boven de muur

const op = ([x, y]: Punt, dy: number): Punt => [x, y - dy];
const Ah = op(A, MUUR);
const Bh = op(B, MUUR);
const Ch = op(C, MUUR);

// Achterhoek (verborgen) volgt uit de twee zijden.
const Dh: Punt = [Ah[0] + (Ch[0] - Bh[0]), Ah[1] + (Ch[1] - Bh[1])];

// Nok: boven het midden van de korte zijden.
const midden = (p: Punt, q: Punt): Punt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const NokVoor = op(midden(Bh, Ch), NOK);
const NokAchter = op(midden(Ah, Dh), NOK);

const pad = (...punten: Punt[]) => punten.map(([x, y]) => `${x},${y}`).join(" ");

/** Hoek waaronder een vlak wegloopt, voor patternTransform. */
const helling = (p: Punt, q: Punt) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

const HOEK_LINKS = helling(A, B);   // linkergevel loopt naar beneden weg
const HOEK_RECHTS = helling(B, C);  // rechtergevel loopt omhoog weg
const HOEK_DAK = helling(Ah, Bh);

/** Punt op een vlak, met u langs de breedte en v langs de hoogte. */
const opVlak = (oorsprong: Punt, breedte: Punt, hoogte: Punt, u: number, v: number): Punt => [
  oorsprong[0] + breedte[0] * u + hoogte[0] * v,
  oorsprong[1] + breedte[1] * u + hoogte[1] * v,
];

const BREEDTE_LINKS: Punt = [B[0] - A[0], B[1] - A[1]];
const BREEDTE_RECHTS: Punt = [C[0] - B[0], C[1] - B[1]];
const HOOGTE: Punt = [0, -MUUR];

/** Vierhoek op een gevelvlak, in vlakcoördinaten. */
const vlakVorm = (
  oorsprong: Punt,
  breedte: Punt,
  u1: number,
  u2: number,
  v1: number,
  v2: number,
) =>
  pad(
    opVlak(oorsprong, breedte, HOOGTE, u1, v1),
    opVlak(oorsprong, breedte, HOOGTE, u2, v1),
    opVlak(oorsprong, breedte, HOOGTE, u2, v2),
    opVlak(oorsprong, breedte, HOOGTE, u1, v2),
  );

/* ---------- kleuren ---------- */

const STEEN_LICHT = "#C8A183";
const STEEN_DONKER = "#A87C5F";
const VOEG = "#E4D5C6";
const PAN_LICHT = "#5B6472";
const PAN_DONKER = "#3E4653";
const KOZIJN = "#F4F1EA";
const WARM = "#C0392B";

export const WoningTekening = ({ gekozen }: { gekozen: Set<MaatregelId> }) => {
  const id = useId();
  const steenL = `${id}-steen-l`;
  const steenR = `${id}-steen-r`;
  const pannen = `${id}-pannen`;
  const isolatie = `${id}-isolatie`;
  const glas = `${id}-glas`;
  const schaduw = `${id}-schaduw`;

  const aan = (m: MaatregelId) => gekozen.has(m);
  const gevelAan = aan("spouw") || aan("gevel");
  const lek = (open: boolean) => (open ? 0.8 : 0);

  const beschrijving =
    gekozen.size === 0
      ? "Isometrische tekening van een woning zonder isolatie, waarbij warmte via dak, gevel, ramen en vloer naar buiten ontsnapt"
      : `Isometrische tekening van een woning met isolatie in: ${[...gekozen].join(", ")}`;

  return (
    <svg viewBox="0 0 500 400" className="w-full h-auto" role="img" aria-label={beschrijving}>
      <defs>
        {/* Metselwerk: halfsteensverband, per vlak meegekanteld. */}
        {[
          { naam: steenL, hoek: HOEK_LINKS },
          { naam: steenR, hoek: HOEK_RECHTS },
        ].map(({ naam, hoek }) => (
          <pattern
            key={naam}
            id={naam}
            width="26"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform={`skewY(${hoek})`}
          >
            <rect width="26" height="12" fill={VOEG} />
            <rect x="0.6" y="0.6" width="11.8" height="4.8" fill={STEEN_LICHT} />
            <rect x="13.6" y="0.6" width="11.8" height="4.8" fill={STEEN_DONKER} />
            <rect x="-5.4" y="6.6" width="11.8" height="4.8" fill={STEEN_DONKER} />
            <rect x="7.6" y="6.6" width="11.8" height="4.8" fill={STEEN_LICHT} />
            <rect x="20.6" y="6.6" width="11.8" height="4.8" fill={STEEN_DONKER} />
          </pattern>
        ))}

        {/* Dakpannen: rijen met een golving, meegekanteld met het dakvlak. */}
        <pattern
          id={pannen}
          width="18"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform={`skewY(${HOEK_DAK})`}
        >
          <rect width="18" height="14" fill={PAN_DONKER} />
          <path d="M0 13 h18" stroke="#2C333D" strokeWidth="1.4" fill="none" />
          <path
            d="M1 13 v-9 a4 4 0 0 1 8 0 v9"
            fill="none"
            stroke={PAN_LICHT}
            strokeWidth="1.6"
          />
          <path
            d="M10 13 v-9 a4 4 0 0 1 8 0 v9"
            fill="none"
            stroke={PAN_LICHT}
            strokeWidth="1.6"
          />
        </pattern>

        {/* Isolatie: warme arcering. */}
        <pattern
          id={isolatie}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="9" height="9" fill="hsl(var(--accent) / 0.85)" />
          <line x1="0" y1="0" x2="0" y2="9" stroke="#B8892A" strokeWidth="2.6" />
        </pattern>

        <linearGradient id={glas} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#9FC6DC" />
          <stop offset="45%" stopColor="#D8E9F2" />
          <stop offset="46%" stopColor="#B6D3E4" />
          <stop offset="100%" stopColor="#8FB6CE" />
        </linearGradient>

        <radialGradient id={schaduw}>
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.22)" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
        </radialGradient>
      </defs>

      {/* Slagschaduw op de grond */}
      <ellipse cx="255" cy="330" rx="200" ry="34" fill={`url(#${schaduw})`} />

      {/* ---------- VLOER: isolatie onder de woning ---------- */}
      <polygon
        className="schil-overgang"
        points={pad(A, B, C, [C[0], C[1] + 12], [B[0], B[1] + 12], [A[0], A[1] + 12])}
        fill={`url(#${isolatie})`}
        stroke="#B8892A"
        strokeWidth="1"
        style={{ opacity: aan("vloer") ? 1 : 0 }}
      />

      {/* ---------- GEVELS ---------- */}
      {/* linkervlak */}
      <polygon points={pad(A, B, Bh, Ah)} fill={`url(#${steenL})`} />
      <polygon points={pad(A, B, Bh, Ah)} fill="hsl(var(--primary) / 0.16)" />
      {/* rechtervlak, dat meer licht vangt */}
      <polygon points={pad(B, C, Ch, Bh)} fill={`url(#${steenR})`} />
      <polygon points={pad(B, C, Ch, Bh)} fill="hsl(0 0% 100% / 0.1)" />

      {/* Gevelisolatie: laag ín het gevelvlak, direct onder de dakvoet. */}
      <polygon
        className="schil-overgang"
        points={pad(Ah, Bh, [Bh[0], Bh[1] + 12], [Ah[0], Ah[1] + 12])}
        fill={`url(#${isolatie})`}
        stroke="#B8892A"
        strokeWidth="1"
        style={{ opacity: gevelAan ? 1 : 0 }}
      />
      <polygon
        className="schil-overgang"
        points={pad(Bh, Ch, [Ch[0], Ch[1] + 12], [Bh[0], Bh[1] + 12])}
        fill={`url(#${isolatie})`}
        stroke="#B8892A"
        strokeWidth="1"
        style={{ opacity: gevelAan ? 1 : 0 }}
      />

      {/* ---------- RAMEN EN DEUR ---------- */}
      {/* linkergevel: twee ramen */}
      {[
        [0.16, 0.4],
        [0.56, 0.8],
      ].map(([u1, u2]) => (
        <g key={`l${u1}`}>
          <polygon points={vlakVorm(A, BREEDTE_LINKS, u1, u2, 0.36, 0.78)} fill={KOZIJN} />
          <polygon
            className="schil-overgang"
            points={vlakVorm(A, BREEDTE_LINKS, u1 + 0.028, u2 - 0.028, 0.4, 0.74)}
            fill={aan("glas") ? `url(#${glas})` : "#C6C9C4"}
            stroke={aan("glas") ? "#6E9BB5" : "#A9ADA8"}
            strokeWidth="1.2"
          />
          {/* tweede ruit, alleen bij HR++ */}
          <polygon
            className="schil-overgang"
            points={vlakVorm(A, BREEDTE_LINKS, u1 + 0.05, u2 - 0.05, 0.44, 0.7)}
            fill="none"
            stroke="#6E9BB5"
            strokeWidth="1"
            style={{ opacity: aan("glas") ? 1 : 0 }}
          />
        </g>
      ))}

      {/* rechtergevel: raam plus voordeur */}
      <g>
        <polygon points={vlakVorm(B, BREEDTE_RECHTS, 0.12, 0.42, 0.36, 0.78)} fill={KOZIJN} />
        <polygon
          className="schil-overgang"
          points={vlakVorm(B, BREEDTE_RECHTS, 0.15, 0.39, 0.4, 0.74)}
          fill={aan("glas") ? `url(#${glas})` : "#C6C9C4"}
          stroke={aan("glas") ? "#6E9BB5" : "#A9ADA8"}
          strokeWidth="1.2"
        />
        <polygon
          className="schil-overgang"
          points={vlakVorm(B, BREEDTE_RECHTS, 0.17, 0.37, 0.44, 0.7)}
          fill="none"
          stroke="#6E9BB5"
          strokeWidth="1"
          style={{ opacity: aan("glas") ? 1 : 0 }}
        />
      </g>
      <polygon points={vlakVorm(B, BREEDTE_RECHTS, 0.6, 0.82, 0, 0.58)} fill="#2F4A63" />
      <polygon points={vlakVorm(B, BREEDTE_RECHTS, 0.63, 0.79, 0.04, 0.54)} fill="#3B5C79" />
      <circle
        {...(() => {
          const [cx, cy] = opVlak(B, BREEDTE_RECHTS, HOOGTE, 0.645, 0.28);
          return { cx, cy, r: 2.4 };
        })()}
        fill="#D8C48A"
      />

      {/* ---------- DAK ---------- */}
      {/* voorvlak */}
      <polygon points={pad(Ah, Bh, NokVoor, NokAchter)} fill={`url(#${pannen})`} />
      <polygon points={pad(Ah, Bh, NokVoor, NokAchter)} fill="hsl(var(--primary) / 0.1)" />
      {/* rechter dakschild */}
      <polygon points={pad(Bh, Ch, NokVoor)} fill={`url(#${pannen})`} />
      <polygon points={pad(Bh, Ch, NokVoor)} fill="hsl(0 0% 100% / 0.07)" />
      {/* nok */}
      <polyline
        points={pad(NokAchter, NokVoor)}
        fill="none"
        stroke="#2C333D"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Dakisolatie: laag tegen de onderkant van het dakvlak, dus in beeld net
          bóven de dakvoet. */}
      <polygon
        className="schil-overgang"
        points={pad(Ah, Bh, [Bh[0], Bh[1] - 12], [Ah[0], Ah[1] - 12])}
        fill={`url(#${isolatie})`}
        stroke="#B8892A"
        strokeWidth="1"
        style={{ opacity: aan("dak") ? 1 : 0 }}
      />
      <polygon
        className="schil-overgang"
        points={pad(Bh, Ch, [Ch[0], Ch[1] - 12], [Bh[0], Bh[1] - 12])}
        fill={`url(#${isolatie})`}
        stroke="#B8892A"
        strokeWidth="1"
        style={{ opacity: aan("dak") ? 1 : 0 }}
      />

      {/* Schoorsteen */}
      <g>
        <polygon points={pad([206, 118], [230, 124], [230, 92], [206, 86])} fill={STEEN_DONKER} />
        <polygon points={pad([206, 86], [230, 92], [236, 86], [212, 80])} fill="#8E664C" />
      </g>

      {/* ---------- WARMTE DIE ONTSNAPT ---------- */}
      <Pijl x={250} y={70} richting="op" zichtbaar={lek(!aan("dak"))} />
      <Pijl x={300} y={82} richting="op" zichtbaar={lek(!aan("dak"))} />
      <Pijl x={352} y={96} richting="op" zichtbaar={lek(!aan("dak"))} />
      <Pijl x={72} y={236} richting="links" zichtbaar={lek(!gevelAan)} />
      <Pijl x={72} y={276} richting="links" zichtbaar={lek(!gevelAan)} />
      <Pijl x={434} y={214} richting="rechts" zichtbaar={lek(!gevelAan)} />
      <Pijl x={434} y={250} richting="rechts" zichtbaar={lek(!gevelAan)} />
      {/* Bij de ramen: net boven het kozijn, dus op de gevel en niet op het dak. */}
      <Pijl x={146} y={206} richting="op" zichtbaar={lek(!aan("glas"))} kort />
      <Pijl x={312} y={216} richting="op" zichtbaar={lek(!aan("glas"))} kort />
      <Pijl x={190} y={352} richting="neer" zichtbaar={lek(!aan("vloer"))} />
      <Pijl x={330} y={344} richting="neer" zichtbaar={lek(!aan("vloer"))} />
    </svg>
  );
};

const Pijl = ({
  x,
  y,
  richting,
  zichtbaar,
  kort = false,
}: {
  x: number;
  y: number;
  richting: "op" | "neer" | "links" | "rechts";
  zichtbaar: number;
  kort?: boolean;
}) => {
  const l = kort ? 13 : 22;
  const d: Record<typeof richting, string> = {
    op: `M${x} ${y + l} L${x} ${y} M${x - 5} ${y + 6} L${x} ${y} L${x + 5} ${y + 6}`,
    neer: `M${x} ${y - l} L${x} ${y} M${x - 5} ${y - 6} L${x} ${y} L${x + 5} ${y - 6}`,
    links: `M${x + l} ${y} L${x} ${y} M${x + 6} ${y - 5} L${x} ${y} L${x + 6} ${y + 5}`,
    rechts: `M${x - l} ${y} L${x} ${y} M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`,
  };
  return (
    <path
      className="schil-overgang"
      d={d[richting]}
      stroke={WARM}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{ opacity: zichtbaar }}
      aria-hidden="true"
    />
  );
};
