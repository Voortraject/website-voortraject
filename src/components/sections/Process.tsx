const steps = [
  {
    n: "01",
    title: "Intake en situatie in kaart",
    body: "We brengen de bewoner, de woning en de wensen helder in beeld.",
  },
  {
    n: "02",
    title: "Uitleg over maatregelen en regelingen",
    body: "We leggen de opties uit en maken subsidies en regelingen begrijpelijk.",
  },
  {
    n: "03",
    title: "Offerte en opdrachtbevestiging",
    body: "We stellen een offerte op en zorgen dat alle informatie klopt.",
  },
  {
    n: "04",
    title: "Akkoord en overdracht naar uitvoering",
    body: "Na akkoord leveren we een volledig dossier aan de uitvoerder, klaar om te plannen.",
  },
];

export const Process = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <div className="max-w-[720px]">
        <h2 className="h2-section text-foreground">Van eerste contact tot akkoord</h2>
      </div>

      <div className="mt-20 relative">
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-[44px] left-0 right-0 h-px bg-accent"
        />

        <ol className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-10">
          {steps.map((s) => (
            <li key={s.n} className="relative flex flex-col items-start text-left">
              <span
                aria-hidden="true"
                className="font-display font-light text-[72px] leading-none text-accent bg-background pr-6 lg:pr-4 -mt-2"
              >
                {s.n}
              </span>
              <h3 className="h3-block mt-6 text-foreground">{s.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground max-w-xs">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);
