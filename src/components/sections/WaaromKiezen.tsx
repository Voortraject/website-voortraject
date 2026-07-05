import { BadgeCheck, Compass, HandCoins } from "lucide-react";

import waaromVertrouwen from "@/assets/waarom-vertrouwen2.webp";
import { TrustCardList } from "./TrustCardList";

// Drie trust-pijlers, elk een andere vertrouwenslever en bewust géén herhaling van
// wat eerder op de pagina staat: eerlijkheid (verdienmodel), autonomie (geen
// verplichting) en risico-overname (wij toetsen de uitvoerders vooraf).
const redenen = [
  {
    icon: HandCoins,
    title: "Je weet precies hoe wij verdienen",
    body: "De uitvoerder betaalt ons voor het voorwerk dat we overnemen. Voor jou is het advies gratis.",
  },
  {
    icon: Compass,
    title: "Je zit nergens aan vast",
    body: "Advies zonder verplichting. Jij bepaalt wat je doet en in welk tempo. Wil je niet verder, dan stopt het, zonder gedoe.",
  },
  {
    icon: BadgeCheck,
    title: "We koppelen je aan getoetste uitvoerders",
    body: "Niet elke aannemer komt op onze lijst. We toetsen uitvoerders uit de regio op vakwerk, eerlijke prijzen en afspraken nakomen.",
  },
];

export const WaaromKiezen = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="waarom-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h2 id="waarom-title" className="h2-section">
            Waarom bewoners voor <span className="text-accent">ons</span> kiezen
          </h2>

          <TrustCardList items={redenen} />
        </div>

        <div>
          <img
            src={waaromVertrouwen}
            alt="Adviseur van Voortraject schudt de hand van een tevreden bewoner bij de voordeur"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl object-cover"
            style={{ objectPosition: "center 30%", boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>
      </div>
    </div>
  </section>
);
