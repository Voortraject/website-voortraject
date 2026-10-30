import { useRef } from "react";
import { BadgeCheck, Compass, HandCoins } from "lucide-react";

import { useStaffel } from "@/lib/beweging";
import waaromVertrouwen from "@/assets/waarom-vertrouwen2.webp";
import { TrustCardList } from "./TrustCardList";

// Drie trust-pijlers, elk een andere vertrouwenslever en bewust géén herhaling van
// wat eerder op de pagina staat: autonomie (geen verplichting), eerlijkheid
// (verdienmodel) en risico-overname (wij toetsen de uitvoerders vooraf).
const redenen = [
  {
    icon: Compass,
    title: "Je zit nergens aan vast",
    body: "Advies zonder verplichting. Jij bepaalt wat je doet en in welk tempo. Wil je stoppen, dan kan dat, zonder gedoe.",
  },
  {
    icon: HandCoins,
    title: "Helder hoe wij verdienen",
    body: "De uitvoerder betaalt ons voor het voorwerk dat we overnemen. Voor jou is het advies gratis.",
  },
  {
    icon: BadgeCheck,
    title: "Getoetste uitvoerders",
    body: "Niet elke aannemer komt op onze lijst. We toetsen op vakwerk, eerlijke prijzen en afspraken nakomen.",
  },
];

export const WaaromKiezen = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section ref={sectie} className="section-pad-home hs-band" aria-labelledby="waarom-title">
      <div className="container-home">
        <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-2 lg:gap-14">
          {/* min-w-0: anders duwt de swiperij (3 × 88%) deze gridkolom open */}
          <div className="min-w-0">
            <h2 id="waarom-title" className="hs-h2" data-veer>
              Waarom bewoners voor <span className="hs-accent">ons</span> kiezen
            </h2>

            <TrustCardList items={redenen} tint="blauw" />
          </div>

          <div className="min-w-0" data-veer>
            <img
              src={waaromVertrouwen}
              alt="Adviseur van Voortraject schudt de hand van een tevreden bewoner bij de voordeur"
              loading="lazy"
              decoding="async"
              className="hs-foto h-56 w-full object-cover sm:h-80 lg:h-[460px]"
              style={{ objectPosition: "center 30%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
