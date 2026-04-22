import { SectionHeader } from "../SectionHeader";

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
  <section className="bg-white section-pad">
    <div className="container-content">
      <SectionHeader title="Van eerste contact tot akkoord" />

      <div className="mt-16 relative">
        {/* connecting line desktop */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-border"
        />

        <ol className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((s) => (
            <li key={s.n} className="relative flex flex-col items-start lg:items-center lg:text-center">
              <span
                aria-hidden="true"
                className="heading-serif text-5xl text-accent leading-none bg-white lg:px-3"
              >
                {s.n}
              </span>
              <h3 className="mt-5 text-xl font-semibold leading-snug text-foreground">
                {s.title}
              </h3>
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
