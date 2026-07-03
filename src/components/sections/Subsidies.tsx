import { ArrowRight, Check } from "lucide-react";

const feiten = [
  "Nij Begun vergoedt isolatie voor eigenaar-bewoners in Groningen en Noord-Drenthe",
  "ISDE is een landelijke regeling die daar gewoon bovenop komt",
  "Veel gemeenten hebben daarnaast een eigen bijdrageregeling",
];

export const Subsidies = () => (
  <section className="section-pad" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="subsidies-title">
    <div className="container-home">
      <div className="max-w-3xl">
        <h2 id="subsidies-title" className="h2-section">
          Wist je dat je subsidies kunt <span className="text-accent">stapelen</span>?
        </h2>
        <p className="mt-4 text-[16px] md:text-[18px] leading-[1.6] text-muted-foreground">
          Landelijk, provinciaal en gemeentelijk: er zijn meer regelingen dan de meeste mensen
          weten, en vaak zijn ze te combineren. Wij zoeken gratis uit wat er voor jouw adres
          geldt.
        </p>
      </div>

      <div
        className="mt-8 md:mt-10 max-w-3xl rounded-2xl border-l-4 border-accent p-6 md:p-7"
        style={{ backgroundColor: "#F5F3ED" }}
      >
        <ul className="space-y-3.5">
          {feiten.map((feit) => (
            <li key={feit} className="flex items-start gap-3">
              <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-[15px] md:text-[16px] leading-[1.6] text-primary">{feit}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href="/subsidies/stapelen"
        className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary underline underline-offset-4 decoration-border hover:decoration-accent hover:text-accent-hover transition-colors"
      >
        Bekijk alle regelingen
        <ArrowRight size={16} aria-hidden="true" />
      </a>

      <div className="mt-8">
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold bg-accent text-primary transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Plan een gratis gesprek
        </a>
      </div>
    </div>
  </section>
);
