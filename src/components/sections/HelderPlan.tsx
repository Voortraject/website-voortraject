import { CalendarClock, Euro, Handshake, ListOrdered, ShieldCheck } from "lucide-react";

import planKeukentafel from "@/assets/hero-keukentafel.webp";

const punten = [
  {
    icon: ShieldCheck,
    title: "Onafhankelijk advies",
    body: "Wij verkopen geen warmtepompen, panelen of isolatie. Alleen wat voor jouw woning logisch is.",
  },
  {
    icon: ListOrdered,
    title: "De slimste volgorde",
    body: "Welke maatregel eerst en welke later, zodat je niet twee keer betaalt of kansen misloopt.",
  },
  {
    icon: Euro,
    title: "Alle subsidies op een rij",
    body: "Landelijk, provinciaal én gemeentelijk, precies voor jouw adres.",
  },
  {
    icon: CalendarClock,
    title: "Geen wachtlijsten",
    body: "Geen maanden wachten zoals bij loketten: we plannen snel een gesprek op een moment dat jou uitkomt.",
  },
  {
    icon: Handshake,
    title: "Begeleiding tot het af is",
    body: "We koppelen je aan een passende uitvoerder en laten je niet los na het advies. Zelf kiezen mag natuurlijk ook.",
  },
];

export const HelderPlan = () => (
  <section
    className="py-16 md:py-24"
    style={{ backgroundColor: "var(--card-soft)" }}
    aria-labelledby="helder-plan-title"
  >
    <div className="container-content">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6">
          <h2 id="helder-plan-title" className="h2-section">
            Van twijfel naar een <span className="text-accent">helder plan</span>
          </h2>
          <p className="mt-4 text-[16px] md:text-[18px] leading-[1.6] text-muted-foreground">
            Geen verkooppraatje, geen standaardverhaal. We kijken eerst naar jouw woning,
            situatie en wens. Daarna weet je precies wat slim is, in welke volgorde, en welke
            subsidies je krijgt. Gratis.
          </p>

          <ul className="mt-8 space-y-5">
            {punten.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="inline-flex shrink-0 w-10 h-10 items-center justify-center rounded-full bg-secondary">
                  <Icon size={20} className="text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-primary text-[17px] leading-[1.25]">
                    {title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-[1.55] text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <img
            src={planKeukentafel}
            alt="Adviseur van Voortraject bekijkt samen met een bewoner het plan voor haar woning aan de keukentafel"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-96 lg:h-[560px] rounded-2xl object-cover"
            style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>
      </div>
    </div>
  </section>
);
