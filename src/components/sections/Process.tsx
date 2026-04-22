import processPhoto from "@/assets/process-photo.jpg";

const ourSteps = [
  { n: "01", title: "Intake en situatie in kaart", body: "We brengen de bewoner, de woning en de wensen helder in beeld." },
  { n: "02", title: "Uitleg maatregelen en regelingen", body: "We leggen de opties uit en maken subsidies en regelingen begrijpelijk." },
  { n: "03", title: "Offerte en opdrachtbevestiging", body: "We stellen een offerte op en zorgen dat alle informatie klopt." },
  { n: "04", title: "Akkoord en overdracht", body: "Na akkoord leveren we een volledig dossier aan de uitvoerder." },
];

const handover = {
  n: "05",
  title: "Uitvoering en oplevering",
  body: "De uitvoerder plant in en voert het werk uit, met een compleet dossier als vertrekpunt.",
};

const StepRow = ({ n, title, body, muted }: { n: string; title: string; body: string; muted?: boolean }) => (
  <li className="grid grid-cols-[auto_1fr] gap-8">
    <span
      className="font-display font-light text-[40px] leading-none tabular-nums"
      style={{ color: muted ? "#8B8680" : "hsl(var(--accent))" }}
    >
      {n}
    </span>
    <div>
      <h3
        className="font-display font-semibold text-[20px] tracking-[-0.02em]"
        style={{ color: muted ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground max-w-[360px]">
        {body}
      </p>
    </div>
  </li>
);

export const Process = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left column: heading + photo */}
        <div>
          <h2 className="h2-section">Van eerste contact tot akkoord</h2>
          <p className="mt-6 body-lg text-muted-foreground max-w-[480px]">
            Wij nemen het volledige voortraject over. Jullie focussen op de uitvoering.
          </p>
          <div className="mt-8">
            <img
              src={processPhoto}
              alt="Twee collega's overleggen aan een bureau, een met headset"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
              style={{
                height: "520px",
                boxShadow: "0 4px 20px rgba(21,44,78,0.08)",
              }}
            />
          </div>
        </div>

        {/* Right column: step list */}
        <div>
          <ol className="space-y-10">
            {ourSteps.map((s) => (
              <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
            ))}
          </ol>

          {/* Wij stoppen hier divider */}
          <div className="mt-10">
            <p
              className="font-sans font-medium uppercase text-[11px]"
              style={{ letterSpacing: "0.1em", color: "hsl(var(--accent))" }}
            >
              WIJ STOPPEN HIER
            </p>
            <div
              className="mt-2"
              style={{ width: "64px", height: "1px", background: "hsl(var(--accent))" }}
              aria-hidden="true"
            />
          </div>

          <ol className="mt-6 space-y-10">
            <StepRow n={handover.n} title={handover.title} body={handover.body} muted />
          </ol>
        </div>
      </div>
    </div>
  </section>
);
