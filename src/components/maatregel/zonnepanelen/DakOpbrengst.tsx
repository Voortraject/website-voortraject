import { Compass, SunMedium } from "lucide-react";

import { BRONNEN, DAK_HOEKEN, DAK_NOTITIES, DAK_RICHTINGEN } from "@/data/zonnepanelen";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";
import type { LucideIcon } from "lucide-react";

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
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">
        Richting en hellingshoek bepalen samen hoeveel je dak kan opwekken. Zoek je eigen dak op in
        het raster: 100 procent is een dak op het zuiden met 30 tot 45 graden helling.
      </p>
    </div>

    <div className="hs-tegel mt-7 p-4 md:mt-10 md:p-6" data-veer>
      {/* Op een smal scherm past het raster niet; dan schuift het horizontaal
          in plaats van dat de cijfers onleesbaar klein worden. Zonder hint ziet
          niemand dat er nog kolommen achter de rand zitten. */}
      <p className="vd-tekst mb-2 mt-0 text-[13.5px] sm:hidden">
        Schuif het raster opzij voor de steilere daken.
      </p>
      <div className="overflow-x-auto">
        {/* Vaste kolombreedtes: zonder colgroup slokt de richtingkolom alle
            overgebleven ruimte op en staan de namen ver van hun cijfers. */}
        <table
          className="mx-auto w-full border-separate"
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
                className="min-w-[96px] pb-1 text-left text-[12px] font-extrabold uppercase tracking-wider text-[hsl(var(--rs-tekst-zacht))]"
              >
                Richting
              </th>
              {DAK_HOEKEN.map((hoek) => (
                <th
                  key={hoek}
                  scope="col"
                  className="pb-1 text-[12.5px] font-bold tabular-nums text-[hsl(var(--rs-tekst-zacht))]"
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
                  className="whitespace-nowrap pr-2 text-left text-[14px] font-semibold text-primary"
                >
                  {richting.naam}
                </th>
                {richting.opbrengst.map((waarde, i) => (
                  <td
                    key={DAK_HOEKEN[i]}
                    className="rounded-[10px] px-1 py-[9px] text-center text-[14px] font-bold tabular-nums text-primary"
                    style={{
                      backgroundColor: vulling(waarde),
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

      <p className="vd-tekst mb-0 mt-4 text-[13.5px]">
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

    <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:grid-cols-2 md:gap-5">
      <Notitie Icon={Compass} kop="Oost-west is vaak slimmer dan het lijkt" tekst={DAK_NOTITIES.oostWest} />
      <Notitie Icon={SunMedium} kop="Schaduw is op te lossen" tekst={DAK_NOTITIES.schaduw} />
    </div>
  </>
);

const Notitie = ({ Icon, kop, tekst }: { Icon: LucideIcon; kop: string; tekst: string }) => (
  <div className="hs-tegel hs-zand p-5 md:p-6" data-veer>
    <div className="flex items-center justify-between gap-3">
      <span className="hs-h3 block">{kop}</span>
      <IconCirkel Icon={Icon} size={36} />
    </div>
    <p className="vd-tekst mb-0 mt-2">{tekst}</p>
  </div>
);
