import { Check } from "lucide-react";

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
  <section className="bg-background section-pad">
    <div className="container-content">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <h2 className="font-sans font-semibold text-3xl md:text-[40px] leading-tight tracking-tight text-center lg:text-left">
            Waarom uitvoerders voor ons kiezen
          </h2>
        </div>
        <ul className="lg:col-span-7 space-y-7">
          {points.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="mt-1 shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent/15">
                <Check size={14} className="text-accent" strokeWidth={3} aria-hidden="true" />
              </span>
              <p className="text-[17px] leading-relaxed">
                <span className="font-semibold text-foreground">{p.title}</span>
                <span className="text-muted-foreground"> — {p.body}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
