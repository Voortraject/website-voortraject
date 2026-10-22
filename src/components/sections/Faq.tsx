import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useStaffel } from "@/lib/beweging";
import "@/styles/home-onder.css";

const faqs = [
  {
    q: "Wat kost het mij?",
    a: "Ons advies is gratis en vrijblijvend. Je zit nergens aan vast en bepaalt zelf of en wanneer je een vervolgstap zet.",
  },
  {
    q: "Hoe verdienen jullie dan geld?",
    a: "Heel simpel: de uitvoerder betaalt ons bij een geslaagde opdracht, voor het voorwerk dat we uit handen nemen: intake, dossier, subsidies en nazorg. Jij betaalt niets, en we vertellen je gewoon hoe dat zit. We verkopen zelf geen producten, dus in ons advies zit geen belang om je een bepaald merk of systeem aan te praten. We koppelen je alleen aan uitvoerders waarvan we weten dat ze goed werk leveren in jouw regio.",
  },
  {
    q: "Wat doet Voortraject precies?",
    a: "Wij geven gratis en onafhankelijk advies over verduurzamen en subsidies. We kijken eerst naar jouw woning en situatie, vertellen wat slim is en in welke volgorde, zoeken uit welke subsidies je kunt krijgen en begeleiden je naar een betrouwbare uitvoerder als je verder wilt.",
  },
  {
    q: "In welk gebied werken jullie?",
    a: "Door heel Noord-Nederland: Groningen, Drenthe en Friesland. In gemeenten waar Nij Begun loopt kennen we de regeling van binnen en buiten.",
  },
  {
    q: "Hoe snel kan ik een gesprek?",
    a: "Meestal binnen een paar werkdagen. Geen wachttijden van weken of maanden zoals bij sommige loketten. Je kiest een moment dat jou uitkomt.",
  },
  {
    q: "Wat is het verschil met een energiecoach?",
    a: "Een energiecoach adviseert vooral over energiegedrag. Wij overzien het hele traject: welke maatregelen slim zijn voor jouw woning, in welke volgorde, welke subsidies erbij passen én de begeleiding naar de uitvoering.",
  },
];

/**
 * Veelgestelde vragen: elke vraag een eigen tegel, één tegelijk open. Het
 * antwoord klapt vloeiend uit via grid-template-rows (zie home-onder.css), dus
 * zonder vaste maximale hoogte die een lang antwoord zou afkappen.
 */
export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const basis = useId();
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section ref={sectie} className="hs-band py-[52px] md:py-[88px]" aria-labelledby="faq-title">
      <div className="mx-auto max-w-[868px] px-6">
        <h2 id="faq-title" className="hs-h2 text-center" data-veer>
          Veelgestelde <span className="hs-accent">vragen</span>
        </h2>
        <p className="hs-tekst mx-auto mt-3 text-center text-[16.5px] leading-[1.5] md:text-[18px]" data-veer>
          Wat we het vaakst gevraagd krijgen, kort beantwoord.
        </p>

        <ul className="mt-[26px] grid gap-2.5 md:mt-10">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            const knopId = `${basis}-vraag-${i}`;
            const antwoordId = `${basis}-antwoord-${i}`;
            return (
              <li key={item.q} className="ho-faq-item" data-open={isOpen} data-veer>
                <h3>
                  <button
                    id={knopId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={antwoordId}
                    className="flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 rounded-[18px] py-3.5 pl-5 pr-4 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="flex-1 text-[16.5px] font-bold leading-[1.3] text-primary md:text-[18px]">
                      {item.q}
                    </span>
                    <span className="ho-faq-chev" aria-hidden="true">
                      <ChevronDown size={18} strokeWidth={2.4} />
                    </span>
                  </button>
                </h3>
                <div
                  id={antwoordId}
                  role="region"
                  aria-labelledby={knopId}
                  aria-hidden={!isOpen}
                  className="ho-faq-klap"
                >
                  <div>
                    <p className="hs-tekst px-5 pb-[18px] text-[15.5px] leading-[1.6]">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
