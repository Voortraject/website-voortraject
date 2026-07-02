import { Check } from "lucide-react";

const items = [
  "Geen commissie van fabrikanten of leveranciers",
  "Lokaal team, actief in Groningen, Friesland en Drenthe",
  "Kennis van ISDE, Nij Begun en gemeentelijke subsidies",
  "Begeleiding tot de uitvoering klaar is",
];

export const TrustBar = () => (
  <section aria-label="Waar je op kunt rekenen" className="bg-secondary border-y border-border">
    <div className="container-content py-4 md:py-5">
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {items.map((item) => (
          <li key={item} className="inline-flex items-center gap-2 text-[14px] font-medium text-primary">
            <Check size={16} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </section>
);
