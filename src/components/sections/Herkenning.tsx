import { useRef } from "react";
import { Coins, MessagesSquare, Scale } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { useStaffel } from "@/lib/beweging";
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
    body: "Bij jou thuis of telefonisch. We kijken naar jouw woning, situatie en wensen.",
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

export const Herkenning = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    // Een eigen zacht oker band (oktober 2026, "heel veel wit zo"): breekt het
    // lange witte stuk van hero tot "Waar we bij helpen". Eerst blauwgrijs, maar
    // dat oogde koud; oker is warm en duidelijk anders dan het zand eronder.
    // De tegels zijn hier wit, zand zou in de band verdwijnen.
    <section ref={sectie} className="section-pad-home hs-band-oker" aria-labelledby="herkenning-title">
      <div className="container-home">
        {/* Herken je dit? Telefoon: swipen, desktop: drie tegels naast elkaar */}
        <h2 id="herkenning-title" className="hs-h2" data-veer>
          <span className="hs-accent">Herken</span> je dit?
        </h2>

        <TrustCardList items={twijfels} desktop="cards" tint="wit" />

        {/* Van twijfel naar een compleet plan */}
        <div className="mt-12 lg:mt-20">
          {/* Titel op volle breedte, zodat de zin op één regel past */}
          <h2 id="helder-plan-title" className="hs-h2" data-veer>
            Van twijfel naar een <span className="hs-accent">compleet</span> plan
          </h2>

          <div className="mt-6 grid grid-cols-1 items-center gap-7 lg:mt-10 lg:grid-cols-2 lg:gap-14">
            {/* DOM-volgorde foto→stappen (telefoon: foto boven de stappen);
                op desktop wisselt `order` ze om naar stappen links, foto rechts. */}
            <div className="min-w-0 lg:order-2" data-veer>
              <img
                src={heroKeukentafel}
                alt="Adviseur van Voortraject in gesprek met een bewoner aan tafel"
                loading="lazy"
                decoding="async"
                className="hs-foto h-56 w-full object-cover sm:h-80 lg:h-[420px]"
              />
            </div>

            <div className="min-w-0 lg:order-1">
              <ol className="grid gap-[22px]">
                {stappen.map(({ nummer, title, body }) => (
                  <li key={nummer} className="grid grid-cols-[44px_1fr] items-start gap-4" data-veer>
                    <span
                      className="hs-rondje hs-rondje-ink h-11 w-11 font-['Inter_Tight','Inter',sans-serif] text-[15px] font-bold tracking-[-0.01em]"
                      aria-hidden="true"
                    >
                      {nummer}
                    </span>
                    <div>
                      <h3 className="hs-h3 pt-[9px]">{title}</h3>
                      <p className="hs-tekst mt-1 text-[15px] leading-[1.6]">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {/* Uitgelijnd met de tekst van de stappen: rondje 44 + tussenruimte 16 */}
              <div className="mt-[26px] pl-[60px]" data-veer>
                <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
