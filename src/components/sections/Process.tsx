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
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Trigger: from when section top passes top of viewport, to when section bottom (~step 5) reaches mid viewport
      const startY = 0; // section top at viewport top
      const endY = vh * 0.5 - rect.height; // when bottom of section at mid viewport, rect.top equals this
      const traveled = startY - rect.top;
      const total = startY - endY;
      const p = total > 0 ? Math.max(0, Math.min(1, traveled / total)) : 0;
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
    <section ref={sectionRef} className="section-pad" style={{ backgroundColor: "#FBFAF7" }}>
      <div className="container-content">
        <div className="mb-12">
          <h2 className="h2-section lg:!text-[44px] lg:whitespace-nowrap">Van eerste contact tot akkoord</h2>
          <p className="mt-6 body-lg text-muted-foreground max-w-[640px]">
            Wij nemen het volledige voortraject over. Jullie focussen op de uitvoering.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
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
                  background:
                    "linear-gradient(to bottom, #E8B547 0%, #E8B547 72%, #E5E2DB 72%, #E5E2DB 100%)",
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

            <div className="mt-12">
              <div className="pl-[80px] mb-8">
                <div style={{ width: 40, height: 2, backgroundColor: "#8B8680", marginBottom: 12 }} />
                <p
                  className="font-sans uppercase text-[14px]"
                  style={{ letterSpacing: "0.1em", color: "#2B2B2B", fontWeight: 700 }}
                >
                  De uitvoerder neemt het over
                </p>
              </div>
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
