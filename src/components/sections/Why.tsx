import { Check } from "lucide-react";
import whyPhoto from "@/assets/why-photo.jpg";

const points = [
  {
    title: "Ervaring in de sector",
    body: "Opgericht door professionals met jarenlange ervaring in verduurzaming.",
  },
  {
    title: "Geen vaste kosten",
    body: "Geen vaste kosten, geen abonnement. Wij rekenen per getekend akkoord.",
  },
  {
    title: "Eén partij, het hele voortraject",
    body: "Van bewonerscontact tot getekend akkoord. Jullie hoeven niet met meerdere partijen te schakelen.",
  },
  {
    title: "Volledig digitaal dossier",
    body: "Geen losse mails en notities. Eén compleet dossier dat klaar is voor uitvoering.",
  },
  {
    title: "Thuis in Noord-Nederland",
    body: "Korte lijnen en persoonlijk contact. Wij kennen de regio en de mensen die er werken.",
  },
];

export const Why = () => (
  <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
    <div className="container-content">
      <div className="text-center mb-16">
        <h2 className="h2-section">
          Waarom uitvoerders voor ons{" "}
          <span style={{ color: "hsl(var(--accent))" }}>kiezen</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <div className="hidden md:block">
          <img
            src={whyPhoto}
            alt="Adviseur in gesprek met bewoners aan tafel"
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl"
            style={{ boxShadow: "0 4px 24px rgba(21,44,78,0.06)" }}
          />
        </div>

        <div>
          <ul className="space-y-8">
            {points.map((p) => (
              <li key={p.title} className="flex items-start gap-5">
                <Check
                  size={24}
                  strokeWidth={2.5}
                  className="text-accent shrink-0 mt-1"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display font-semibold text-[18px] tracking-[-0.02em] text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.5] text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
