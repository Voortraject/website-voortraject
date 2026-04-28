import { useEffect, useRef, useState } from "react";
import processPhoto from "@/assets/process-photo.jpg";
import processPhotoAftercare from "@/assets/process-photo-aftercare.jpg";

const voortrajectSteps = [
  { n: "01", title: "Intake en situatie", body: "We brengen de bewoner, de woning en de wensen helder in beeld." },
  { n: "02", title: "Uitleg en regelingen", body: "We maken de opties, subsidies en lokale regelingen begrijpelijk voor de bewoner." },
  { n: "03", title: "Offerte en bevestiging", body: "We stellen de offerte op en zorgen dat alle informatie volledig klopt." },
  { n: "04", title: "Akkoord en overdracht*", body: "Na akkoord leveren we een compleet en gecontroleerd dossier aan." },
];

const nazorgSteps = [
  { n: "05", title: "Facturatie per uitvoering", body: "Directe en foutloze afhandeling van de administratie na de klus." },
  { n: "06", title: "Vervolgplanning", body: "We kijken samen vooruit naar de volgende logische stappen voor jouw woning." },
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
      <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground max-w-[420px]">
        {body}
      </p>
    </div>
  </li>
);

const PhaseLabel = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="font-display pl-[80px]"
    style={{
      letterSpacing: "0.08em",
      color: "hsl(var(--primary))",
      fontWeight: 800,
      fontSize: "1.25rem",
      textTransform: "uppercase",
      marginBottom: 32,
    }}
  >
    <span style={{ color: "hsl(var(--accent))" }}>—</span> {children}
  </h3>
);

export const Process = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
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
        {/* Header */}
        <div className="max-w-[720px] mb-16">
          <h2 className="h2-section lg:!text-[44px]">
            Van aanvraag tot <span style={{ color: "hsl(var(--accent))" }}>5-star review</span>
          </h2>
          <p className="mt-6 body-lg text-muted-foreground">
            Wij pakken het volledige traject op, zodat jullie focus blijft op het bouwen.
          </p>
        </div>

        {/* Layout: phases stacked vertically. Each phase is a 2-col grid with
            its own image on the left. Between them sits a full-width separator
            marker. The continuous yellow timeline runs through the right column
            of both phases AND the marker. */}
        <div ref={timelineRef} className="relative">
          {/* Continuous timeline tracks live in an absolute layer that spans
              the entire stacked block, positioned in the right column only. */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute pointer-events-none"
            style={{
              top: 60,
              bottom: CIRCLE / 2,
              left: "calc(50% + 32px + 26px)",
              width: 4,
            }}
          >
            <div
              className="absolute inset-0 rounded-[2px]"
              style={{ background: "#E5E2DB" }}
            />
            <div
              className="absolute inset-0 rounded-[2px] origin-top"
              style={{
                background: "#E8B547",
                transform: `scaleY(${progress})`,
                transition: "transform 80ms linear",
              }}
            />
          </div>

          {/* PHASE 1: Voortraject */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <img
              src={processPhoto}
              alt="Twee collega's overleggen aan een bureau, een met headset"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
              style={{
                height: "440px",
                boxShadow: "0 4px 20px rgba(21,44,78,0.08)",
              }}
            />
            <div className="relative">
              {/* Mobile-only timeline track */}
              <div
                aria-hidden="true"
                className="lg:hidden absolute left-[26px] w-[4px] rounded-[2px]"
                style={{ top: 60, bottom: 0, background: "#E5E2DB" }}
              />
              <PhaseLabel>Voortraject</PhaseLabel>
              <ol className="relative space-y-12">
                {voortrajectSteps.map((s) => (
                  <StepRow key={s.n} n={s.n} title={s.title} body={s.body} />
                ))}
              </ol>
            </div>
          </div>

          {/* EXECUTION MARKER — full width, dashed line with centered italic label */}
          <div className="relative my-16">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2"
              style={{
                borderTop: "1px dashed #D4D2CC",
              }}
            />
            <div className="relative flex justify-center">
              <span
                className="font-display italic px-6 bg-white"
                style={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "0.95rem",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "hsl(var(--accent))", fontWeight: 700 }}>*</span>{" "}
                Hier vindt de uitvoering plaats
              </span>
            </div>
          </div>

          {/* PHASE 2: Nazorg Traject */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <img
              src={processPhotoAftercare}
              alt="Bewoner met tablet aan de keukentafel"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
              style={{
                height: "440px",
                boxShadow: "0 4px 20px rgba(21,44,78,0.08)",
              }}
            />
            <div className="relative">
              {/* Mobile-only timeline track */}
              <div
                aria-hidden="true"
                className="lg:hidden absolute left-[26px] w-[4px] rounded-[2px]"
                style={{ top: 60, bottom: CIRCLE / 2, background: "#E5E2DB" }}
              />
              <PhaseLabel>Nazorg Traject</PhaseLabel>
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
