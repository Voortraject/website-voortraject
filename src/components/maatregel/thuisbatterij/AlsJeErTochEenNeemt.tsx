import { AlertTriangle, Check } from "lucide-react";

import { BRONNEN, LETTEN } from "@/data/thuisbatterij";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

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
        <p className="vd-lead mx-auto mt-3 max-w-[640px]">
          Er zijn goede redenen om er wel een te nemen. Dit zijn de vier dingen die dan het meest
          uitmaken.
        </p>
      </div>

      <div className="hs-tegel vd-let-op mt-7 flex items-start gap-4 p-5 md:mt-10 md:p-6" data-veer>
        <IconCirkel Icon={AlertTriangle} kleur="let-op" size={36} />
        <div>
          <span className="hs-h3 block">{waarschuwing.kop}</span>
          <p className="m-0 mt-1.5 text-[15px] leading-relaxed text-foreground">{waarschuwing.tekst}</p>
        </div>
      </div>

      <div className="hs-tegel hs-blauw-zacht mt-4 p-5 md:mt-5 md:p-8" data-veer>
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
          {rest.map((punt) => (
            <div key={punt.kop} className="flex items-start gap-3">
              <IconCirkel Icon={Check} kleur="groen" size={28} />
              <div>
                <span className="block text-[15.5px] font-bold text-primary">{punt.kop}</span>
                <span className="vd-tekst mt-1 block text-[14.5px]">{punt.tekst}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="vd-tekst mt-5 text-[13.5px]">
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
