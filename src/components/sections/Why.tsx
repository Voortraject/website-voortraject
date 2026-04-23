import { Check } from "lucide-react";
import whyPhoto from "@/assets/why-photo.jpg";

const points = [
  {
    title: "Minder druk op de ondernemer",
    body: "Jullie focus blijft op de uitvoering.",
  },
  {
    title: "Bewoners beter begeleid",
    body: "Duidelijke uitleg en persoonlijk contact vergroten het vertrouwen.",
  },
  {
    title: "Offertes sneller en duidelijker",
    body: "Gestructureerde voorbereiding bespaart tijd en voorkomt misverstanden.",
  },
  {
    title: "Hogere kans op akkoord",
    body: "Een goed voortraject leidt vaker tot een getekende opdracht.",
  },
  {
    title: "Schaalbaar zonder direct extra personeel",
    body: "Jullie kunnen meer trajecten aannemen zonder intern te hoeven uitbreiden.",
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
