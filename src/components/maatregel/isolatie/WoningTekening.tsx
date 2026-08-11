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
const STEEN_LICHT = "#C99B78";
const STEEN_DONKER = "#9D7051";
const VOEG = "#DDCAB7";
const STUC = "#EDE8DD";
const STUC_DONKER = "#D9D2C3";
const PAN = "#4A5361";
const PAN_LICHT = "#6B7585";
const PAN_DONKER = "#2A313B";
const PAN_VOEG = "#232932";
/**
 * Dezelfde pannen, maar warm.
 *
 * Een okerwaas over blauwgrijze pannen levert olijfgroen op, en dat leest als
 * een dak met mos in plaats van een dak dat de warmte binnenhoudt. Vandaar geen
 * waas maar een tweede set kleuren: even donker, alleen warm in plaats van
 * koel. Het dak blijft een dak en wordt toch zichtbaar anders.
 */
const PANNEN_WARM = {
  pan: "#7A6A55",
  licht: "#9C8A6F",
  donker: "#55483A",
  voeg: "#3D3428",
};
const KOZIJN = "#F6F3ED";
const KOZIJN_SCHADUW = "#D4CEC2";
const BINNEN = "#FBF8F2";
const HOUT = "#C4A075";
const HOUT_DONKER = "#A8834F";
const BETON = "#BDB6A9";
/** De onderste laag metselwerk, in donkerder steen dan de rest van de gevel. */
const PLINT = "#96826F";
const PLINT_DONKER = "#7A6959";
/** Goot en regenpijp: zink. */
const ZINK = "#98A0A7";
const ZINK_DONKER = "#6E767D";
/** Muurankers en het beslag van de deur. */
const IJZER = "#5C544A";
/** Loodslabbe rond de schoorsteen. */
const LOOD = "#9DA3A7";
/** De bodem van de kruipruimte, en de kruipruimte zelf. */
const BODEM = "#C7BAA4";
const KRUIPRUIMTE = "#6B665C";
const WARM = "#C0392B";
/** Waar de stroom de woning verlaat is hij het heetst, en dus lichter. */
const WARM_HEET = "#E2673A";
const LIJN = "hsl(var(--primary) / 0.5)";

/**
 * Diktes van de lagen in de snede, gemeten vanaf het maaiveld omhoog.
 *
 * De vloer ligt niet op de grond maar op een kruipruimte, zoals in vrijwel elke
 * naoorlogse woning. Dat is geen decoratie: vloerisolatie hangt ónder de vloer
 * of ligt op de bodem van die kruipruimte, en zonder die ruimte klopt het beeld
 * bij de maatregel niet.
 */
const BODEM_DIK = 5;
const KRUIP_TOT = 15;
const VLOER_DIK = 26;
const VLOER_ISOLATIE = 5;
const MUUR_DIK = 0.13;
const DAK_DIK = 22;

/**
 * Hoogtes op de voorgevel.
 *
 * De goot hangt vóór de gevel en dekt hem vanaf ongeveer z = 81 af. Alles wat
 * daarboven getekend wordt is dus niet te zien: daarom sluiten de ramen en de
 * deur op dezelfde latei af, met hun rollaag er net onder. Dat is ook hoe een
 * doorsnee Nederlandse gevel is gemetseld.
 */
const GOOT_DEKT_VANAF = 81;
const PLINT_HOOG = 13;
const RAAM_ONDER = 35;
const LATEI = 74;
/** Dikte van een rollaag: de laag stenen op hun kant boven een opening. */
const ROLLAAG = 7;

/** Aantal pannenrijen en pankolommen op het dakvlak. */
const RIJEN = 8;
const KOLOMMEN = 22;

/** De openingen in de voorgevel, in dezelfde maat gebruikt door de rollagen. */
const RAMEN = [
  { a1: 0.07, a2: 0.28 },
  { a1: 0.36, a2: 0.57 },
];
const DEUR = { a1: 0.68, a2: 0.85 };

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
  const licht = `${id}-licht`;
  const dakLicht = `${id}-dak-licht`;
  const overstek = `${id}-overstek`;
  const contact = `${id}-contact`;
  const dakGloed = `${id}-dak-gloed`;

  const aan = (m: MaatregelId) => gekozen.has(m);
  const dakAan = gekozen.has("dak");
  const pan = dakAan ? PANNEN_WARM.pan : PAN;
  const panLicht = dakAan ? PANNEN_WARM.licht : PAN_LICHT;
  const panDonker = dakAan ? PANNEN_WARM.donker : PAN_DONKER;
  const panVoeg = dakAan ? PANNEN_WARM.voeg : PAN_VOEG;
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
          {/* Drie tinten door elkaar: met twee leest een muur als een raster,
              met drie als metselwerk. Elke steen krijgt bovendien een lichte
              bovenrand, wat de schaduw in de lintvoeg suggereert. */}
          <rect x="0.7" y="0.8" width="13.6" height="4.9" fill={STEEN} />
          <rect x="15.7" y="0.8" width="13.6" height="4.9" fill={STEEN_DONKER} />
          <rect x="-6.8" y="7.3" width="13.6" height="4.9" fill={STEEN_LICHT} />
          <rect x="8.2" y="7.3" width="13.6" height="4.9" fill={STEEN} />
          <rect x="23.2" y="7.3" width="13.6" height="4.9" fill={STEEN_DONKER} />
          <rect x="0.7" y="0.8" width="13.6" height="1" fill="#FFFFFF" opacity="0.18" />
          <rect x="15.7" y="0.8" width="13.6" height="1" fill="#FFFFFF" opacity="0.14" />
          <rect x="8.2" y="7.3" width="13.6" height="1" fill="#FFFFFF" opacity="0.18" />
          <rect x="23.2" y="7.3" width="13.6" height="1" fill="#FFFFFF" opacity="0.14" />
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
          <circle cx="1.6" cy="2.2" r="0.45" fill={STUC_DONKER} />
          <circle cx="4.8" cy="5.1" r="0.45" fill={STUC_DONKER} />
        </pattern>

        {/* Steenwol. Zachter dan volle oker met dikke golven: dat las als een
            waarschuwingskleur en overstemde alles zodra er iets aanstond. */}
        <pattern id={wol} width="10" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill="#E8CF9A" />
          <path d="M0 2.4 q2.5 -2.5 5 0 q2.5 2.5 5 0" fill="none" stroke="#C3A059" strokeWidth="0.85" />
          <path d="M0 6.4 q2.5 -2.5 5 0 q2.5 2.5 5 0" fill="none" stroke="#C3A059" strokeWidth="0.85" />
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

        {/* Licht valt van linksboven. Dat maakt drie dingen nodig die een
            vlakke tekening niet heeft: een gevel die naar beneden wegloopt, een
            dakvlak dat naar de nok toe oplicht, en schaduw waar iets over iets
            anders heen steekt. */}
        <linearGradient id={licht} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={dakLicht} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.16" />
        </linearGradient>
        {/* Slagschaduw van het overstek op de gevel: hard bovenaan, weg na een
            paar steenlagen. */}
        <linearGradient id={overstek} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        {/* Warmte die onder de pannen blijft hangen, sterkst bij de nok. */}
        <linearGradient id={dakGloed} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="hsl(var(--accent) / 0)" />
          <stop offset="100%" stopColor="hsl(var(--accent) / 0.3)" />
        </linearGradient>
        <radialGradient id={contact}>
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.42)" />
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
      {/* Contactschaduw: een tweede, veel strakkere schaduw pal onder de gevel.
          Zonder die harde aanzet lijkt de woning te zweven. */}
      <ellipse cx="196" cy="311" rx="118" ry="15" fill={`url(#${contact})`} />

      {/* ============ SNEDE: hier zie je de opbouw ============ */}
      <polygon points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)} fill={BINNEN} />
      <polygon
        points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)}
        fill={`url(#${licht})`}
      />

      {/* Vloeropbouw: bodem, kruipruimte, en de vloer daar overheen. De
          isolatie hangt onder de vloer, tussen de funderingsmuren door, want
          dat is waar hij in het echt ook zit. */}
      {(() => {
        /** Een horizontale band door de hele diepte van de snede. */
        const band = (z1: number, z2: number, b1 = 0, b2 = 1) =>
          pad(P(1, b1, z1), P(1, b2, z1), P(1, b2, z2), P(1, b1, z2));
        return (
          <g>
            <polygon points={band(0, BODEM_DIK)} fill={BODEM} />
            <polygon points={band(BODEM_DIK, KRUIP_TOT)} fill={KRUIPRUIMTE} />
            {/* De vloer rust op funderingsmuurtjes, niet op lucht. */}
            {[
              [0, MUUR_DIK],
              [1 - MUUR_DIK, 1],
            ].map(([b1, b2]) => (
              <polygon key={b1} points={band(BODEM_DIK, KRUIP_TOT, b1, b2)} fill={BETON} />
            ))}
            <polygon
              points={band(KRUIP_TOT, VLOER_DIK)}
              fill={BETON}
              stroke={LIJN}
              strokeWidth="1.2"
            />
            <polygon
              className="schil-overgang"
              points={band(KRUIP_TOT - VLOER_ISOLATIE, KRUIP_TOT, MUUR_DIK, 1 - MUUR_DIK)}
              fill={`url(#${wol})`}
              style={{ opacity: aan("vloer") ? 1 : 0 }}
            />
            <line
              x1={P(1, 0, KRUIP_TOT)[0]}
              y1={P(1, 0, KRUIP_TOT)[1]}
              x2={P(1, 1, KRUIP_TOT)[0]}
              y2={P(1, 1, KRUIP_TOT)[1]}
              stroke={LIJN}
              strokeWidth="1"
            />
          </g>
        );
      })()}

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

      {/* Plafond: zonder deze lijn is de snede één leeg vlak en lijkt de zolder
          bij de woonkamer te horen. */}
      <line
        x1={voorTopR[0]}
        y1={voorTopR[1]}
        x2={achterTopR[0]}
        y2={achterTopR[1]}
        stroke={LIJN}
        strokeWidth="1.1"
        opacity="0.55"
      />
      <polygon
        points={pad(voorOnderR, achterOnderR, achterTopR, nokSnede, voorTopR)}
        fill="none"
        stroke={LIJN}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ============ VOORGEVEL ============ */}
      <polygon points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)} fill={`url(#${steen})`} />

      {/* Plint: de onderste laag metselwerk staat in donkerder steen. */}
      <polygon
        points={pad(P(0, 0, 0), P(1, 0, 0), P(1, 0, PLINT_HOOG), P(0, 0, PLINT_HOOG))}
        fill={`url(#${steen})`}
      />
      <polygon
        points={pad(P(0, 0, 0), P(1, 0, 0), P(1, 0, PLINT_HOOG), P(0, 0, PLINT_HOOG))}
        fill={PLINT}
        opacity="0.72"
      />
      <line
        x1={P(0, 0, PLINT_HOOG)[0]}
        y1={P(0, 0, PLINT_HOOG)[1]}
        x2={P(1, 0, PLINT_HOOG)[0]}
        y2={P(1, 0, PLINT_HOOG)[1]}
        stroke={PLINT_DONKER}
        strokeWidth="1.4"
      />

      {/* Rollagen: boven elke opening staat een laag stenen op zijn kant, die
          het metselwerk erboven draagt. Zonder die laag zweeft een gat in een
          bakstenen gevel. */}
      {[
        ...RAMEN.map((r) => ({ ...r, z: LATEI })),
        { ...DEUR, z: LATEI },
      ].map(({ a1, a2, z }) => {
        const van = a1 - 0.014;
        const tot = a2 + 0.014;
        const stenen = 9;
        return (
          <g key={`rollaag${a1}`}>
            <polygon
              points={pad(P(van, 0, z), P(tot, 0, z), P(tot, 0, z + ROLLAAG), P(van, 0, z + ROLLAAG))}
              fill={STEEN_DONKER}
              stroke="#6F4F38"
              strokeWidth="0.8"
            />
            {Array.from({ length: stenen - 1 }, (_, i) => {
              const a = van + ((tot - van) * (i + 1)) / stenen;
              const [x1, y1] = P(a, 0, z);
              const [x2, y2] = P(a, 0, z + ROLLAAG);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={VOEG} strokeWidth="0.45" />
              );
            })}
          </g>
        );
      })}

      {/* Muurankers: de smeedijzeren kruisjes waarmee de balklaag aan de gevel
          hangt. Klein detail, maar het is wat een bakstenen gevel van vóór de
          jaren zeventig herkenbaar maakt. */}
      {[0.32, 0.625].map((a) => {
        // Op de penanten tussen de openingen, en laag genoeg om onder de goot
        // uit te komen.
        const [x, y] = P(a, 0, 62);
        return (
          <g key={`anker${a}`} stroke={IJZER} strokeWidth="1.3" strokeLinecap="round" opacity="0.7">
            <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
            <line x1={x - 2.4} y1={y - 5.4} x2={x + 2.4} y2={y - 4.6} />
            <line x1={x - 2.4} y1={y + 4.6} x2={x + 2.4} y2={y + 5.4} />
          </g>
        );
      })}

      {/* Gevelisolatie buitenom: de gevel krijgt een stuclaag. Dat is het enige
          dat je van isolatie aan de buitenkant écht ziet, en het dekt de plint,
          de rollagen en de ankers af. */}
      <polygon
        className="schil-overgang"
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill={`url(#${stuc})`}
        style={{ opacity: aan("gevel") ? 1 : 0 }}
      />
      {/* Spouwisolatie blijft onzichtbaar; een warme waas markeert dat de muren
          nu wél geïsoleerd zijn. Zit er stucwerk overheen, dan vervalt de waas:
          door een geïsoleerde buitengevel kijk je de spouw niet in, en de waas
          maakte het verse pleisterwerk zandgeel. */}
      <polygon
        className="schil-overgang"
        points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)}
        fill="hsl(var(--accent) / 0.3)"
        style={{ opacity: aan("spouw") && !aan("gevel") ? 1 : 0 }}
      />
      <polygon points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)} fill="hsl(var(--primary) / 0.06)" />
      {/* Het licht over de gevel: op naar de dakrand, weg naar de plint. */}
      <polygon points={pad(voorOnderL, voorOnderR, voorTopR, voorTopL)} fill={`url(#${licht})`} />
      {/* En de slagschaduw die het overstek erop werpt. */}
      <polygon
        points={pad(P(0, 0, H - 26), P(1, 0, H - 26), P(1, 0, H), P(0, 0, H))}
        fill={`url(#${overstek})`}
      />

      {/* Ramen */}
      {RAMEN.map(({ a1, a2 }) => {
        const midden = (a1 + a2) / 2;
        return (
          <g key={a1}>
            {/* Raamdorpel: steekt aan weerskanten uit en heeft een schaduwkant,
                zodat het regenwater vrij van de gevel valt. */}
            <polygon
              points={pad(
                P(a1 - 0.017, 0, RAAM_ONDER - 6),
                P(a2 + 0.017, 0, RAAM_ONDER - 6),
                P(a2 + 0.017, 0, RAAM_ONDER),
                P(a1 - 0.017, 0, RAAM_ONDER),
              )}
              fill="#EDE7DA"
              stroke={KOZIJN_SCHADUW}
              strokeWidth="0.8"
            />
            <line
              x1={P(a1 - 0.017, 0, RAAM_ONDER - 6)[0]}
              y1={P(a1 - 0.017, 0, RAAM_ONDER - 6)[1]}
              x2={P(a2 + 0.017, 0, RAAM_ONDER - 6)[0]}
              y2={P(a2 + 0.017, 0, RAAM_ONDER - 6)[1]}
              stroke={KOZIJN_SCHADUW}
              strokeWidth="1.4"
            />

            <polygon
              points={pad(
                P(a1, 0, RAAM_ONDER),
                P(a2, 0, RAAM_ONDER),
                P(a2, 0, LATEI),
                P(a1, 0, LATEI),
              )}
              fill={KOZIJN}
              stroke={KOZIJN_SCHADUW}
              strokeWidth="1"
            />
            {/* De negge: het kozijn ligt terug in de opening, dus vangt de
                bovendorpel schaduw. Zonder dit plakt het raam op de gevel. */}
            <polygon
              points={pad(P(a1, 0, LATEI - 3), P(a2, 0, LATEI - 3), P(a2, 0, LATEI), P(a1, 0, LATEI))}
              fill="#000000"
              opacity="0.16"
            />
            <polygon
              className="schil-overgang"
              points={pad(
                P(a1 + 0.014, 0, 40),
                P(a2 - 0.014, 0, 40),
                P(a2 - 0.014, 0, 69),
                P(a1 + 0.014, 0, 69),
              )}
              fill={aan("glas") ? `url(#${glas})` : "#C9CBC6"}
              stroke={aan("glas") ? "#6E9BB5" : "#A8ACA6"}
              strokeWidth="1.2"
            />
            {/* Tussenstijl en bovendorpel: een draaiend deel naast een vast
                deel, met een bovenlicht. Zonder die indeling leest een raam als
                een plaat glas. */}
            <polygon
              points={pad(
                P(midden - 0.007, 0, 40),
                P(midden + 0.007, 0, 40),
                P(midden + 0.007, 0, 60),
                P(midden - 0.007, 0, 60),
              )}
              fill={KOZIJN}
              stroke={KOZIJN_SCHADUW}
              strokeWidth="0.7"
            />
            <polygon
              points={pad(
                P(a1 + 0.014, 0, 60),
                P(a2 - 0.014, 0, 60),
                P(a2 - 0.014, 0, 64),
                P(a1 + 0.014, 0, 64),
              )}
              fill={KOZIJN}
              stroke={KOZIJN_SCHADUW}
              strokeWidth="0.7"
            />
            {/* De extra ruit in de sponning: zichtbaar bewijs van isolerend glas. */}
            <polygon
              className="schil-overgang"
              points={pad(
                P(a1 + 0.026, 0, 44),
                P(a2 - 0.026, 0, 44),
                P(a2 - 0.026, 0, 56),
                P(a1 + 0.026, 0, 56),
              )}
              fill="none"
              stroke="#6E9BB5"
              strokeWidth="1"
              style={{ opacity: aan("glas") ? 1 : 0 }}
            />
          </g>
        );
      })}

      {/* Voordeur met bovenlicht */}
      {(() => {
        const { a1, a2 } = DEUR;
        const kozijn = 0.013;
        return (
          <g>
            {/* Bovenlicht: het vaste raampje boven de deur. */}
            <polygon
              points={pad(
                P(a1, 0, LATEI - 14),
                P(a2, 0, LATEI - 14),
                P(a2, 0, LATEI),
                P(a1, 0, LATEI),
              )}
              fill={KOZIJN}
              stroke={KOZIJN_SCHADUW}
              strokeWidth="1"
            />
            <polygon
              className="schil-overgang"
              points={pad(
                P(a1 + kozijn, 0, LATEI - 11),
                P(a2 - kozijn, 0, LATEI - 11),
                P(a2 - kozijn, 0, LATEI - 3),
                P(a1 + kozijn, 0, LATEI - 3),
              )}
              fill={aan("glas") ? `url(#${glas})` : "#C9CBC6"}
              stroke={aan("glas") ? "#6E9BB5" : "#A8ACA6"}
              strokeWidth="0.8"
            />

            <polygon
              points={pad(
                P(a1, 0, 0),
                P(a2, 0, 0),
                P(a2, 0, LATEI - 14),
                P(a1, 0, LATEI - 14),
              )}
              fill="#2D4761"
            />
            {/* Twee panelen in plaats van één omlijsting. */}
            {[
              [6, 30],
              [34, 54],
            ].map(([z1, z2]) => (
              <polygon
                key={z1}
                points={pad(
                  P(a1 + 0.017, 0, z1),
                  P(a2 - 0.017, 0, z1),
                  P(a2 - 0.017, 0, z2),
                  P(a1 + 0.017, 0, z2),
                )}
                fill="none"
                stroke="#44627F"
                strokeWidth="1.4"
              />
            ))}
            {/* Brievenbus en kruk. */}
            <polygon
              points={pad(
                P(a1 + 0.045, 0, 31),
                P(a1 + 0.105, 0, 31),
                P(a1 + 0.105, 0, 33.5),
                P(a1 + 0.045, 0, 33.5),
              )}
              fill={IJZER}
            />
            <circle
              {...(() => {
                // Op de middenregel, tussen de twee panelen, net als de brievenbus.
                const [cx, cy] = P(a2 - 0.028, 0, 32);
                return { cx, cy, r: 2.3 };
              })()}
              fill="#D9C48C"
            />
            {/* Drempel: de deur staat op een dorpel, niet op het zand. */}
            <polygon
              points={pad(
                P(a1 - 0.012, 0, 0),
                P(a2 + 0.012, 0, 0),
                P(a2 + 0.012, 0, 4),
                P(a1 - 0.012, 0, 4),
              )}
              fill="#D8D2C6"
              stroke={KOZIJN_SCHADUW}
              strokeWidth="0.8"
            />
          </g>
        );
      })()}

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
            fill={pan}
            stroke={panVoeg}
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
            fill={panLicht}
            opacity="0.55"
          />
        );
      })}
      {/* pannaden tussen de kolommen */}
      {Array.from({ length: KOLOMMEN + 1 }, (_, k) => {
        const a = k / KOLOMMEN;
        const [x1, y1] = D(a, 0);
        const [x2, y2] = D(a, 1);
        return <line key={`naad${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={panDonker} strokeWidth="0.9" />;
      })}
      {/* Dakisolatie zit tussen de spanten en is van buiten net zo onzichtbaar
          als spouwisolatie. Toch hoort het hele dakvlak mee te kleuren en niet
          alleen de snede, anders lijkt er niets te gebeuren.

          Twee lagen en niet één: alleen oker over donkerblauwe pannen levert
          olijfgroen op, en dat leest als een vies dak in plaats van een warm
          dak. Eerst oplichten, dan pas de warmte erover. */}
      <g className="schil-overgang" data-laag="dak" style={{ opacity: dakAan ? 1 : 0 }}>
        <polygon points={pad(D(0, 0.55), D(1, 0.55), D(1, 1), D(0, 1))} fill={`url(#${dakGloed})`} />
      </g>
      <polygon
        points={pad(D(0, 0), D(1, 0), D(1, 1), D(0, 1))}
        fill="hsl(var(--primary) / 0.05)"
      />
      <polygon points={pad(D(0, 0), D(1, 0), D(1, 1), D(0, 1))} fill={`url(#${dakLicht})`} />
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

      {/* Zinken mastgoot onder het boeiboord, met een lichte binnenkant zodat de
          holle vorm te zien is. */}
      {(() => {
        const zak = (dy: number): Punt[] => [
          [D(0, 0)[0], D(0, 0)[1] + dy],
          [D(1, 0)[0], D(1, 0)[1] + dy],
        ];
        return (
          <g>
            <polygon
              points={pad(...zak(7), ...zak(14).reverse())}
              fill={ZINK}
              stroke={ZINK_DONKER}
              strokeWidth="1"
            />
            <polyline
              points={pad(...zak(9.5))}
              fill="none"
              stroke="#BCC3C8"
              strokeWidth="1.4"
            />
          </g>
        );
      })()}

      {/* Regenpijp langs de linkerhoek, met beugels en een schoen onderaan. De
          pijp hangt aan de gevel, dus hij loopt van de goot tot bij de grond. */}
      {(() => {
        // Iets van de hoek af, anders leest de pijp als een grijze pilaster op
        // de hoek in plaats van als een buis tegen de gevel.
        const [a1, a2] = [0.022, 0.038];
        const zGoot = GOOT_DEKT_VANAF + 2;
        const strook = (z1: number, z2: number, uit = 0) =>
          pad(
            P(a1 - uit, 0, z1),
            P(a2 + uit, 0, z1),
            P(a2 + uit, 0, z2),
            P(a1 - uit, 0, z2),
          );
        return (
          <g>
            <polygon points={strook(6, zGoot)} fill={ZINK} stroke={ZINK_DONKER} strokeWidth="0.8" />
            {[30, 66].map((z) => (
              <polygon key={z} points={strook(z, z + 3, 0.004)} fill={ZINK_DONKER} />
            ))}
            <polygon points={strook(2, 8, 0.005)} fill={ZINK_DONKER} />
          </g>
        );
      })()}

      {/* Nokvorsten: losse vorsten met een naad ertussen, niet één balk. */}
      {(() => {
        const stuks = 12;
        return Array.from({ length: stuks }, (_, i) => {
          const van = i / stuks + 0.006;
          const tot = (i + 1) / stuks - 0.006;
          const punt = (a: number, dy: number): Punt => {
            const [x, y] = P(a, 0.5, H + NOK);
            return [x, y + dy];
          };
          return (
            <polygon
              key={`vorst${i}`}
              points={pad(punt(van, 0), punt(tot, 0), punt(tot, -7), punt(van, -7))}
              fill={panDonker}
              stroke={panVoeg}
              strokeWidth="0.6"
            />
          );
        });
      })()}

      {/* Slagschaduw van de schoorsteen op de pannen. Eén vlak dat niets
          voorstelt maar alles doet: zonder schaduw plakt de schoorsteen op het
          dak in plaats van erop te staan. */}
      {(() => {
        const [x, y] = P(0.32, 0.5, H + NOK - 4);
        const S = (b: number, h: number): Punt => [x + 21 * b, y + 5 * b - h];
        const weg = (punt: Punt): Punt => [punt[0] + 23, punt[1] + 5];
        return (
          <polygon
            points={pad(S(0.12, -3), S(1.14, -3), weg(S(1.14, -3)), weg(S(0.12, -3)))}
            fill="#000000"
            opacity="0.13"
          />
        );
      })()}

      {/* Schoorsteen: metselwerk met een loodslabbe waar hij door het dakvlak
          steekt, en een afdekplaat met een rookkanaal erin. Zonder die slabbe
          lekt een schoorsteen in het echt, en zonder afdekplaat regent hij vol. */}
      {(() => {
        const [x, y] = P(0.32, 0.5, H + NOK - 4);
        /** Punt op de schoorsteen: b langs de breedte, h omhoog. */
        const S = (b: number, h: number): Punt => [x + 21 * b, y + 5 * b - h];
        return (
          <g>
            {/* Loodslabbe: de kraag waarmee het dak op de schoorsteen aansluit. */}
            <polygon
              points={pad(S(-0.14, -4), S(1.14, -4), S(1.14, 7), S(-0.14, 7))}
              fill={LOOD}
              stroke="#7E858B"
              strokeWidth="0.7"
            />
            {/* De schacht, met een voegenpatroon in de breedte. */}
            <polygon points={pad(S(0, 0), S(1, 0), S(1, 32), S(0, 37))} fill={STEEN_DONKER} />
            {[9, 18, 27].map((h) => (
              <line
                key={h}
                x1={S(0, h + 5)[0]}
                y1={S(0, h + 5)[1]}
                x2={S(1, h)[0]}
                y2={S(1, h)[1]}
                stroke={VOEG}
                strokeWidth="0.7"
                opacity="0.5"
              />
            ))}
            {/* Afdekplaat, iets breder dan de schacht. */}
            <polygon
              points={pad(S(-0.07, 34), S(1.07, 29), S(1.07, 33), S(-0.07, 38))}
              fill="#6F5340"
            />
            <polygon
              points={pad(S(-0.07, 38), S(1.07, 33), S(1.35, 38), S(0.21, 43))}
              fill="#8A6749"
            />
            {/* Het rookkanaal: donker gat in de plaat. */}
            <polygon
              points={pad(S(0.3, 38.6), S(0.72, 36.7), S(0.83, 38.6), S(0.41, 40.5))}
              fill="#3A2C22"
            />
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
