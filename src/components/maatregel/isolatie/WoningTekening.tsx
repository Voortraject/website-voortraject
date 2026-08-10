import { useId } from "react";

import type { MaatregelId } from "@/data/isolatie";

/**
 * De woning als opengewerkte isometrische tekening.
 *
 * De rechterkant is opengesneden. Daardoor kijk je in de opbouw van dak, gevel
 * en vloer, en dat is precies waar isolatie zit: tussen de lagen, van buiten
 * onzichtbaar. Zet je een maatregel aan, dan vult de isolatie de laag waar hij
 * hoort. Een gouden streep op de buitenkant zou nergens op slaan.
 *
 * Alle punten komen uit één functie `P(a, b, z)`: a loopt langs de voorgevel,
 * b de diepte in, z omhoog. Zo staan gevel, dak, snede en ramen op hetzelfde
 * assenstelsel en kan er niets scheef lopen.
 */

type Punt = [number, number];

/* ---------- assenstelsel ---------- */

const O: Punt = [64, 296];   // voor-links-onder
const U: Punt = [190, 42];   // langs de voorgevel, naar rechtsonder
const V: Punt = [96, -48];   // de diepte in, naar rechtsboven
const H = 104;               // muurhoogte
const NOK = 58;              // nok boven de muur

const P = (a: number, b: number, z: number): Punt => [
  O[0] + U[0] * a + V[0] * b,
  O[1] + U[1] * a + V[1] * b - z,
];

const pad = (...punten: Punt[]) =>
  punten.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Hellingshoek van een richting, voor patternTransform. */
const hoek = ([dx, dy]: Punt) => (Math.atan2(dy, dx) * 180) / Math.PI;

const HOEK_GEVEL = hoek(U);
const HOEK_SNEDE = hoek(V);

/* ---------- kleuren ---------- */

const STEEN = "#BB8C69";
const STEEN_DONKER = "#9D7051";
const VOEG = "#DDCAB7";
const PAN = "#454E5C";
const PAN_LICHT = "#636D7D";
const PAN_DONKER = "#2B323C";
const KOZIJN = "#F6F3ED";
const KOZIJN_SCHADUW = "#D4CEC2";
const BINNEN = "#FBF8F2";
const HOUT = "#C4A075";
const HOUT_DONKER = "#A8834F";
const BETON = "#BDB6A9";
const WARM = "#C0392B";
const LIJN = "hsl(var(--primary) / 0.5)";

/** Diktes van de lagen in de snede. */
const VLOER_DIK = 21;
const MUUR_DIK = 0.13; // in delen van de diepte
const DAK_DIK = 22;

export const WoningTekening = ({ gekozen }: { gekozen: Set<MaatregelId> }) => {
  const id = useId();
  const steen = `${id}-steen`;
  const steenSnede = `${id}-steen-snede`;
  const pannen = `${id}-pannen`;
  const wol = `${id}-wol`;
  const glas = `${id}-glas`;
  const grond = `${id}-grond`;

  const aan = (m: MaatregelId) => gekozen.has(m);
  const gevelAan = aan("spouw") || aan("gevel");
  const lek = (open: boolean) => (open ? 0.85 : 0);

  const voorOnderL = P(0, 0, 0);
  const voorOnderR = P(1, 0, 0);
  const voorTopL = P(0, 0, H);
  const voorTopR = P(1, 0, H);
  const achterOnderR = P(1, 1, 0);
  const achterTopR = P(1, 1, H);
  const nokSnede = P(1, 0.5, H + NOK);
  const nokAchter = P(0, 0.5, H + NOK);

  // Dakvlak met overstek: iets voorbij de gevel en iets lager dan de muur.
  const dakVoorL = P(-0.02, -0.08, H - 5);
  const dakVoorR = P(1, -0.08, H - 5);

  const beschrijving =
    gekozen.size === 0
      ? "Opengewerkte tekening van een woning zonder isolatie: dak, gevel en vloer zijn nog lege constructies en de warmte ontsnapt naar buiten"
      : `Opengewerkte tekening van een woning met isolatie in: ${[...gekozen].join(", ")}`;

  return (
    <svg viewBox="14 74 372 296" className="w-full h-auto" role="img" aria-label={beschrijving}>
      <defs>
        {/* Metselwerk op de voorgevel, meegekanteld met het vlak. */}
        <pattern
          id={steen}
          width="30"
          height="13"
          patternUnits="userSpaceOnUse"
          patternTransform={`skewY(${HOEK_GEVEL})`}
        >
          <rect width="30" height="13" fill={VOEG} />
          <rect x="0.7" y="0.8" width="13.6" height="4.9" fill={STEEN} />
          <rect x="15.7" y="0.8" width="13.6" height="4.9" fill={STEEN_DONKER} />
          <rect x="-6.8" y="7.3" width="13.6" height="4.9" fill={STEEN_DONKER} />
          <rect x="8.2" y="7.3" width="13.6" height="4.9" fill={STEEN} />
          <rect x="23.2" y="7.3" width="13.6" height="4.9" fill={STEEN_DONKER} />
        </pattern>

        {/* Metselwerk in de snede, dat de andere kant op loopt. */}
        <pattern
          id={steenSnede}
          width="11"
          height="13"
          patternUnits="userSpaceOnUse"
          patternTransform={`skewY(${HOEK_SNEDE})`}
        >
          <rect width="11" height="13" fill={VOEG} />
          <rect x="0.8" y="0.8" width="9.4" height="4.9" fill={STEEN} />
          <rect x="0.8" y="7.3" width="9.4" height="4.9" fill={STEEN_DONKER} />
        </pattern>

        {/* Dakpannen: verticale welvingen met een schaduwlijn per rij. */}
        <pattern
          id={pannen}
          width="15"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform={`skewY(${HOEK_GEVEL})`}
        >
          <rect width="15" height="12" fill={PAN} />
          <rect x="1" y="0" width="5.4" height="12" fill={PAN_LICHT} />
          <rect x="8.6" y="0" width="5.4" height="12" fill={PAN_LICHT} />
          <rect x="0" y="0" width="15" height="2.4" fill={PAN_DONKER} />
        </pattern>

        {/* Isolatiewol: golvende vezels, herkenbaar als isolatie. */}
        <pattern id={wol} width="12" height="10" patternUnits="userSpaceOnUse">
          <rect width="12" height="10" fill="hsl(var(--accent) / 0.9)" />
          <path d="M0 3 q3 -3.4 6 0 q3 3.4 6 0" fill="none" stroke="#A8791C" strokeWidth="1.4" />
          <path d="M0 8 q3 -3.4 6 0 q3 3.4 6 0" fill="none" stroke="#A8791C" strokeWidth="1.4" />
        </pattern>

        <linearGradient id={glas} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#A8CEE2" />
          <stop offset="38%" stopColor="#E4F1F8" />
          <stop offset="40%" stopColor="#BAD8E8" />
          <stop offset="100%" stopColor="#89B1CA" />
        </linearGradient>

        <radialGradient id={grond}>
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
        </radialGradient>
      </defs>

      <ellipse cx="205" cy="330" rx="165" ry="32" fill={`url(#${grond})`} />

      {/* ============ DE SNEDE: hier zie je de opbouw ============ */}
      <polygon
        points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)}
        fill={BINNEN}
      />

      {/* vloeropbouw */}
      <polygon
        points={pad(P(1, 0, 0), P(1, 1, 0), P(1, 1, VLOER_DIK), P(1, 0, VLOER_DIK))}
        fill={BETON}
        stroke={LIJN}
        strokeWidth="1.2"
      />
      <polygon
        className="schil-overgang"
        points={pad(P(1, 0, 2), P(1, 1, 2), P(1, 1, 13), P(1, 0, 13))}
        fill={`url(#${wol})`}
        style={{ opacity: aan("vloer") ? 1 : 0 }}
      />

      {/* muuropbouw: buitenblad, spouw, binnenblad */}
      {[
        { van: 0, tot: MUUR_DIK },
        { van: 1 - MUUR_DIK, tot: 1 },
      ].map(({ van, tot }) => {
        const spouwVan = van + (tot - van) * 0.34;
        const spouwTot = van + (tot - van) * 0.7;
        const hoekpunten = (b1: number, b2: number) =>
          pad(P(1, b1, VLOER_DIK), P(1, b2, VLOER_DIK), P(1, b2, H), P(1, b1, H));
        return (
          <g key={van}>
            <polygon points={hoekpunten(van, tot)} fill={`url(#${steenSnede})`} />
            {/* de spouw: leeg tot je hem isoleert */}
            <polygon points={hoekpunten(spouwVan, spouwTot)} fill="#EFE9DF" />
            <polygon
              className="schil-overgang"
              points={hoekpunten(spouwVan, spouwTot)}
              fill={`url(#${wol})`}
              style={{ opacity: gevelAan ? 1 : 0 }}
            />
            <polygon points={hoekpunten(van, tot)} fill="none" stroke={LIJN} strokeWidth="1.2" />
          </g>
        );
      })}

      {/* dakopbouw: twee schuine lagen naar de nok */}
      {[
        { vanB: 0, vanZ: H },
        { vanB: 1, vanZ: H },
      ].map(({ vanB, vanZ }, i) => (
        <g key={i}>
          <polygon
            points={pad(
              P(1, vanB, vanZ),
              P(1, 0.5, H + NOK),
              P(1, 0.5, H + NOK - DAK_DIK),
              P(1, vanB, vanZ - DAK_DIK),
            )}
            fill={HOUT}
            stroke={HOUT_DONKER}
            strokeWidth="1.4"
          />
          <polygon
            className="schil-overgang"
            points={pad(
              P(1, vanB, vanZ - 4),
              P(1, 0.5, H + NOK - 4),
              P(1, 0.5, H + NOK - DAK_DIK + 4),
              P(1, vanB, vanZ - DAK_DIK + 4),
            )}
            fill={`url(#${wol})`}
            style={{ opacity: aan("dak") ? 1 : 0 }}
          />
        </g>
      ))}

      {/* omtrek van de snede */}
      <polygon
        points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)}
        fill="none"
        stroke={LIJN}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ============ VOORGEVEL ============ */}
      <polygon points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)} fill={`url(#${steen})`} />
      <polygon
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill="hsl(var(--primary) / 0.09)"
      />

      {[
        { a1: 0.07, a2: 0.28 },
        { a1: 0.36, a2: 0.57 },
      ].map(({ a1, a2 }) => (
        <g key={a1}>
          <polygon
            points={pad(P(a1 - 0.009, 0, 30), P(a2 + 0.009, 0, 30), P(a2 + 0.009, 0, 35), P(a1 - 0.009, 0, 35))}
            fill="#EDE7DA"
            stroke={KOZIJN_SCHADUW}
            strokeWidth="0.8"
          />
          <polygon
            points={pad(P(a1, 0, 35), P(a2, 0, 35), P(a2, 0, 85), P(a1, 0, 85))}
            fill={KOZIJN}
            stroke={KOZIJN_SCHADUW}
            strokeWidth="1"
          />
          <polygon
            className="schil-overgang"
            points={pad(
              P(a1 + 0.014, 0, 40),
              P(a2 - 0.014, 0, 40),
              P(a2 - 0.014, 0, 80),
              P(a1 + 0.014, 0, 80),
            )}
            fill={aan("glas") ? `url(#${glas})` : "#C9CBC6"}
            stroke={aan("glas") ? "#6E9BB5" : "#A8ACA6"}
            strokeWidth="1.2"
          />
          <polygon
            className="schil-overgang"
            points={pad(
              P(a1 + 0.026, 0, 44),
              P(a2 - 0.026, 0, 44),
              P(a2 - 0.026, 0, 76),
              P(a1 + 0.026, 0, 76),
            )}
            fill="none"
            stroke="#6E9BB5"
            strokeWidth="1"
            style={{ opacity: aan("glas") ? 1 : 0 }}
          />
        </g>
      ))}

      {/* Voordeur */}
      <polygon points={pad(P(0.68, 0, 0), P(0.85, 0, 0), P(0.85, 0, 74), P(0.68, 0, 74))} fill="#2D4761" />
      <polygon
        points={pad(P(0.697, 0, 5), P(0.833, 0, 5), P(0.833, 0, 69), P(0.697, 0, 69))}
        fill="none"
        stroke="#44627F"
        strokeWidth="1.5"
      />
      <circle {...(() => { const [cx, cy] = P(0.822, 0, 37); return { cx, cy, r: 2.3 }; })()} fill="#D9C48C" />

      {/* Hoeklijnen, zodat het volume afleesbaar blijft */}
      <line x1={voorOnderR[0]} y1={voorOnderR[1]} x2={voorTopR[0]} y2={voorTopR[1]} stroke={LIJN} strokeWidth="2.2" />
      <line x1={voorOnderL[0]} y1={voorOnderL[1]} x2={voorOnderR[0]} y2={voorOnderR[1]} stroke={LIJN} strokeWidth="1.6" />
      <line x1={voorOnderL[0]} y1={voorOnderL[1]} x2={voorTopL[0]} y2={voorTopL[1]} stroke={LIJN} strokeWidth="1.4" />

      {/* ============ DAK ============ */}
      {/* onderkant van het overstek: geeft het dak dikte */}
      <polygon points={pad(dakVoorL, dakVoorR, voorTopR, voorTopL)} fill="#8B8375" />
      <polygon points={pad(dakVoorL, dakVoorR, nokSnede, nokAchter)} fill={`url(#${pannen})`} />
      <polygon
        points={pad(dakVoorL, dakVoorR, nokSnede, nokAchter)}
        fill="hsl(var(--primary) / 0.05)"
      />
      <polygon
        points={pad(dakVoorL, dakVoorR, nokSnede, nokAchter)}
        fill="none"
        stroke={LIJN}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* boeiboord langs de dakvoet */}
      <polygon
        points={pad(dakVoorL, dakVoorR, [dakVoorR[0], dakVoorR[1] + 7], [dakVoorL[0], dakVoorL[1] + 7])}
        fill="#F2EEE5"
        stroke={LIJN}
        strokeWidth="1"
      />
      {/* nokvorst */}
      <polygon
        points={pad(nokAchter, nokSnede, [nokSnede[0], nokSnede[1] - 7], [nokAchter[0], nokAchter[1] - 7])}
        fill={PAN_DONKER}
      />

      {/* Schoorsteen */}
      {(() => {
        const [x, y] = P(0.32, 0.5, H + NOK - 4);
        return (
          <g>
            <polygon points={pad([x, y], [x + 21, y + 5], [x + 21, y - 32], [x, y - 37])} fill={STEEN_DONKER} />
            <polygon points={pad([x, y - 37], [x + 21, y - 32], [x + 27, y - 37], [x + 6, y - 42])} fill="#7E5C42" />
          </g>
        );
      })()}

      {/* ============ WARMTE DIE ONTSNAPT ============ */}
      {/* Boven het dakvlak, langs de schoorsteen heen. */}
      <Pijl x={140} y={96} richting="op" zichtbaar={lek(!aan("dak"))} />
      <Pijl x={240} y={118} richting="op" zichtbaar={lek(!aan("dak"))} />
      <Pijl x={272} y={126} richting="op" zichtbaar={lek(!aan("dak"))} />
      {/* Weerszijden van de woning. */}
      <Pijl x={40} y={228} richting="links" zichtbaar={lek(!gevelAan)} />
      <Pijl x={40} y={262} richting="links" zichtbaar={lek(!gevelAan)} />
      <Pijl x={370} y={212} richting="rechts" zichtbaar={lek(!gevelAan)} />
      <Pijl x={370} y={250} richting="rechts" zichtbaar={lek(!gevelAan)} />
      {/* Net boven de kozijnen. */}
      <Pijl x={97} y={210} richting="op" zichtbaar={lek(!aan("glas"))} kort />
      <Pijl x={152} y={222} richting="op" zichtbaar={lek(!aan("glas"))} kort />
      {/* Onder de vloer. */}
      <Pijl x={150} y={340} richting="neer" zichtbaar={lek(!aan("vloer"))} />
      <Pijl x={292} y={352} richting="neer" zichtbaar={lek(!aan("vloer"))} />
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
