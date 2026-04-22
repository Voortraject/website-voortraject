import { SectionLabel } from "../SectionLabel";

const steps = [
  {
    n: "01",
    short: "Intake",
    title: "Intake en situatie in kaart",
    body: "We brengen de bewoner, de woning en de wensen helder in beeld.",
  },
  {
    n: "02",
    short: "Uitleg",
    title: "Uitleg maatregelen en regelingen",
    body: "We leggen de opties uit en maken subsidies en regelingen begrijpelijk.",
  },
  {
    n: "03",
    short: "Offerte",
    title: "Offerte en opdrachtbevestiging",
    body: "We stellen een offerte op en zorgen dat alle informatie klopt.",
  },
  {
    n: "04",
    short: "Akkoord",
    title: "Akkoord en overdracht",
    body: "Na akkoord leveren we een volledig dossier aan de uitvoerder.",
  },
];

const handover = {
  n: "05",
  short: "Uitvoering",
  title: "Uitvoering en oplevering",
  body: "De uitvoerder plant in en voert het werk uit, met een compleet dossier als vertrekpunt.",
};

// Chevron shape via clip-path. Step 1 is flat-left; others have notch-left. All have point-right except last.
const chevronClip = (i: number, total: number) => {
  const tip = 16; // px tip width
  if (i === 0 && i === total - 1) return undefined;
  if (i === 0)
    return `polygon(0 0, calc(100% - ${tip}px) 0, 100% 50%, calc(100% - ${tip}px) 100%, 0 100%)`;
  if (i === total - 1)
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${tip}px 50%)`;
  return `polygon(0 0, calc(100% - ${tip}px) 0, 100% 50%, calc(100% - ${tip}px) 100%, 0 100%, ${tip}px 50%)`;
};

const allSteps = [...steps, handover];

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

      {/* Group labels (desktop / tablet) */}
      <div className="mt-20 hidden md:grid grid-cols-5 gap-0 mb-4">
        <div className="col-span-4">
          <p
            className="font-sans font-medium uppercase text-accent text-[13px]"
            style={{ letterSpacing: "0.1em" }}
          >
            WAT WIJ DOEN
          </p>
        </div>
        <div className="col-span-1">
          <p
            className="font-sans font-medium uppercase text-[13px]"
            style={{ letterSpacing: "0.1em", color: "#8B8680" }}
          >
            WAT DE UITVOERDER DOET
          </p>
        </div>
      </div>

      {/* Chevrons (desktop / tablet) */}
      <div className="hidden md:grid grid-cols-5 gap-0">
        {allSteps.map((s, i) => {
          const isHandover = i === allSteps.length - 1;
          return (
            <div
              key={s.n}
              className="flex flex-col items-center justify-center text-center px-4"
              style={{
                height: "80px",
                background: isHandover ? "#D4D2CC" : "hsl(var(--primary))",
                color: isHandover ? "hsl(var(--muted-foreground))" : "#fff",
                clipPath: chevronClip(i, allSteps.length),
                marginLeft: i === 0 ? 0 : "-8px",
              }}
            >
              <span
                className="font-display font-semibold text-[14px] opacity-60 leading-none"
              >
                {s.n}
              </span>
              <span className="font-display font-semibold text-[16px] leading-tight mt-1">
                {s.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* Descriptions under each chevron (desktop only) */}
      <div className="hidden lg:grid grid-cols-5 gap-0 mt-5">
        {allSteps.map((s, i) => {
          const isHandover = i === allSteps.length - 1;
          return (
            <div key={s.n} className="px-4">
              <h3
                className="font-display font-semibold text-[18px] tracking-[-0.02em]"
                style={{
                  color: isHandover ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))",
                }}
              >
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tablet: 2-column descriptions below */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-8 gap-y-8 mt-10">
        {allSteps.map((s) => (
          <div key={s.n}>
            <h3 className="font-display font-semibold text-[18px] tracking-[-0.02em] text-primary">
              <span className="text-accent mr-2">{s.n}</span>
              {s.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: stacked vertical chevrons (down-pointing) */}
      <div className="md:hidden mt-12 space-y-8">
        <p
          className="font-sans font-medium uppercase text-accent text-[13px]"
          style={{ letterSpacing: "0.1em" }}
        >
          WAT WIJ DOEN
        </p>
        {steps.map((s) => (
          <div key={s.n}>
            <div
              className="flex flex-col items-center justify-center text-center px-4 py-5 bg-primary text-white"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))",
              }}
            >
              <span className="font-display font-semibold text-[14px] opacity-60 leading-none">
                {s.n}
              </span>
              <span className="font-display font-semibold text-[16px] leading-tight mt-1">
                {s.short}
              </span>
            </div>
            <div className="mt-4 px-2">
              <h3 className="font-display font-semibold text-[18px] tracking-[-0.02em] text-primary">
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </div>
        ))}

        <p
          className="font-sans font-medium uppercase text-[13px] pt-4"
          style={{ letterSpacing: "0.1em", color: "#8B8680" }}
        >
          WAT DE UITVOERDER DOET
        </p>
        <div>
          <div
            className="flex flex-col items-center justify-center text-center px-4 py-5"
            style={{
              background: "#D4D2CC",
              color: "hsl(var(--muted-foreground))",
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))",
            }}
          >
            <span className="font-display font-semibold text-[14px] opacity-60 leading-none">
              {handover.n}
            </span>
            <span className="font-display font-semibold text-[16px] leading-tight mt-1">
              {handover.short}
            </span>
          </div>
          <div className="mt-4 px-2">
            <h3 className="font-display font-semibold text-[18px] tracking-[-0.02em] text-muted-foreground">
              {handover.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {handover.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
