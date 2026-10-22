import { useRef } from "react";

import { CtaButton } from "@/components/CtaButton";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import { useStaffel } from "@/lib/beweging";

/**
 * Slot-CTA van de homepagina. Hoort via de `cta`-prop in het donkere paneel van
 * de Footer, dus zonder eigen achtergrond. Eén oker knop; bellen is de rustige
 * glasknop ernaast.
 */
export const ClosingCta = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section
      ref={sectie}
      className="hs-op-donker relative z-10 pb-4 pt-[60px] text-center text-primary-foreground md:pt-[88px]"
      aria-labelledby="closing-cta-title"
    >
      <div className="container-content">
        <h2 id="closing-cta-title" className="hs-h2 mx-auto max-w-[900px] text-primary-foreground" data-veer>
          Snel duidelijkheid voor jouw woning
        </h2>
        <p
          className="mx-auto mt-3.5 max-w-[560px] text-[16px] leading-[1.6] text-primary-foreground/85 md:text-[17px]"
          data-veer
        >
          In een gratis gesprek brengen we samen in kaart wat mogelijk is, welke maatregelen
          slim zijn voor jouw woning en welke subsidies je kunt krijgen. Je bepaalt daarna
          zelf wat je ermee doet.
        </p>

        {/* Telefoon: twee knoppen over de volle breedte onder elkaar. */}
        <div className="mt-7 grid gap-3 sm:flex sm:justify-center sm:gap-4" data-veer>
          <CtaButton href="/contact" className="w-full sm:w-auto sm:px-8">
            Plan een gratis gesprek
          </CtaButton>
          <OfBelOnsCta vorm="glas" className="w-full sm:w-auto" />
        </div>
      </div>
    </section>
  );
};
