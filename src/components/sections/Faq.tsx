import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Wat doet Voortraject precies?",
    a: "Wij pakken het voortraject op rondom verduurzamen: bewonersbegeleiding, advies, dossiervorming en uitleg over regelingen. Bewoners krijgen sneller duidelijkheid en uitvoerders kunnen zich richten op de uitvoering.",
  },
  {
    q: "Voor wie werken jullie?",
    a: "Voor uitvoerders die het voortraject buiten de deur willen zetten en zich willen richten op planning en uitvoering. En voor bewoners die willen verduurzamen, maar vastlopen in keuzes, regelingen of wachttijden.",
  },
  {
    q: "Wat is het verschil met een isolatieadviseur of energiecoach?",
    a: "Een isolatieadviseur maakt een isolatieplan en een energiecoach geeft advies over energiegedrag. Wij begeleiden het hele traject van eerste vraag tot uitvoering, inclusief regelingen, dossier en koppeling met een betrouwbare uitvoerder.",
  },
  {
    q: "In welk gebied werken jullie?",
    a: "Primair in de provincies Groningen en Noord-Drenthe, met focus op gemeenten waar Nij Begun loopt. Voor andere regio's kun je contact opnemen, dan kijken we wat mogelijk is.",
  },
  {
    q: "Wat kost een gesprek?",
    a: "Het eerste gesprek is gratis en vrijblijvend. Daarna bespreken we samen of verdere begeleiding zinvol is en wat dat kost.",
  },
  {
    q: "Hoe snel kunnen jullie schakelen?",
    a: "Meestal kunnen we binnen een paar werkdagen een eerste gesprek inplannen. Geen wachttijden van weken of maanden zoals bij sommige bestaande loketten.",
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="h2-section text-center" style={{ color: "#152C4E", fontWeight: 600 }}>
          Veelgestelde <span style={{ color: "hsl(var(--accent))" }}>vragen</span>
        </h2>
        <p
          className="text-center mx-auto"
          style={{
            color: "#152C4E",
            opacity: 0.75,
            fontSize: 16,
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
