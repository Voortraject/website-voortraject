import { Coins, MessagesSquare, Scale } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import heroKeukentafel from "@/assets/hero-keukentafel.webp";
import { TrustCardList } from "./TrustCardList";

const twijfels = [
  {
    icon: MessagesSquare,
    title: "Ik weet niet wie ik moet geloven",
    body: "De installateur zegt warmtepomp, de buurman eerst isoleren, online lees je: nog even wachten. Wie heeft er nou gelijk?",
  },
  {
    icon: Scale,
    title: "Ik wil geen verkooppraatje",
    body: "Elk “gratis advies” eindigt bij een offerte voor wat ze zelf verkopen. Waar vind je nog iemand zonder eigen belang?",
  },
  {
    icon: Coins,
    title: "Ik wil geen geld laten liggen",
    body: "Er zijn meer regelingen dan je denkt, en sommige kun je stapelen. Maar hoe weet je zeker dat je niets misloopt?",
  },
];

const stappen = [
  {
    nummer: "01",
    title: "Gratis gesprek",
    body: "Bij jou thuis of telefonisch. We kijken naar jouw woning, situatie en wensen. Duurt 30 tot 45 minuten.",
  },
  {
    nummer: "02",
    title: "Helder plan",
    body: "Je hoort welke maatregelen slim zijn, in welke volgorde, en welke subsidies erbij horen. Alles op papier.",
  },
  {
    nummer: "03",
    title: "Uitvoering geregeld",
    body: "Wij koppelen je aan een getoetste uitvoerder uit de regio en blijven betrokken tot het klaar is.",
  },
];

export const Herkenning = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="herkenning-title">
    <div className="container-home">
      {/* Herken je dit? — drie kaarten naast elkaar */}
      <h2 id="herkenning-title" className="h2-section">
        <span className="text-accent">Herken</span> je dit?
      </h2>

      <TrustCardList items={twijfels} desktop="cards" />

      {/* Van twijfel naar een compleet plan */}
      <div className="mt-12 lg:mt-16">
        {/* Titel op volle breedte, zodat de zin op één regel past */}
        <h2 id="helder-plan-title" className="h2-section">
          Van twijfel naar een <span className="text-accent">compleet</span> plan
        </h2>

        <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* DOM-volgorde foto→stappen (mobiel: foto tussen kaarten en stappen);
              op desktop wisselt `order` ze om naar stappen links, foto rechts. */}
          <div className="lg:order-2">
            <img
              src={heroKeukentafel}
              alt="Adviseur van Voortraject in gesprek met een bewoner aan tafel"
              loading="lazy"
              decoding="async"
              className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl object-cover"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>

          <ol className="space-y-0 lg:order-1">
            {stappen.map(({ nummer, title, body }, i) => {
              const isLaatste = i === stappen.length - 1;
              return (
                <li key={nummer} className="relative flex gap-5 md:gap-6">
                  {/* Tijdlijn: nummer + verticale lijn naar de volgende stap */}
                  <div className="flex flex-col items-center w-12 md:w-16 shrink-0">
                    <span
                      className="font-display font-bold text-accent text-[32px] md:text-[42px] leading-none tracking-[-0.03em]"
                      aria-hidden="true"
                    >
                      {nummer}
                    </span>
                    {!isLaatste && <span className="w-px flex-1 my-3 bg-border" aria-hidden="true" />}
                  </div>
                  <div className={isLaatste ? "pt-1 md:pt-1.5" : "pb-6 pt-1 md:pt-1.5"}>
                    <h3 className="font-display font-semibold text-primary text-[19px] md:text-[22px] leading-[1.2] tracking-[-0.01em]">
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] md:text-[16px] leading-[1.6] text-muted-foreground">{body}</p>
                    {isLaatste && (
                      // Zelfde tussenruimte als tussen de stappen: pb-6 + pt van de volgende stap
                      <div className="mt-7 md:mt-[1.875rem]">
                        <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  </section>
);
