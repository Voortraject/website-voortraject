import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export const Faq = () => (
  <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
    <div className="max-w-3xl mx-auto px-6">
      <h2 className="h2-section text-center" style={{ color: "#152C4E", fontWeight: 600 }}>
        Veelgestelde vragen
      </h2>
      <p
        className="text-center mx-auto"
        style={{
          color: "#152C4E",
          opacity: 0.75,
          fontSize: 16,
          marginTop: 16,
          marginBottom: 32,
        }}
      >
        Wat we het vaakst gevraagd krijgen, kort beantwoord.
      </p>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-0"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E2DB",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 12,
            }}
          >
            <AccordionTrigger
              className="hover:no-underline p-0 [&>svg]:hidden flex flex-row items-center justify-between gap-4"
              style={{ color: "#152C4E", fontSize: 16, fontWeight: 500 }}
            >
              <span className="text-left">{item.q}</span>
              <ChevronDown
                size={20}
                color="#152C4E"
                style={{ opacity: 0.5 }}
                className="shrink-0 transition-transform duration-200 ease-in-out [[data-state=open]_&]:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent
              className="pb-0"
              style={{
                color: "#152C4E",
                opacity: 0.75,
                fontSize: 15,
                lineHeight: 1.6,
                paddingTop: 16,
              }}
            >
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
