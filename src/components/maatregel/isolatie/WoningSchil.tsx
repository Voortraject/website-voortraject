import { useId, useState } from "react";

import { euro, ISDE_BRON, ISDE_ISOLATIE, ISDE_VERDUBBELING, type IsdeMaatregel } from "@/data/isde";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * De schil van de woning als doorsnede, gekoppeld aan de ISDE-eisen en
 * -bedragen per bouwdeel.
 *
 * Bewust geen percentages warmteverlies per vlak: Milieu Centraal noemt die
 * niet en de cijfers die je online vindt spreken elkaar tegen. Wat hier staat
 * is wél controleerbaar (bron: RVO) en bovendien concreter: per bouwdeel de
 * isolatie-eis, het minimale oppervlak en het bedrag per m².
 *
 * De tabel toont alles tegelijk; de doorsnede voegt alleen het ruimtelijk
 * begrip toe. Zo staat er niets achter een klik verstopt, ook niet voor Google.
 */

type Deel = IsdeMaatregel["deel"];

const DEEL_LABEL: Record<Deel, string> = {
  dak: "Dak",
  zolder: "Zoldervloer",
  gevel: "Gevel",
  spouw: "Spouwmuur",
  vloer: "Vloer",
  bodem: "Bodem",
  glas: "Ramen",
};

export const WoningSchil = () => {
  const [actief, setActief] = useState<Deel | null>(null);
  const tabelId = useId();

  const isAan = (d: Deel) => actief === d;
  // Gevel en spouw zitten op hetzelfde vlak in de doorsnede.
  const vlakAan = (d: Deel) => isAan(d) || (d === "gevel" && isAan("spouw")) || (d === "spouw" && isAan("gevel"));

  const vulling = (d: Deel) => (vlakAan(d) ? "hsl(var(--accent) / 0.55)" : "hsl(var(--accent) / 0.16)");
  const lijn = (d: Deel) => (vlakAan(d) ? "hsl(var(--accent))" : "hsl(var(--primary) / 0.25)");

  return (
    <>
      <div className="text-center">
        <SectieKop center>
          <Accent tekst="De [[schil]] van je woning" />
        </SectieKop>
        <p
          className="mt-4 mx-auto text-base leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 680 }}
        >
          Isoleren gaat over de schil: alles wat je verwarmde ruimte scheidt van de kou. Per
          onderdeel gelden eigen eisen en eigen bedragen. Beweeg over een regel om te zien
          waar in de woning die zit.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-stretch">
        {/* Doorsnede */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 flex flex-col justify-center"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <svg
            viewBox="0 0 320 312"
            className="w-full h-auto"
            role="img"
            aria-labelledby={`${tabelId}-svg-titel`}
          >
            <title id={`${tabelId}-svg-titel`}>
              Doorsnede van een woning met dak, zoldervloer, gevel, spouwmuur, raam, vloer en
              bodem
            </title>

            {/* Binnenruimte, als rustpunt achter de schil */}
            <rect x="64" y="126" width="192" height="126" fill="hsl(var(--primary) / 0.035)" />

            {/* Dak, sluit aan op de gevels */}
            <path
              d="M160 22 L296 110 L296 126 L160 42 L24 126 L24 110 Z"
              fill={vulling("dak")}
              stroke={lijn("dak")}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* Zoldervloer, tussen de gevels */}
            <rect
              x="64" y="126" width="192" height="12"
              fill={vulling("zolder")}
              stroke={lijn("zolder")}
              strokeWidth={2}
            />
            {/* Gevels, links en rechts. De spouw ligt in hetzelfde vlak. */}
            <rect
              x="44" y="120" width="20" height="144"
              fill={vulling("gevel")}
              stroke={lijn("gevel")}
              strokeWidth={2}
            />
            <rect
              x="256" y="120" width="20" height="144"
              fill={vulling("gevel")}
              stroke={lijn("gevel")}
              strokeWidth={2}
            />
            {/* Raam in de rechtergevel */}
            <rect
              x="254" y="164" width="24" height="52"
              rx="2"
              fill={vulling("glas")}
              stroke={lijn("glas")}
              strokeWidth={2}
            />
            {/* Vloer */}
            <rect
              x="64" y="252" width="192" height="12"
              fill={vulling("vloer")}
              stroke={lijn("vloer")}
              strokeWidth={2}
            />
            {/* Kruipruimte, daaronder de bodem */}
            <rect
              x="64" y="282" width="192" height="12"
              fill={vulling("bodem")}
              stroke={lijn("bodem")}
              strokeWidth={2}
            />
            <line
              x1="24" y1="294" x2="296" y2="294"
              stroke="hsl(var(--primary) / 0.18)"
              strokeWidth={1.5}
            />

            {/* Labels, met een aanwijslijn waar het vlak zelf te smal is */}
            {[
              { d: "dak" as Deel, x: 160, y: 92, anchor: "middle" as const },
              { d: "zolder" as Deel, x: 160, y: 155, anchor: "middle" as const },
              { d: "vloer" as Deel, x: 160, y: 244, anchor: "middle" as const },
              { d: "bodem" as Deel, x: 160, y: 308, anchor: "middle" as const },
              { d: "gevel" as Deel, x: 34, y: 196, anchor: "end" as const, lijn: [37, 192, 44, 192] },
              { d: "glas" as Deel, x: 286, y: 194, anchor: "start" as const, lijn: [278, 190, 284, 190] },
            ].map(({ d, x, y, anchor, lijn: pijl }) => (
              <g key={d}>
                {pijl && (
                  <line
                    x1={pijl[0]} y1={pijl[1]} x2={pijl[2]} y2={pijl[3]}
                    stroke={vlakAan(d) ? "hsl(var(--accent))" : "hsl(var(--primary) / 0.3)"}
                    strokeWidth={1.5}
                  />
                )}
                <text
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  style={{
                    fontSize: 11,
                    fontWeight: vlakAan(d) ? 700 : 500,
                    fill: vlakAan(d) ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.55)",
                  }}
                >
                  {DEEL_LABEL[d]}
                </text>
              </g>
            ))}
          </svg>
          <p
            className="mt-2 text-center text-[12px]"
            style={{ color: KLEUR.navy, opacity: 0.5 }}
          >
            Spouwmuurisolatie zit in de gevel, tussen het binnen- en buitenblad.
          </p>
        </div>

        {/* Tabel */}
        <div className="lg:col-span-3 min-w-0">
          <div
            className="overflow-x-auto rounded-2xl"
            style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
          >
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
              <caption className="sr-only">
                ISDE-eisen en subsidiebedragen per isolatiemaatregel in {ISDE_BRON.geldigVoor}
              </caption>
              <thead>
                <tr style={{ backgroundColor: KLEUR.zand }}>
                  <Th align="left">Maatregel</Th>
                  <Th>Eis</Th>
                  <Th>Vanaf</Th>
                  <Th>Per m²</Th>
                  <Th>Bij 2 of meer</Th>
                </tr>
              </thead>
              <tbody>
                {ISDE_ISOLATIE.map((m) => (
                  <tr
                    key={m.naam}
                    onMouseEnter={() => setActief(m.deel)}
                    onMouseLeave={() => setActief(null)}
                    onFocus={() => setActief(m.deel)}
                    onBlur={() => setActief(null)}
                    tabIndex={0}
                    style={{
                      borderTop: `1px solid ${KLEUR.rand}`,
                      backgroundColor: isAan(m.deel) ? "hsl(var(--accent) / 0.08)" : undefined,
                      outline: "none",
                    }}
                  >
                    <Td align="left">
                      <span style={{ fontWeight: 600, color: KLEUR.navy }}>{m.naam}</span>
                      {m.noot && (
                        <span
                          className="block text-[12px] leading-snug mt-0.5"
                          style={{ color: KLEUR.navy, opacity: 0.55 }}
                        >
                          {m.noot}
                        </span>
                      )}
                    </Td>
                    <Td>{m.eis}</Td>
                    <Td>{m.vanafM2} m²</Td>
                    <Td>{euro(m.perM2)}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, color: KLEUR.navy }}>
                        {euro(m.perM2Dubbel)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="mt-4 rounded-2xl p-5"
            style={{
              backgroundColor: "hsl(var(--accent) / 0.12)",
              border: `1px solid hsl(var(--accent) / 0.4)`,
            }}
          >
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: KLEUR.navy, margin: 0 }}
            >
              <strong>{ISDE_VERDUBBELING.regel}</strong>
            </p>
            <p
              className="mt-2 text-[15px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.8, margin: "8px 0 0 0" }}
            >
              {ISDE_VERDUBBELING.uitzondering}
            </p>
          </div>

          <p className="mt-4 text-[13px]" style={{ color: KLEUR.navy, opacity: 0.55 }}>
            Bedragen en eisen gelden voor {ISDE_BRON.geldigVoor}. Bron:{" "}
            <a
              href={ISDE_BRON.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {ISDE_BRON.naam}
            </a>
            , gecontroleerd op {ISDE_BRON.gecontroleerd}. Er geldt ook een maximaal aantal
            vierkante meters per maatregel; wij rekenen dat voor je adres uit.
          </p>
        </div>
      </div>
    </>
  );
};

const Th = ({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) => (
  <th
    scope="col"
    className="text-[12px] font-semibold uppercase tracking-wider"
    style={{
      color: `hsl(var(--primary) / 0.6)`,
      textAlign: align,
      padding: "12px 16px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);

const Td = ({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) => (
  <td
    className="text-[14px]"
    style={{
      color: `hsl(var(--primary) / 0.85)`,
      textAlign: align,
      padding: "14px 16px",
      whiteSpace: align === "right" ? "nowrap" : undefined,
    }}
  >
    {children}
  </td>
);
