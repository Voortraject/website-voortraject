import { useId } from "react";

import type { MaatregelId } from "@/data/isolatie";

/**
 * De woning als opengewerkte isometrische tekening.
 *
 * De rechterkant is opengesneden, want isolatie zit tussen de lagen en is van
 * buiten niet te zien. In de snede vult de isolatie de laag waar hij hoort.
 * Daarnaast verandert de buitenkant waar dat in het echt ook gebeurt:
 * gevelisolatie aan de buitenkant geeft de gevel een stuclaag, terwijl
 * spouwisolatie onzichtbaar blijft en alleen als markering oplicht.
 *
 * Alle punten komen uit één functie `P(a, b, z)`: a loopt langs de voorgevel,
 * b de diepte in, z omhoog. De dakpannen worden als echt raster over het
 * dakvlak gelegd (rijen plus pankolommen), niet als geskewd patroon: alleen zo
 * lopen ze mee met het perspectief.
 */

type Punt = [number, number];

/* ---------- assenstelsel ---------- */

const O: Punt = [64, 296];   // voor-links-onder
const U: Punt = [190, 42];   // langs de voorgevel, naar rechtsonder
const V: Punt = [96, -48];   // de diepte in, naar rechtsboven
const H = 104;               // muurhoogte
const NOK = 58;              // nok boven de muur
const OVERSTEK = 0.08;       // hoever het dak voorbij de gevel steekt

const P = (a: number, b: number, z: number): Punt => [
  O[0] + U[0] * a + V[0] * b,
  O[1] + U[1] * a + V[1] * b - z,
];

/** Punt op het dakvlak: a langs de nok, t van dakvoet (0) naar nok (1). */
const D = (a: number, t: number): Punt =>
  P(a, -OVERSTEK + t * (0.5 + OVERSTEK), H - 5 + t * (NOK + 5));

const pad = (...punten: Punt[]) =>
  punten.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const hoek = ([dx, dy]: Punt) => (Math.atan2(dy, dx) * 180) / Math.PI;
const HOEK_GEVEL = hoek(U);
const HOEK_SNEDE = hoek(V);

/* ---------- kleuren ---------- */

const STEEN = "#BB8C69";
const STEEN_DONKER = "#9D7051";
const VOEG = "#DDCAB7";
const STUC = "#E8E0D2";
const STUC_DONKER = "#D3C8B4";
const PAN = "#4A5361";
const PAN_LICHT = "#6B7585";
const PAN_DONKER = "#2A313B";
const PAN_VOEG = "#232932";
const KOZIJN = "#F6F3ED";
const KOZIJN_SCHADUW = "#D4CEC2";
const BINNEN = "#FBF8F2";
const HOUT = "#C4A075";
const HOUT_DONKER = "#A8834F";
const BETON = "#BDB6A9";
const WARM = "#C0392B";
/** Waar de stroom de woning verlaat is hij het heetst, en dus lichter. */
const WARM_HEET = "#E2673A";
const LIJN = "hsl(var(--primary) / 0.5)";

/** Diktes van de lagen in de snede. */
const VLOER_DIK = 21;
const MUUR_DIK = 0.13;
const DAK_DIK = 22;

/** Aantal pannenrijen en pankolommen op het dakvlak. */
const RIJEN = 8;
const KOLOMMEN = 22;

/* ---------- warmte die ontsnapt ---------- */

type Richting = "op" | "neer" | "links" | "rechts";

const RICHTINGEN: Record<Richting, Punt> = {
  op: [0, -1],
  neer: [0, 1],
  links: [-1, 0],
  rechts: [1, 0],
};

/** Waar het verloop langs loopt: heet aan de woning, opgelost aan het eind. */
const VERLOOP_AS: Record<Richting, { x1: number; y1: number; x2: number; y2: number }> = {
  op: { x1: 0, y1: 1, x2: 0, y2: 0 },
  neer: { x1: 0, y1: 0, x2: 0, y2: 1 },
  links: { x1: 1, y1: 0, x2: 0, y2: 0 },
  rechts: { x1: 0, y1: 0, x2: 1, y2: 0 },
};

/**
 * Een golvende warmtestroom vanaf (x, y) naar buiten.
 *
 * Twee bochten om de as heen, zodat hij leest als opstijgende warmte en niet
 * als een streep. De stroom loopt van de woning af; dat is ook de richting
 * waarin het verloop vervaagt en waarin de streepjes bewegen.
 */
const stroompad = (x: number, y: number, richting: Richting, lengte: number, golf: number) => {
  const [dx, dy] = RICHTINGEN[richting];
  const [px, py] = [-dy, dx];
  const punt = (t: number, zij: number): Punt => [
    x + dx * lengte * t + px * golf * zij,
    y + dy * lengte * t + py * golf * zij,
  ];
  const [c1x, c1y] = punt(0.36, 1);
  const [c2x, c2y] = punt(0.68, -1);
  const [ex, ey] = punt(1, 0);
  return `M${x.toFixed(1)} ${y.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
};

export const WoningTekening = ({ gekozen }: { gekozen: Set<MaatregelId> }) => {
  const id = useId();
  const steen = `${id}-steen`;
  const steenSnede = `${id}-steen-snede`;
  const stuc = `${id}-stuc`;
  const wol = `${id}-wol`;
  const glas = `${id}-glas`;
  const grond = `${id}-grond`;
  const warmte = `${id}-warmte`;

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

  const beschrijving =
    gekozen.size === 0
      ? "Opengewerkte tekening van een woning zonder isolatie: dak, gevel en vloer zijn nog lege constructies en de warmte ontsnapt naar buiten"
      : `Opengewerkte tekening van een woning met isolatie in: ${[...gekozen].join(", ")}`;

  return (
    // Het kader loopt boven en rechts ruimer door dan de woning nodig heeft:
    // de warmtestromen zijn langer dan de pijlen die er stonden en werden
    // anders afgesneden. De verhouding blijft vrijwel gelijk (386/306 tegen
    // 372/296), dus de woning staat er even groot in, alleen beter gecentreerd.
    <svg viewBox="14 64 386 306" className="w-full h-auto" role="img" aria-label={beschrijving}>
      <defs>
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

        {/* Stucwerk: zo ziet een gevel eruit die aan de buitenkant is geïsoleerd. */}
        <pattern
          id={stuc}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform={`skewY(${HOEK_GEVEL})`}
        >
          <rect width="7" height="7" fill={STUC} />
          <circle cx="1.6" cy="2.2" r="0.6" fill={STUC_DONKER} />
          <circle cx="4.8" cy="5.1" r="0.6" fill={STUC_DONKER} />
        </pattern>

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

        {/* Eén verloop per richting: de stroom is heet waar hij de woning
            verlaat en lost aan het eind op in het niets. Het verloop ligt op de
            omhullende van het pad, dus elke stroom vervaagt over zijn eigen
            lengte. */}
        {(Object.keys(VERLOOP_AS) as Richting[]).map((richting) => (
          <linearGradient key={richting} id={`${warmte}-${richting}`} {...VERLOOP_AS[richting]}>
            <stop offset="0%" stopColor={WARM_HEET} stopOpacity="0.95" />
            <stop offset="45%" stopColor={WARM} stopOpacity="0.6" />
            <stop offset="100%" stopColor={WARM} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      <ellipse cx="205" cy="330" rx="165" ry="32" fill={`url(#${grond})`} />

      {/* ============ SNEDE: hier zie je de opbouw ============ */}
      <polygon points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)} fill={BINNEN} />

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
        const vlak = (b1: number, b2: number) =>
          pad(P(1, b1, VLOER_DIK), P(1, b2, VLOER_DIK), P(1, b2, H), P(1, b1, H));
        return (
          <g key={van}>
            <polygon points={vlak(van, tot)} fill={`url(#${steenSnede})`} />
            <polygon points={vlak(spouwVan, spouwTot)} fill="#EFE9DF" />
            <polygon
              className="schil-overgang"
              points={vlak(spouwVan, spouwTot)}
              fill={`url(#${wol})`}
              style={{ opacity: gevelAan ? 1 : 0 }}
            />
            <polygon points={vlak(van, tot)} fill="none" stroke={LIJN} strokeWidth="1.2" />
          </g>
        );
      })}

      {/* dakopbouw naar de nok */}
      {[0, 1].map((vanB) => (
        <g key={vanB}>
          <polygon
            points={pad(
              P(1, vanB, H),
              P(1, 0.5, H + NOK),
              P(1, 0.5, H + NOK - DAK_DIK),
              P(1, vanB, H - DAK_DIK),
            )}
            fill={HOUT}
            stroke={HOUT_DONKER}
            strokeWidth="1.4"
          />
          <polygon
            className="schil-overgang"
            points={pad(
              P(1, vanB, H - 4),
              P(1, 0.5, H + NOK - 4),
              P(1, 0.5, H + NOK - DAK_DIK + 4),
              P(1, vanB, H - DAK_DIK + 4),
            )}
            fill={`url(#${wol})`}
            style={{ opacity: aan("dak") ? 1 : 0 }}
          />
        </g>
      ))}

      <polygon
        points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)}
        fill="none"
        stroke={LIJN}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ============ VOORGEVEL ============ */}
      <polygon points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)} fill={`url(#${steen})`} />
      {/* Gevelisolatie buitenom: de gevel krijgt een stuclaag. Dat is het enige
          dat je van isolatie aan de buitenkant écht ziet. */}
      <polygon
        className="schil-overgang"
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill={`url(#${stuc})`}
        style={{ opacity: aan("gevel") ? 1 : 0 }}
      />
      {/* Spouwisolatie blijft onzichtbaar; een warme waas markeert dat de muren
          nu wél geïsoleerd zijn. */}
      <polygon
        className="schil-overgang"
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill="hsl(var(--accent) / 0.3)"
        style={{ opacity: aan("spouw") ? 1 : 0 }}
      />
      <polygon
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill="hsl(var(--primary) / 0.09)"
      />

      {/* Ramen */}
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
            points={pad(P(a1 + 0.014, 0, 40), P(a2 - 0.014, 0, 40), P(a2 - 0.014, 0, 80), P(a1 + 0.014, 0, 80))}
            fill={aan("glas") ? `url(#${glas})` : "#C9CBC6"}
            stroke={aan("glas") ? "#6E9BB5" : "#A8ACA6"}
            strokeWidth="1.2"
          />
          <polygon
            className="schil-overgang"
            points={pad(P(a1 + 0.026, 0, 44), P(a2 - 0.026, 0, 44), P(a2 - 0.026, 0, 76), P(a1 + 0.026, 0, 76))}
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

      <line x1={voorOnderR[0]} y1={voorOnderR[1]} x2={voorTopR[0]} y2={voorTopR[1]} stroke={LIJN} strokeWidth="2.2" />
      <line x1={voorOnderL[0]} y1={voorOnderL[1]} x2={voorOnderR[0]} y2={voorOnderR[1]} stroke={LIJN} strokeWidth="1.6" />
      <line x1={voorOnderL[0]} y1={voorOnderL[1]} x2={voorTopL[0]} y2={voorTopL[1]} stroke={LIJN} strokeWidth="1.4" />

      {/* ============ DAK ============ */}
      {/* onderkant van het overstek */}
      <polygon points={pad(D(0, 0), D(1, 0), voorTopR, voorTopL)} fill="#8B8375" />

      {/* pannenrijen, van dakvoet naar nok */}
      {Array.from({ length: RIJEN }, (_, i) => {
        const t1 = i / RIJEN;
        const t2 = (i + 1) / RIJEN;
        return (
          <polygon
            key={`rij${i}`}
            points={pad(D(0, t1), D(1, t1), D(1, t2), D(0, t2))}
            fill={PAN}
            stroke={PAN_VOEG}
            strokeWidth="1.6"
          />
        );
      })}
      {/* de welving van elke pan: een lichte baan per kolom */}
      {Array.from({ length: KOLOMMEN }, (_, k) => {
        const a1 = k / KOLOMMEN;
        const a2 = a1 + 0.6 / KOLOMMEN;
        return (
          <polygon
            key={`pan${k}`}
            points={pad(D(a1, 0), D(a2, 0), D(a2, 1), D(a1, 1))}
            fill={PAN_LICHT}
            opacity="0.55"
          />
        );
      })}
      {/* pannaden tussen de kolommen */}
      {Array.from({ length: KOLOMMEN + 1 }, (_, k) => {
        const a = k / KOLOMMEN;
        const [x1, y1] = D(a, 0);
        const [x2, y2] = D(a, 1);
        return <line key={`naad${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAN_DONKER} strokeWidth="0.9" />;
      })}
      {/* Dakisolatie zit tussen de spanten en is van buiten net zo onzichtbaar
          als spouwisolatie. Toch hoort het hele dakvlak mee te kleuren en niet
          alleen de snede, anders lijkt er niets te gebeuren: dezelfde warme
          waas dus als bij de spouw. */}
      <polygon
        className="schil-overgang"
        data-laag="dak"
        points={pad(D(0, 0), D(1, 0), D(1, 1), D(0, 1))}
        fill="hsl(var(--accent) / 0.34)"
        style={{ opacity: aan("dak") ? 1 : 0 }}
      />
      <polygon
        points={pad(D(0, 0), D(1, 0), D(1, 1), D(0, 1))}
        fill="hsl(var(--primary) / 0.05)"
      />
      <polygon
        points={pad(D(0, 0), D(1, 0), D(1, 1), D(0, 1))}
        fill="none"
        stroke={LIJN}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* boeiboord langs de dakvoet */}
      <polygon
        points={pad(D(0, 0), D(1, 0), [D(1, 0)[0], D(1, 0)[1] + 7], [D(0, 0)[0], D(0, 0)[1] + 7])}
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
      {/* Boven de nok, langs de schoorsteen heen. */}
      {[
        { a: 0.1, lengte: 38, golf: 6 },
        { a: 0.52, lengte: 46, golf: 7 },
        { a: 0.68, lengte: 32, golf: 5 },
        { a: 0.86, lengte: 42, golf: 6 },
      ].map(({ a, lengte, golf }, i) => {
        const [x, y] = P(a, 0.5, H + NOK);
        return (
          <Stroom
            key={`dak${a}`}
            bron="dak"
            verloop={warmte}
            x={x}
            y={y - 8}
            richting="op"
            lengte={lengte}
            golf={golf}
            zichtbaar={lek(!aan("dak"))}
            vertraging={i * 0.55}
          />
        );
      })}
      {/* Links en rechts van de woning, op muurhoogte. */}
      {[
        { z: 34, lengte: 40 },
        { z: 62, lengte: 32 },
        { z: 86, lengte: 40 },
      ].map(({ z, lengte }, i) => {
        const [x, y] = P(0, 0, z);
        return (
          <Stroom
            key={`l${z}`}
            bron="gevel"
            verloop={warmte}
            x={x - 5}
            y={y}
            richting="links"
            lengte={lengte}
            golf={5}
            zichtbaar={lek(!gevelAan)}
            vertraging={i * 0.6 + 0.2}
          />
        );
      })}
      {[
        { z: 34, lengte: 34 },
        { z: 62, lengte: 40 },
        { z: 86, lengte: 36 },
      ].map(({ z, lengte }, i) => {
        const [x, y] = P(1, 1, z);
        return (
          <Stroom
            key={`r${z}`}
            bron="gevel"
            verloop={warmte}
            x={x + 5}
            y={y}
            richting="rechts"
            lengte={lengte}
            golf={5}
            zichtbaar={lek(!gevelAan)}
            vertraging={i * 0.6 + 1}
          />
        );
      })}
      {/* Uit de ramen omhoog: korter en dunner, want er lekt minder. */}
      {[0.175, 0.465].map((a, i) => {
        const [x, y] = P(a, 0, 85);
        return (
          <Stroom
            key={`g${a}`}
            bron="glas"
            verloop={warmte}
            x={x}
            y={y - 6}
            richting="op"
            lengte={24}
            golf={4}
            breedte={1.9}
            zichtbaar={lek(!aan("glas"))}
            vertraging={i * 0.7 + 0.35}
          />
        );
      })}
      {/* Onder de vloer door. */}
      {[
        { a: 0.3, lengte: 30 },
        { a: 0.62, lengte: 24 },
        { a: 0.9, lengte: 22 },
      ].map(({ a, lengte }, i) => {
        const [x, y] = P(a, 0, 0);
        return (
          <Stroom
            key={`v${a}`}
            bron="vloer"
            verloop={warmte}
            x={x}
            y={y + 8}
            richting="neer"
            lengte={lengte}
            golf={4}
            zichtbaar={lek(!aan("vloer"))}
            vertraging={i * 0.55 + 0.15}
          />
        );
      })}
      {(() => {
        const [x, y] = P(1, 0.55, 0);
        return (
          <Stroom
            bron="vloer"
            verloop={warmte}
            x={x}
            y={y + 8}
            richting="neer"
            lengte={26}
            golf={4}
            zichtbaar={lek(!aan("vloer"))}
            vertraging={1.3}
          />
        );
      })()}
    </svg>
  );
};

/**
 * Eén stroom warmte die de woning verlaat.
 *
 * De beweging komt van streepjes die langs het pad naar buiten schuiven
 * (stroke-dashoffset), niet van het pad zelf: zo lijkt het of er warmte
 * doorheen loopt in plaats van dat er een pijl heen en weer wiebelt. Elke
 * stroom heeft zijn eigen lengte, golf en vertraging, want gelijke stromen op
 * een rij zien er meteen uit als een patroon en niet als warmte.
 */
const Stroom = ({
  bron,
  verloop,
  x,
  y,
  richting,
  lengte,
  golf,
  zichtbaar,
  breedte = 2.6,
  vertraging = 0,
}: {
  /** Het bouwdeel waar deze stroom bij hoort; alleen om op te kunnen testen. */
  bron: string;
  /** Basis-id van de verlopen in defs. */
  verloop: string;
  x: number;
  y: number;
  richting: Richting;
  lengte: number;
  golf: number;
  zichtbaar: number;
  breedte?: number;
  /** Seconden voorsprong, zodat de stromen niet in de pas lopen. */
  vertraging?: number;
}) => (
  <path
    className="schil-overgang warmtestroom"
    data-stroom={bron}
    d={stroompad(x, y, richting, lengte, golf)}
    stroke={`url(#${verloop}-${richting})`}
    strokeWidth={breedte}
    strokeLinecap="round"
    fill="none"
    style={{
      opacity: zichtbaar,
      animationDelay: `${vertraging}s`,
      // Een stroom die niet te zien is hoeft ook niet te stromen.
      animationPlayState: zichtbaar ? "running" : "paused",
    }}
    aria-hidden="true"
  />
);
