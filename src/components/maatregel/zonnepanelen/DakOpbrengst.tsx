import { BRONNEN, DAK_HOEKEN, DAK_NOTITIES, DAK_RICHTINGEN } from "@/data/zonnepanelen";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Wat je dak kan, in één beeld.
 *
 * "Zuid is het best en noord is slecht" weet iedereen wel; wat mensen niet
 * weten is hóéveel het scheelt, en dat een plat dak op het oosten het bijna net
 * zo goed doet als een steil dak op het zuiden. Als raster met kleurverloop zie
 * je dat in één oogopslag, waar een alinea erover je niets laat zien.
 *
 * Bewust geen omrekening naar kilowatturen: dat zou een getal zijn dat ik zelf
 * verzin. Deze percentages staan zo bij de bron.
 */

/** Van de laagste waarde in de tabel (20) naar de hoogste (100). */
const vulling = (waarde: number) => {
  const deel = Math.max(0, Math.min(1, (waarde - 20) / 80));
  return `hsl(var(--accent) / ${(0.06 + deel * 0.8).toFixed(2)})`;
};

export const DakOpbrengst = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Wat jouw dak [[kan]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Richting en hellingshoek bepalen samen hoeveel je dak kan opwekken. Zoek je eigen dak op in
        het raster: 100 procent is een dak op het zuiden met 30 tot 45 graden helling.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl p-4 md:p-6"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      {/* Op een smal scherm past het raster niet; dan schuift het horizontaal
          in plaats van dat de cijfers onleesbaar klein worden. Zonder hint ziet
          niemand dat er nog kolommen achter de rand zitten. */}
      <p
        className="sm:hidden text-[12px]"
        style={{ color: KLEUR.navy, opacity: 0.55, margin: "0 0 8px 0" }}
      >
        Schuif het raster opzij voor de steilere daken.
      </p>
      <div className="overflow-x-auto">
        {/* Vaste kolombreedtes: zonder colgroup slokt de richtingkolom alle
            overgebleven ruimte op en staan de namen ver van hun cijfers. */}
        <table
          className="w-full border-separate mx-auto"
          style={{ minWidth: 460, maxWidth: 860, borderSpacing: 3 }}
        >
          <colgroup>
            <col style={{ width: 108 }} />
            {DAK_HOEKEN.map((hoek) => (
              <col key={hoek} style={{ width: `${100 / DAK_HOEKEN.length}%` }} />
            ))}
          </colgroup>
          <caption className="sr-only">
            Opbrengst van zonnepanelen per dakrichting en hellingshoek, als percentage van het
            maximum
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="text-left text-[11px] font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.5, paddingBottom: 4, minWidth: 96 }}
              >
                Richting
              </th>
              {DAK_HOEKEN.map((hoek) => (
                <th
                  key={hoek}
                  scope="col"
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: KLEUR.navy, opacity: 0.6, paddingBottom: 4 }}
                >
                  {hoek}°
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAK_RICHTINGEN.map((richting) => (
              <tr key={richting.naam}>
                <th
                  scope="row"
                  className="text-left text-[14px] font-medium whitespace-nowrap"
                  style={{ color: KLEUR.navy, paddingRight: 8 }}
                >
                  {richting.naam}
                </th>
                {richting.opbrengst.map((waarde, i) => (
                  <td
                    key={DAK_HOEKEN[i]}
                    className="text-center text-[14px] font-semibold tabular-nums rounded-lg"
                    style={{
                      backgroundColor: vulling(waarde),
                      color: KLEUR.navy,
                      padding: "9px 4px",
                      // Het maximum krijgt een randje, zodat het ijkpunt van de
                      // tabel meteen te vinden is.
                      boxShadow: waarde === 100 ? "inset 0 0 0 2px hsl(var(--primary) / 0.45)" : "none",
                    }}
                  >
                    {waarde}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[13px]" style={{ color: KLEUR.navy, opacity: 0.55 }}>
        Percentages van{" "}
        <a
          href={BRONNEN.dak.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {BRONNEN.dak.naam}
        </a>
        , gecontroleerd op {BRONNEN.dak.gecontroleerd}. Een plat dak is 0 graden, een gemiddeld
        schuin dak ongeveer 40.
      </p>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <Notitie kop="Oost-west is vaak slimmer dan het lijkt" tekst={DAK_NOTITIES.oostWest} />
      <Notitie kop="Schaduw is op te lossen" tekst={DAK_NOTITIES.schaduw} />
    </div>
  </>
);

const Notitie = ({ kop, tekst }: { kop: string; tekst: string }) => (
  <div
    className="rounded-2xl p-6"
    style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
  >
    <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
      {kop}
    </span>
    <p
      className="text-[15px] leading-relaxed"
      style={{ color: KLEUR.navy, opacity: 0.75, margin: "8px 0 0 0" }}
    >
      {tekst}
    </p>
  </div>
);
