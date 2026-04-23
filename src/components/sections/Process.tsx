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

const CIRCLE = 56;

const StepRow = ({
  n,
  title,
  body,
  muted,
}: {
  n: string;
  title: string;
  body: string;
  muted?: boolean;
}) => (
  <li className="relative grid grid-cols-[56px_1fr] gap-6 items-start">
    <div className="relative" style={{ width: CIRCLE, height: CIRCLE }}>
      <div
        className="relative z-10 flex items-center justify-center rounded-full bg-background"
        style={{
          width: CIRCLE,
          height: CIRCLE,
          border: `2px solid ${muted ? "#E5E2DB" : "hsl(var(--accent))"}`,
        }}
      >
        <span
          className="font-display font-semibold text-[20px] tabular-nums"
          style={{ color: muted ? "#8B8680" : "hsl(var(--accent))" }}
        >
          {n}
        </span>
      </div>
    </div>
    <div className="pt-3">
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

/** SVG curly brace `}` to the right of steps 1–4 */
const Brace = () => (
  <svg
    width="20"
    height="100%"
    viewBox="0 0 20 100"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="block"
  >
    <path
      d="M 2 0 Q 12 0 12 12 L 12 44 Q 12 50 18 50 Q 12 50 12 56 L 12 88 Q 12 100 2 100"
      fill="none"
      stroke="hsl(var(--accent))"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
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

        {/* Right column: grouped steps with brace */}
        <div className="relative">
          {/* Group: steps 1-4 with brace on the right */}
          <div className="relative pr-[88px]">
            {/* Vertical connecting line through circles 1-4 */}
            <div
              aria-hidden="true"
              className="absolute left-[27px] w-[2px] bg-accent"
              style={{ top: CIRCLE / 2, bottom: CIRCLE / 2 }}
            />

            <ol className="relative space-y-12">
              {ourSteps.map((s) => (
                <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
              ))}
            </ol>

            {/* Brace + label on the right edge of the group */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3">
              <div className="h-full py-2">
                <Brace />
              </div>
              <p
                className="font-sans font-semibold text-[14px] leading-tight"
                style={{ color: "hsl(var(--accent))", maxWidth: "80px" }}
              >
                Deze stappen nemen wij over
              </p>
            </div>
          </div>

          {/* Step 5 — separate, with handover label */}
          <div className="mt-12">
            <p
              className="font-sans font-semibold uppercase text-[13px] mb-4 pl-[80px]"
              style={{ letterSpacing: "0.1em", color: "#8B8680" }}
            >
              De uitvoerder neemt het over
            </p>
            <ol>
              <StepRow n={handover.n} title={handover.title} body={handover.body} muted />
            </ol>
          </div>
        </div>
      </div>
    </div>
  </section>
);
