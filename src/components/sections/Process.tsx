import { useEffect, useRef, useState } from "react";
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
  body: "De vakmensen gaan aan de slag in de woning.",
};

const aftercareSteps = [
  { n: "06", title: "Facturatie per uitvoering", body: "Directe en foutloze afhandeling van de administratie na de klus." },
  { n: "07", title: "Vervolgplanning", body: "Vooruitkijken naar de volgende stappen in het verduurzamingsplan." },
  { n: "08", title: "Begeleiding tot 5-star review", body: "Wij zorgen dat de bewoner 100% tevreden is en begeleiden het proces tot een perfecte beoordeling." },
];

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
          border: `2px solid ${muted ? "#D4D2CC" : "hsl(var(--accent))"}`,
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

export const Process = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      // Trigger earlier: progress is based on how far the section's top has passed
      // the 55% line of the viewport (instead of the very top).
      const triggerOffset = window.innerHeight * 0.55;
      const visibleFromTrigger = Math.max(0, triggerOffset - rect.top);
      const p = Math.min(1, visibleFromTrigger / Math.max(1, rect.height - window.innerHeight * 0.3));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="flowchart-section" className="section-pad" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 ref={titleRef} className="h2-section lg:!text-[44px] lg:whitespace-nowrap">Van eerste contact tot <span style={{ color: "hsl(var(--accent))" }}>akkoord</span></h2>
            <p className="mt-6 body-lg text-muted-foreground max-w-[640px]">
              Wij nemen het volledige voortraject over. Jullie focussen op de uitvoering.
            </p>
            <img
              src={processPhoto}
              alt="Twee collega's overleggen aan een bureau, een met headset"
              loading="lazy"
              className="w-full rounded-2xl object-cover mt-10"
              style={{
                height: "440px",
                boxShadow: "0 4px 20px rgba(21,44,78,0.08)",
              }}
            />
          </div>

          <div className="relative" ref={lineWrapRef}>
            <div className="relative pr-[140px]">
              {/* Background grey track for the full line */}
              <div
                aria-hidden="true"
                className="absolute left-[26px] w-[4px] rounded-[2px]"
                style={{
                  top: CIRCLE / 2,
                  bottom: CIRCLE / 2,
                  background: "#E5E2DB",
                }}
              />
              {/* Foreground progressive line, with gradient ocre→grey near step 5 */}
              <div
                aria-hidden="true"
                className="absolute left-[26px] w-[4px] origin-top rounded-[2px]"
                style={{
                  top: CIRCLE / 2,
                  bottom: CIRCLE / 2,
                  background: "#E8B547",
                  transform: `scaleY(${progress})`,
                  transition: "transform 80ms linear",
                }}
              />

              <ol className="relative space-y-12">
                {ourSteps.map((s) => (
                  <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
                ))}
              </ol>

              {/* Brace + horizontal label, static */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center gap-4">
                <div className="h-full py-2">
                  <Brace />
                </div>
                <p
                  className="font-sans text-[14px] leading-[1.3]"
                  style={{ color: "hsl(var(--accent))", maxWidth: "110px", fontWeight: 700 }}
                >
                  Deze stappen<br />nemen wij over
                </p>
              </div>
            </div>

            <div>
              <div
                aria-hidden="true"
                style={{ borderTop: "1.5px solid #E5E2DB", margin: "24px 0", marginTop: 32 }}
              />
              <p
                className="font-sans pl-[80px]"
                style={{
                  letterSpacing: "0.1em",
                  color: "#8B8680",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
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
};
