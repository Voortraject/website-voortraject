import { Fragment } from "react";
import { ArrowRight, Building2, Equal, Globe, Map, Plus } from "lucide-react";

const niveaus = [
  {
    icon: Globe,
    title: "Landelijke subsidies",
    body: "Zoals ISDE: een landelijke regeling die gewoon bovenop andere regelingen komt.",
  },
  {
    icon: Map,
    title: "Provinciale subsidies",
    body: "Zoals Nij Begun: vergoedt isolatie voor eigenaar-bewoners in Groningen en Noord-Drenthe.",
  },
  {
    icon: Building2,
    title: "Gemeentelijke subsidies",
    body: "Veel gemeenten hebben daarnaast een eigen bijdrageregeling.",
  },
];

const PlusTeken = () => (
  <div className="flex items-center justify-center self-center" aria-hidden="true">
    <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-accent">
      <Plus size={20} strokeWidth={2.75} className="text-primary" />
    </span>
  </div>
);

export const Subsidies = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="subsidies-title">
    <div className="container-home">
      <div className="max-w-3xl">
        <h2 id="subsidies-title" className="h2-section">
          Wist je dat je subsidies kunt <span className="text-accent">stapelen</span>?
        </h2>
        <p className="mt-4 text-[18px] md:text-[20px] leading-[1.6] text-muted-foreground">
          Landelijk, provinciaal en gemeentelijk: er zijn meer regelingen dan de meeste mensen
          weten, en vaak zijn ze te combineren. Wij zoeken gratis uit wat er voor jouw adres
          geldt.
        </p>
      </div>

      {/* De stapel: drie niveaus + plustekens, met de optelsom eronder */}
      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
        {niveaus.map(({ icon: Icon, title, body }, i) => (
          <Fragment key={title}>
            <article
              className="bg-card rounded-2xl border border-border p-6 flex flex-col"
              style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)" }}
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex shrink-0 w-11 h-11 items-center justify-center rounded-full bg-accent">
                  <Icon size={20} className="text-primary" aria-hidden="true" />
                </span>
                <h3 className="font-display font-semibold text-primary text-[18px] leading-[1.25]">
                  {title}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
            </article>
            {i < niveaus.length - 1 && <PlusTeken />}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 md:mt-5 flex flex-col md:flex-row items-center gap-3 md:gap-5">
        <span
          className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-primary"
          aria-hidden="true"
        >
          <Equal size={20} strokeWidth={2.75} className="text-accent" />
        </span>
        <div
          className="flex-1 w-full rounded-2xl border-l-4 border-accent p-5 md:p-6"
          style={{ backgroundColor: "#F5F3ED" }}
        >
          <p className="text-[16px] md:text-[18px] leading-[1.5] font-semibold text-primary">
            Samen vergoeden ze soms een groot deel van je investering.
          </p>
          <p className="mt-1 text-[15px] leading-[1.6] text-muted-foreground">
            Wij zoeken uit hoe je ze combineert zonder er één te missen.
          </p>
        </div>
      </div>

      <a
        href="/subsidies/stapelen"
        className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary underline underline-offset-4 decoration-border hover:decoration-accent hover:text-accent-hover transition-colors"
      >
        Bekijk alle regelingen
        <ArrowRight size={16} aria-hidden="true" />
      </a>

      <div className="mt-7">
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
