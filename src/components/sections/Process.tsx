import { useEffect, useRef, useState } from "react";
import processPhoto from "@/assets/process-photo.jpg";

const voortrajectSteps = [
  { n: "01", title: "Intake en situatie", body: "We brengen de bewoner, de woning en de wensen helder in beeld." },
  { n: "02", title: "Uitleg en regelingen", body: "We maken de opties, subsidies en lokale regelingen begrijpelijk voor de bewoner." },
  { n: "03", title: "Offerte en bevestiging", body: "We stellen de offerte op en zorgen dat alle informatie volledig klopt." },
  { n: "04", title: "Akkoord en overdracht*", body: "Na akkoord leveren we een compleet en gecontroleerd dossier aan." },
];

const nazorgSteps = [
  { n: "05", title: "Facturatie per uitvoering", body: "Directe en foutloze afhandeling van de administratie na de klus." },
  { n: "06", title: "Vervolgplanning", body: "Vooruitkijken naar de volgende logische stappen in het verduurzamingsplan." },
  { n: "07", title: "Begeleiding naar 5-star review", body: "Wij begeleiden het proces tot een perfecte review en 100% tevredenheid." },
];

const CIRCLE = 56;

const StepRow = ({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) => (
  <li className="relative grid grid-cols-[56px_1fr] gap-6 items-start">
    <div className="relative" style={{ width: CIRCLE, height: CIRCLE }}>
      <div
        className="relative z-10 flex items-center justify-center rounded-full bg-background"
        style={{
          width: CIRCLE,
          height: CIRCLE,
          border: `2px solid hsl(var(--accent))`,
        }}
      >
        <span
          className="font-display font-semibold text-[20px] tabular-nums"
          style={{ color: "hsl(var(--accent))" }}
        >
          {n}
        </span>
      </div>
    </div>
    <div className="pt-3">
      <h3
        className="font-display font-semibold text-[20px] tracking-[-0.02em]"
        style={{ color: "hsl(var(--primary))" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground max-w-[360px]">
        {body}
      </p>
    </div>
  </li>
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
            <h2 ref={titleRef} className="h2-section lg:!text-[44px] lg:whitespace-nowrap">
              Van aanvraag tot <span style={{ color: "hsl(var(--accent))" }}>5-star review</span>
            </h2>
            <p className="mt-6 body-lg text-muted-foreground max-w-[640px]">
              Wij pakken het volledige traject op, zodat jullie focus blijft op het bouwen.
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
            <div className="relative" ref={lineWrapRef}>
              {/* Background grey track spanning full timeline */}
              <div
                aria-hidden="true"
                className="absolute left-[26px] w-[4px] rounded-[2px]"
                style={{
                  top: CIRCLE / 2,
                  bottom: CIRCLE / 2,
                  background: "#E5E2DB",
                }}
              />
              {/* Foreground progressive yellow line */}
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

              {/* Voortraject label */}
              <p
                className="font-sans pl-[80px]"
                style={{
                  letterSpacing: "0.1em",
                  color: "hsl(var(--accent))",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
              >
                Voortraject
              </p>

              <ol className="relative space-y-12">
                {voortrajectSteps.map((s) => (
                  <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
                ))}
              </ol>

              {/* Asterisk marker between step 4 and 5 */}
              <div className="relative pl-[80px] my-10">
                <div
                  aria-hidden="true"
                  style={{
                    borderTop: "1.5px dashed #D4D2CC",
                    marginBottom: 16,
                  }}
                />
                <p
                  className="font-sans italic"
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "hsl(var(--accent))", fontWeight: 700 }}>*</span>{" "}
                  Hier vindt de uitvoering door jullie team plaats
                </p>
                <div
                  aria-hidden="true"
                  style={{
                    borderTop: "1.5px dashed #D4D2CC",
                    marginTop: 16,
                  }}
                />
              </div>

              {/* Nazorg label */}
              <p
                className="font-sans pl-[80px]"
                style={{
                  letterSpacing: "0.1em",
                  color: "hsl(var(--accent))",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
              >
                Nazorg Traject
              </p>

              <ol className="relative space-y-12">
                {nazorgSteps.map((s) => (
                  <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
