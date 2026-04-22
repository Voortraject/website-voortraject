import { SectionLabel } from "../SectionLabel";

const ourSteps = [
  { n: "01", short: "Intake", title: "Intake en situatie in kaart", body: "We brengen de bewoner, de woning en de wensen helder in beeld." },
  { n: "02", short: "Uitleg", title: "Uitleg maatregelen en regelingen", body: "We leggen de opties uit en maken subsidies en regelingen begrijpelijk." },
  { n: "03", short: "Offerte", title: "Offerte en opdrachtbevestiging", body: "We stellen een offerte op en zorgen dat alle informatie klopt." },
  { n: "04", short: "Akkoord", title: "Akkoord en overdracht", body: "Na akkoord leveren we een volledig dossier aan de uitvoerder." },
];

const handover = {
  n: "05",
  short: "Uitvoering",
  title: "Uitvoering en oplevering",
  body: "De uitvoerder plant in en voert het werk uit, met een compleet dossier als vertrekpunt.",
};

export const Process = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <SectionLabel number="02" label="PROCES" />
      <div className="mt-16 max-w-[720px]">
        <h2 className="h2-section text-foreground">Van eerste contact tot akkoord</h2>
        <p className="mt-6 body-lg text-muted-foreground max-w-[640px]">
          Wij nemen het volledige voortraject over. Jullie focussen op de uitvoering.
        </p>
      </div>

      {/* Desktop / tablet: segmented pill bar */}
      <div className="mt-20 hidden md:block">
        {/* Group labels */}
        <div className="flex items-end mb-4">
          <div className="flex-[4] pr-4">
            <p
              className="font-sans font-medium uppercase text-accent text-[13px]"
              style={{ letterSpacing: "0.1em" }}
            >
              WAT WIJ DOEN
            </p>
          </div>
          <div className="w-4" aria-hidden="true" />
          <div className="flex-1">
            <p
              className="font-sans font-medium uppercase text-[13px]"
              style={{ letterSpacing: "0.1em", color: "#8B8680" }}
            >
              WAT DE UITVOERDER DOET
            </p>
          </div>
        </div>

        {/* The bar */}
        <div className="flex items-stretch">
          <div
            className="flex-[4] flex overflow-hidden bg-primary"
            style={{
              height: "72px",
              borderTopLeftRadius: "36px",
              borderBottomLeftRadius: "36px",
              borderTopRightRadius: "36px",
              borderBottomRightRadius: "36px",
            }}
          >
            {ourSteps.map((s, i) => (
              <div
                key={s.n}
                className="flex-1 relative flex items-center justify-center text-white"
                style={{
                  borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <span
                  className="absolute top-[10px] left-[14px] font-sans text-[13px]"
                  style={{ opacity: 0.3 }}
                >
                  {s.n}
                </span>
                <span className="font-display font-semibold text-[15px]">{s.short}</span>
              </div>
            ))}
          </div>

          {/* gap */}
          <div className="w-4" aria-hidden="true" />

          {/* Handover segment */}
          <div
            className="flex-1 relative flex items-center justify-center"
            style={{
              height: "72px",
              borderRadius: "36px",
              background: "#D4D2CC",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <span
              className="absolute top-[10px] left-[14px] font-sans text-[13px]"
              style={{ opacity: 0.3 }}
            >
              {handover.n}
            </span>
            <span className="font-display font-semibold text-[15px]">{handover.short}</span>
          </div>
        </div>

        {/* Descriptions */}
        <div className="flex items-start mt-8">
          <div className="flex-[4] flex">
            {ourSteps.map((s) => (
              <div key={s.n} className="flex-1 px-3">
                <h3 className="font-display font-semibold text-[17px] tracking-[-0.02em] text-primary">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div className="w-4" aria-hidden="true" />
          <div className="flex-1 px-3">
            <h3 className="font-display font-semibold text-[17px] tracking-[-0.02em] text-muted-foreground">
              {handover.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {handover.body}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: stacked pills */}
      <div className="md:hidden mt-12 space-y-6">
        <p
          className="font-sans font-medium uppercase text-accent text-[13px]"
          style={{ letterSpacing: "0.1em" }}
        >
          WAT WIJ DOEN
        </p>
        {ourSteps.map((s) => (
          <div key={s.n}>
            <div
              className="relative flex items-center justify-center bg-primary text-white px-6"
              style={{ height: "64px", borderRadius: "32px" }}
            >
              <span
                className="absolute top-[10px] left-[16px] font-sans text-[13px]"
                style={{ opacity: 0.3 }}
              >
                {s.n}
              </span>
              <span className="font-display font-semibold text-[15px]">{s.short}</span>
            </div>
            <div className="mt-3 px-2">
              <h3 className="font-display font-semibold text-[17px] tracking-[-0.02em] text-primary">
                {s.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <p
            className="font-sans font-medium uppercase text-[13px] mb-6"
            style={{ letterSpacing: "0.1em", color: "#8B8680" }}
          >
            WAT DE UITVOERDER DOET
          </p>
          <div
            className="relative flex items-center justify-center px-6"
            style={{
              height: "64px",
              borderRadius: "32px",
              background: "#D4D2CC",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <span
              className="absolute top-[10px] left-[16px] font-sans text-[13px]"
              style={{ opacity: 0.3 }}
            >
              {handover.n}
            </span>
            <span className="font-display font-semibold text-[15px]">{handover.short}</span>
          </div>
          <div className="mt-3 px-2">
            <h3 className="font-display font-semibold text-[17px] tracking-[-0.02em] text-muted-foreground">
              {handover.title}
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              {handover.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
