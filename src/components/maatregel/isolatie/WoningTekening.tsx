import { useId } from "react";

import type { MaatregelId } from "@/data/isolatie";

/**
 * De woning die zichtbaar dichtgaat.
 *
 * Zonder maatregelen ontsnapt de warmte via dak, gevel, ramen en vloer: dat
 * zijn de pijlen naar buiten. Zet je een maatregel aan, dan komt er een
 * isolatielaag in dat bouwdeel en verdwijnen de pijlen daar. De tekening doet
 * dus hetzelfde werk als de cijfers ernaast, maar dan in één oogopslag.
 *
 * Alle overgangen respecteren prefers-reduced-motion via de CSS-klasse
 * `schil-overgang` in index.css.
 */

const WARM = "#C0392B";

export const WoningTekening = ({ gekozen }: { gekozen: Set<MaatregelId> }) => {
  const id = useId();
  const arceringId = `${id}-arcering`;
  const glasId = `${id}-glas`;

  const aan = (m: MaatregelId) => gekozen.has(m);

  // Warmte ontsnapt zolang het bouwdeel niet is aangepakt.
  const lek = (m: MaatregelId) => (aan(m) ? 0 : 1);

  return (
    <svg
      viewBox="0 0 400 340"
      className="w-full h-auto"
      role="img"
      aria-label={
        gekozen.size === 0
          ? "Doorsnede van een woning zonder isolatie, waarbij warmte via dak, gevel, ramen en vloer naar buiten ontsnapt"
          : `Doorsnede van een woning met isolatie in: ${[...gekozen].join(", ")}`
      }
    >
      <defs>
        <pattern
          id={arceringId}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill="hsl(var(--accent) / 0.45)" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="hsl(var(--accent))" strokeWidth="3" />
        </pattern>
        <linearGradient id={glasId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BFD9E8" />
          <stop offset="100%" stopColor="#E6F0F6" />
        </linearGradient>
      </defs>

      {/* Grond */}
      <line
        x1="20" y1="302" x2="380" y2="302"
        stroke="hsl(var(--primary) / 0.2)"
        strokeWidth="2"
      />

      {/* Binnenruimte */}
      <rect x="84" y="152" width="232" height="134" fill="hsl(var(--primary) / 0.04)" />

      {/* ---------- DAK ---------- */}
      <polygon
        points="56,156 200,54 344,156"
        fill="#E3DDD1"
        stroke="hsl(var(--primary) / 0.35)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Isolatielaag onder het dakvlak */}
      <polygon
        className="schil-overgang"
        points="86,152 200,71 314,152"
        fill={`url(#${arceringId})`}
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
        style={{ opacity: aan("dak") ? 1 : 0 }}
      />

      {/* ---------- GEVELS ---------- */}
      <rect x="72" y="152" width="12" height="134" fill="#D9CFC0" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
      <rect x="316" y="152" width="12" height="134" fill="#D9CFC0" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
      {/* Isolatie in de spouw */}
      <rect
        className="schil-overgang"
        x="84" y="152" width="10" height="134"
        fill={`url(#${arceringId})`}
        style={{ opacity: aan("gevel") ? 1 : 0 }}
      />
      <rect
        className="schil-overgang"
        x="306" y="152" width="10" height="134"
        fill={`url(#${arceringId})`}
        style={{ opacity: aan("gevel") ? 1 : 0 }}
      />

      {/* ---------- RAMEN ---------- */}
      {[124, 244].map((x) => (
        <g key={x}>
          <rect
            className="schil-overgang"
            x={x} y="186" width="56" height="58" rx="3"
            fill={aan("glas") ? `url(#${glasId})` : "#EDEAE3"}
            stroke={aan("glas") ? "#7FA8BF" : "hsl(var(--primary) / 0.3)"}
            strokeWidth="2"
          />
          {/* Tweede ruit: alleen zichtbaar bij HR++ */}
          <rect
            className="schil-overgang"
            x={x + 5} y="191" width="46" height="48" rx="2"
            fill="none"
            stroke="#7FA8BF"
            strokeWidth="1.5"
            style={{ opacity: aan("glas") ? 1 : 0 }}
          />
        </g>
      ))}

      {/* ---------- VLOER ---------- */}
      <rect x="84" y="286" width="232" height="10" fill="#D9CFC0" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
      <rect
        className="schil-overgang"
        x="84" y="296" width="232" height="9"
        fill={`url(#${arceringId})`}
        style={{ opacity: aan("vloer") ? 1 : 0 }}
      />

      {/* ---------- WARMTE DIE ONTSNAPT ---------- */}
      {/* Boven het dak */}
      {[150, 200, 250].map((x, i) => (
        <Pijl key={`d${x}`} x={x} y={48 - i * 0} richting="op" zichtbaar={lek("dak")} />
      ))}
      {/* Links en rechts van de gevel */}
      <Pijl x={56} y={210} richting="links" zichtbaar={lek("gevel")} />
      <Pijl x={56} y={250} richting="links" zichtbaar={lek("gevel")} />
      <Pijl x={344} y={210} richting="rechts" zichtbaar={lek("gevel")} />
      <Pijl x={344} y={250} richting="rechts" zichtbaar={lek("gevel")} />
      {/* Bij de ramen */}
      <Pijl x={152} y={168} richting="op" zichtbaar={lek("glas")} kort />
      <Pijl x={272} y={168} richting="op" zichtbaar={lek("glas")} kort />
      {/* Onder de vloer */}
      <Pijl x={160} y={318} richting="neer" zichtbaar={lek("vloer")} />
      <Pijl x={240} y={318} richting="neer" zichtbaar={lek("vloer")} />
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
  const lengte = kort ? 12 : 20;
  const punten: Record<typeof richting, string> = {
    op: `M${x} ${y + lengte} L${x} ${y} M${x - 5} ${y + 6} L${x} ${y} L${x + 5} ${y + 6}`,
    neer: `M${x} ${y - lengte} L${x} ${y} M${x - 5} ${y - 6} L${x} ${y} L${x + 5} ${y - 6}`,
    links: `M${x + lengte} ${y} L${x} ${y} M${x + 6} ${y - 5} L${x} ${y} L${x + 6} ${y + 5}`,
    rechts: `M${x - lengte} ${y} L${x} ${y} M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`,
  };
  return (
    <path
      className="schil-overgang"
      d={punten[richting]}
      stroke={WARM}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{ opacity: zichtbaar * 0.75 }}
      aria-hidden="true"
    />
  );
};
