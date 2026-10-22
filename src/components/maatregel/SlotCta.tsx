import { Phone } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { Accent } from "./primitieven";

/**
 * De slot-CTA van /verduurzamen en de maatregelpagina's. Hoort via de
 * `cta`-prop in het donkere paneel van de Footer (les 2026-06-24 en
 * 2026-08-10), niet als losse donkere sectie erboven.
 *
 * Eén oker knop; bellen is de rustige glazen knop ernaast, zoals op de
 * homepagina van de huisstijl van oktober 2026.
 */
export const SlotCta = ({
  kop,
  tekst,
  label,
  href,
  knop = "accent",
}: {
  kop: string;
  tekst: string;
  label: string;
  href: string;
  /**
   * "licht" waar de oker knop van de subsidiecheck vlak erboven staat (op
   * /verduurzamen): dan staan er anders twee oker knoppen in één scherm.
   */
  knop?: "accent" | "licht";
}) => (
  <section className="hs-op-donker w-full pt-[60px] pb-4 md:pt-[88px]">
    <div className="mx-auto max-w-[900px] px-6 text-center">
      <h2 className="hs-h2 m-0 text-primary-foreground">
        <Accent tekst={kop} />
      </h2>
      <p className="mx-auto mt-3.5 max-w-[600px] text-[16px] leading-relaxed text-primary-foreground/85 md:text-[17px]">
        {tekst}
      </p>
      <div className="mt-7 grid gap-3 sm:flex sm:items-center sm:justify-center sm:gap-4">
        <CtaButton href={href} variant={knop} className="w-full sm:w-auto">
          {label}
        </CtaButton>
        <a
          href="tel:+31502112689"
          aria-label="Bel ons: 050 211 2689"
          className="hs-knop hs-knop-glas gap-3 pl-2 pr-[22px]"
        >
          <span className="hs-rondje hs-rondje-glas h-[38px] w-[38px]" aria-hidden="true">
            <Phone size={16} strokeWidth={2.25} />
          </span>
          <span className="grid text-left leading-[1.15]">
            <small className="text-[12px] font-semibold text-primary-foreground/75">Of bel ons</small>
            <span className="text-[17px] font-extrabold">050 211 2689</span>
          </span>
        </a>
      </div>
    </div>
  </section>
);
