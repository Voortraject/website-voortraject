import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Wat kost het mij?",
    a: "Ons advies is gratis en vrijblijvend. Je zit nergens aan vast en bepaalt zelf of en wanneer je een vervolgstap zet.",
  },
  {
    q: "Hoe verdienen jullie dan geld?",
    a: "Heel simpel: de uitvoerder betaalt ons bij een geslaagde opdracht, voor het voorwerk dat we uit handen nemen — intake, dossier, subsidies en nazorg. Jij betaalt niets, en we vertellen je gewoon hoe dat zit. We verkopen zelf geen producten, dus in ons advies zit geen belang om je een bepaald merk of systeem aan te praten. We koppelen je alleen aan uitvoerders waarvan we weten dat ze goed werk leveren in jouw regio.",
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
    a: "Meestal binnen een paar werkdagen. Geen wachttijden van weken of maanden zoals bij sommige loketten — je kiest een moment dat jou uitkomt.",
  },
  {
    q: "Wat is het verschil met een energiecoach?",
    a: "Een energiecoach adviseert vooral over energiegedrag. Wij overzien het hele traject: welke maatregelen slim zijn voor jouw woning, in welke volgorde, welke subsidies erbij passen én de begeleiding naar de uitvoering.",
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-[48px] md:py-[72px]" style={{ backgroundColor: "#F5F3ED" }}>
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="h2-section text-center" style={{ color: "#152C4E", fontWeight: 600 }}>
          Veelgestelde <span style={{ color: "hsl(var(--accent))" }}>vragen</span>
        </h2>
        <p
          className="text-center mx-auto"
          style={{
            color: "#152C4E",
            opacity: 0.75,
            fontSize: 18,
            marginTop: 16,
            marginBottom: 40,
          }}
        >
          Wat we het vaakst gevraagd krijgen, kort beantwoord.
        </p>

        <div
          className="mx-auto"
          style={{
            maxWidth: 820,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E2DB",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  borderBottom: i === faqs.length - 1 ? "none" : "1px solid #E5E2DB",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center text-left"
                  style={{
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    gap: 20,
                  }}
                >
                  <h3
                    className="font-display flex-1"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: "#152C4E",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {item.q}
                  </h3>
                  <ChevronDown
                    size={20}
                    color="#E8B547"
                    style={{
                      opacity: 0.5,
                      transition: "transform 200ms ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 400 : 0,
                    overflow: "hidden",
                    transition: "max-height 300ms ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      color: "#6B6B6B",
                      lineHeight: 1.6,
                      margin: 0,
                      padding: "0 24px 20px 24px",
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
