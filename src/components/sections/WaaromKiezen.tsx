import { BadgeCheck, Compass, HandCoins } from "lucide-react";

import waaromVertrouwen from "@/assets/waarom-vertrouwen2.webp";

// Drie trust-pijlers, elk een andere vertrouwenslever en bewust géén herhaling van
// wat eerder op de pagina staat: eerlijkheid (verdienmodel), autonomie (geen
// verplichting) en risico-overname (wij toetsen de uitvoerders vooraf).
const redenen = [
  {
    icon: HandCoins,
    title: "Je weet precies hoe wij verdienen",
    body: "De uitvoerder betaalt ons voor het voortraject en de bewonersbegeleiding die wij overnemen. Voor jou is ons advies daarom gratis.",
  },
  {
    icon: Compass,
    title: "Je zit nergens aan vast",
    body: "Advies zonder verplichting. Jij bepaalt wat je doet en in welk tempo. Wil je niet verder, dan stopt het, zonder gedoe.",
  },
  {
    icon: BadgeCheck,
    title: "We koppelen je alleen aan getoetste uitvoerders",
    body: "Niet elke aannemer komt op onze lijst. We toetsen uitvoerders uit de regio op vakwerk, eerlijke prijzen en afspraken nakomen.",
  },
];

export const WaaromKiezen = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="waarom-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h2 id="waarom-title" className="h2-section">
            Waarom bewoners voor <span className="text-accent">ons</span> kiezen
          </h2>

          <ul className="mt-8 space-y-6">
            {redenen.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="inline-flex shrink-0 w-11 h-11 items-center justify-center rounded-full bg-accent">
                  <Icon size={20} className="text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-primary text-[17px] leading-[1.3]">
                    {title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <img
            src={waaromVertrouwen}
            alt="Adviseur van Voortraject schudt de hand van een tevreden bewoner bij de voordeur"
            loading="lazy"
            decoding="async"
            className="w-full h-72 sm:h-96 lg:h-[520px] rounded-2xl object-cover"
            style={{ objectPosition: "center 30%", boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>
      </div>
    </div>
  </section>
);
