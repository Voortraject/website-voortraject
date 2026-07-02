import { CalendarClock, Check, Layers, MessageSquareText, Sparkles } from "lucide-react";

import waaromVertrouwen from "@/assets/waarom-vertrouwen.webp";

const redenen = [
  {
    icon: CalendarClock,
    title: "Binnen dagen een gesprek, geen maanden",
    body: "Je kiest een moment dat jou uitkomt.",
  },
  {
    icon: MessageSquareText,
    title: "Concreet advies, geen “het hangt ervan af”",
    body: "Je vertrekt met een helder beeld van wat slim is voor jouw woning.",
  },
  {
    icon: Layers,
    title: "Alles op één plek",
    body: "Maatregelen, subsidies, volgorde én uitvoerder. Jij hoeft geen vijf partijen te vergelijken.",
  },
  {
    icon: Sparkles,
    title: "Jij hoeft geen subsidie-expert te zijn",
    body: "Wij kennen de regelingen en houden wijzigingen bij.",
  },
];

export const WaaromKiezen = () => (
  <section className="section-pad" style={{ backgroundColor: "#F4EEE0" }} aria-labelledby="waarom-title">
    <div className="container-content">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
        <div className="order-1">
          <h2 id="waarom-title" className="h2-section">
            Waarom bewoners voor <span className="text-accent">ons kiezen</span>
          </h2>

          {/* Onafhankelijkheidsbelofte — de belangrijkste vertrouwenstroef */}
          <div className="mt-6 border-l-4 border-accent pl-5">
            <p className="font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
              Geen verkooppraatje, en geen commissie.
            </p>
            <p className="mt-2.5 text-[15px] md:text-[16px] leading-[1.6] text-muted-foreground">
              We verkopen geen producten en krijgen geen commissie van fabrikanten of
              leveranciers. Ons advies heeft dus geen verborgen belang. Wij worden betaald
              door de uitvoerder voor het voorwerk dat we uit handen nemen — en we koppelen
              je alleen aan partijen waarvan we weten dat ze goed werk leveren in jouw regio.
            </p>
          </div>

          <ul className="mt-7 space-y-4">
            {redenen.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="inline-flex shrink-0 w-9 h-9 items-center justify-center rounded-full bg-secondary">
                  <Icon size={18} className="text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-primary text-[16px] leading-[1.3]">{title}</h3>
                  <p className="mt-0.5 text-[15px] leading-[1.5] text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-2 text-[15px] font-medium text-primary">
            <Check size={18} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
            <span>Begeleiding tot het af is — wij stoppen niet na het advies.</span>
          </div>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold bg-accent text-primary transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Plan een gratis gesprek
          </a>
        </div>

        <div className="order-2 relative">
          <img
            src={waaromVertrouwen}
            alt="Adviseur van Voortraject schudt de hand van een tevreden bewoner bij de voordeur"
            loading="lazy"
            decoding="async"
            className="w-full h-72 sm:h-96 lg:absolute lg:inset-0 lg:h-full rounded-2xl object-cover"
            style={{ objectPosition: "center 30%", boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>
      </div>
    </div>
  </section>
);
