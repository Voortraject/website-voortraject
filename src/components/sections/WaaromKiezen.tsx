import { CalendarClock, HandCoins, Layers, ShieldCheck } from "lucide-react";

import waaromVertrouwen from "@/assets/waarom-vertrouwen.webp";

const redenen = [
  {
    icon: ShieldCheck,
    title: "Onafhankelijk advies",
    body: "Wij verkopen geen producten. Ons advies heeft geen commercieel belang; alleen wat voor jouw woning logisch is.",
  },
  {
    icon: HandCoins,
    title: "Transparant over hoe wij verdienen",
    body: "De uitvoerder betaalt ons bij een geslaagde opdracht. Jij betaalt niets, en we vertellen je gewoon hoe dat zit.",
  },
  {
    icon: Layers,
    title: "Alle subsidies op een rij",
    body: "Landelijk, provinciaal en gemeentelijk, inclusief hoe je ze slim combineert.",
  },
  {
    icon: CalendarClock,
    title: "Binnen dagen een gesprek",
    body: "Geen wachtlijsten van weken zoals bij loketten. Je kiest een moment dat jou uitkomt.",
  },
];

export const WaaromKiezen = () => (
  <section className="section-pad" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="waarom-title">
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
