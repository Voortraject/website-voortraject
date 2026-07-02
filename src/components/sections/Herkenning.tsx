import { Clock, Coins, MessagesSquare, ShieldQuestion } from "lucide-react";

import herkenningVoortuin from "@/assets/herkenning-voortuin.webp";

const twijfels = [
  {
    icon: MessagesSquare,
    title: "Iedereen vertelt iets anders",
    body: "De een raadt isolatie aan, de ander een warmtepomp, de derde zegt: wacht nog even. Wie heeft er gelijk?",
  },
  {
    icon: Clock,
    title: "Maanden wachten op een afspraak",
    body: "Gemeenteloketten en energiecoöperaties hebben wachtlijsten van weken tot maanden. Ondertussen gebeurt er niets.",
  },
  {
    icon: ShieldQuestion,
    title: "Onduidelijk wie je kunt vertrouwen",
    body: "Welke uitvoerder levert goed werk? Reviews spreken elkaar tegen en het voelt als gokken.",
  },
  {
    icon: Coins,
    title: "Bang om subsidies mis te lopen",
    body: "Er zijn meer regelingen dan je denkt en ze veranderen regelmatig. Niemand wil achteraf ontdekken dat er geld is blijven liggen.",
  },
];

export const Herkenning = () => (
  <section className="py-16 md:py-24" style={{ backgroundColor: "#F4EEE0" }} aria-labelledby="herkenning-title">
    <div className="container-content">
      <div className="max-w-3xl">
        <h2 id="herkenning-title" className="h2-section">
          Waar moet je <span className="text-accent">beginnen?</span>
        </h2>
        <p className="mt-4 text-[16px] md:text-[18px] leading-[1.6] text-muted-foreground">
          Je wilt wel verduurzamen, maar zodra je je erin verdiept loop je tegen dezelfde muur
          aan. Herkenbaar?
        </p>
      </div>

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5">
          <img
            src={herkenningVoortuin}
            alt="Adviseur van Voortraject in gesprek met twee bewoners in de voortuin van hun rijtjeshuis"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-80 lg:h-full lg:min-h-[520px] rounded-2xl object-cover"
            style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <div className="grid sm:grid-cols-2 gap-5 lg:flex-1 lg:auto-rows-fr">
            {twijfels.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="bg-card rounded-2xl border border-border p-5 md:p-6 flex flex-col justify-center transition-all duration-200 ease-out hover:-translate-y-0.5"
                style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex shrink-0 w-10 h-10 items-center justify-center rounded-full bg-secondary">
                    <Icon size={20} className="text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="font-display font-semibold text-primary text-[18px] leading-[1.2] tracking-[-0.01em]">
                    {title}
                  </h3>
                </div>
                <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[24px] md:text-[30px] font-display font-semibold leading-[1.2] text-primary">
            Precies daarom bestaat <span className="text-accent">Voortraject</span>.
          </p>
        </div>
      </div>
    </div>
  </section>
);
