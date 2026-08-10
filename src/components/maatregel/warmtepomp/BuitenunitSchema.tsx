import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Waar de geluidsnorm over gaat.
 *
 * Het misverstand is dat de norm bij de unit zou gelden. Dat is niet zo: hij
 * geldt op de grens met de buren, en daar is het geluid al een stuk minder.
 * Daarom staat de streep in deze tekening niet bij het apparaat maar op de
 * erfgrens.
 *
 * De opschriften zijn gewone HTML boven de tekening in plaats van SVG-tekst.
 * Tekst binnen een schaalbare viewBox wordt op een telefoon mee verkleind en
 * is daar niet meer te lezen; zo blijft hij op elke breedte gewoon leesbaar.
 */

const STEEN = "#BB8C69";
const STEEN_DONKER = "#A87B58";
const PAN = "#4A5361";
const KOZIJN = "#F6F3ED";
const HOUT = "#A8834F";
const LIJN = "hsl(var(--primary) / 0.35)";

/** Horizontale positie van de perceelgrens, in procenten van de breedte. */
const GRENS = (336 / 640) * 100;

export const BuitenunitSchema = () => (
  <div className="relative mx-auto" style={{ maxWidth: 640 }}>
    <svg
      viewBox="0 0 640 250"
      width="100%"
      height="auto"
      role="img"
      aria-label="Schema: de buitenunit staat bij je eigen woning en het geluid ervan wordt gemeten op de perceelgrens met de buren, waar maximaal 40 decibel is toegestaan."
      style={{ display: "block" }}
    >
      {/* Maaiveld */}
      <line x1="8" y1="215" x2="632" y2="215" stroke={LIJN} strokeWidth="1.5" />

      {/* Eigen woning */}
      <polygon points="14,112 109,56 204,112" fill={PAN} />
      <rect x="24" y="112" width="170" height="103" fill={STEEN} />
      <rect x="56" y="144" width="46" height="40" fill={KOZIJN} stroke={STEEN_DONKER} />
      <rect x="132" y="152" width="34" height="63" fill={HOUT} />

      {/* Buitenunit, op pootjes naast de woning */}
      <line x1="215" y1="192" x2="215" y2="215" stroke={LIJN} strokeWidth="3" />
      <line x1="245" y1="192" x2="245" y2="215" stroke={LIJN} strokeWidth="3" />
      <rect
        x="206"
        y="150"
        width="48"
        height="44"
        rx="5"
        fill="#EDE9E0"
        stroke="hsl(var(--primary) / 0.5)"
        strokeWidth="1.5"
      />
      <circle
        cx="230"
        cy="172"
        r="13"
        fill="none"
        stroke="hsl(var(--primary) / 0.45)"
        strokeWidth="1.5"
      />
      <line x1="230" y1="159" x2="230" y2="185" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
      <line x1="217" y1="172" x2="243" y2="172" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />

      {/* Geluid, dat richting de grens al afneemt */}
      <g fill="none" stroke={KLEUR.goud} strokeLinecap="round">
        <path d="M 271.8 155.9 A 24 24 0 0 1 271.8 188.1" strokeWidth="3" opacity="0.9" />
        <path d="M 282.2 146.6 A 38 38 0 0 1 282.2 197.4" strokeWidth="2.5" opacity="0.6" />
        <path d="M 292.6 137.2 A 52 52 0 0 1 292.6 206.8" strokeWidth="2" opacity="0.35" />
      </g>

      {/* Perceelgrens */}
      <line
        x1="336"
        y1="80"
        x2="336"
        y2="215"
        stroke="hsl(var(--primary) / 0.55)"
        strokeWidth="2"
        strokeDasharray="7 6"
      />
      <polygon points="330,215 342,215 336,206" fill="hsl(var(--primary) / 0.55)" />

      {/* Woning van de buren, met het raam dat je wilt ontzien */}
      <polygon points="396,120 504,66 612,120" fill={PAN} />
      <rect x="406" y="120" width="196" height="95" fill={STEEN} />
      <rect
        x="430"
        y="146"
        width="54"
        height="44"
        fill={KOZIJN}
        stroke={KLEUR.goud}
        strokeWidth="2.5"
      />
      <rect x="524" y="148" width="44" height="38" fill={KOZIJN} stroke={STEEN_DONKER} />
    </svg>

    {/* De norm, op de grens waar hij geldt */}
    <span
      className="absolute -translate-x-1/2 rounded-full px-3 py-1 text-[13px] font-bold sm:text-[15px] whitespace-nowrap"
      style={{
        left: `${GRENS}%`,
        top: "10%",
        backgroundColor: KLEUR.goud,
        color: KLEUR.navy,
      }}
    >
      max 40 dB
    </span>

    {/* Opschriften. "buitenunit" verdwijnt op een smal scherm: daar botst hij
        met "perceelgrens", en van die twee is de grens het hele punt. Het
        apparaat spreekt in de tekening voor zich. */}
    {[
      { x: (230 / 640) * 100, tekst: "buitenunit", smal: false },
      { x: GRENS, tekst: "perceelgrens", smal: true },
      { x: (504 / 640) * 100, tekst: "de buren", smal: true },
    ].map((label) => (
      <span
        key={label.tekst}
        className={`absolute -translate-x-1/2 text-[11px] sm:text-[12.5px] whitespace-nowrap ${
          label.smal ? "" : "hidden sm:inline"
        }`}
        style={{ left: `${label.x}%`, top: "89%", color: KLEUR.navy, opacity: 0.6 }}
      >
        {label.tekst}
      </span>
    ))}
  </div>
);
