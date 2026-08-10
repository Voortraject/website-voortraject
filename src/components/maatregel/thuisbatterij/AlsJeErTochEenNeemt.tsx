import { AlertTriangle, Check } from "lucide-react";

import { BRONNEN, LETTEN } from "@/data/thuisbatterij";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Praktisch advies voor wie de afweging al gemaakt heeft. "Wij raden het meestal
 * af" is geen reden om iemand die het toch doet zonder informatie te laten
 * zitten; dan gaat hij het elders halen bij een partij die er wél aan verdient.
 *
 * Het eerste punt staat er als waarschuwing en niet als vinkje: een batterij in
 * het stopcontact is een echt veiligheidsrisico, geen voorkeurskwestie.
 */

export const AlsJeErTochEenNeemt = () => {
  const [waarschuwing, ...rest] = LETTEN;

  return (
    <>
      <div className="text-center">
        <SectieKop center>
          <Accent tekst="Als je er toch een [[neemt]]" />
        </SectieKop>
        <p
          className="mt-4 mx-auto text-base leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
        >
          Er zijn goede redenen om er wel een te nemen. Dit zijn de vier dingen die dan het meest
          uitmaken.
        </p>
      </div>

      <div
        className="mt-10 rounded-2xl p-5 md:p-6 flex items-start gap-4"
        style={{ backgroundColor: "#FEF7F7", border: "1px solid #F5D9D9" }}
      >
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0"
          style={{ width: 34, height: 34, backgroundColor: "#F8E5E5" }}
        >
          <AlertTriangle size={18} color="#C0392B" aria-hidden="true" />
        </span>
        <div>
          <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
            {waarschuwing.kop}
          </span>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.8, margin: "6px 0 0 0" }}
          >
            {waarschuwing.tekst}
          </p>
        </div>
      </div>

      <div
        className="mt-5 rounded-2xl p-6 md:p-8"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
          {rest.map((punt) => (
            <div key={punt.kop} className="flex items-start gap-3">
              <Check
                size={17}
                className="mt-[4px] shrink-0"
                style={{ color: KLEUR.goud }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <div>
                <span className="block text-[15.5px] font-semibold" style={{ color: KLEUR.navy }}>
                  {punt.kop}
                </span>
                <span
                  className="mt-1 block text-[14.5px] leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.7 }}
                >
                  {punt.tekst}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
        Het risico van batterijen die je in het stopcontact prikt staat beschreven bij{" "}
        <a
          href={BRONNEN.batterij.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {BRONNEN.batterij.naam}
        </a>
        , gecontroleerd op {BRONNEN.batterij.gecontroleerd}.
      </p>
    </>
  );
};
