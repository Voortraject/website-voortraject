import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

type RowState = {
  ringVisible: boolean;
  titleVisible: boolean;
  done: boolean;
};

const LINES = [
  "Intake ontvangen",
  "Bewoner geverifieerd",
  "Subsidies gecheckt",
  "Offerte gegenereerd",
  "Akkoord ontvangen",
  "Dossier klaar voor overdracht",
];

const initialRows = (): RowState[] =>
  LINES.map(() => ({ ringVisible: false, titleVisible: false, done: false }));

const Dashboard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<RowState[]>(initialRows);
  const [contentVisible, setContentVisible] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const set = (ms: number, fn: () => void) => timeouts.push(setTimeout(fn, ms));

    setRows(initialRows());
    setContentVisible(true);

    const PER_ROW = 1400;
    LINES.forEach((_, i) => {
      const base = i * PER_ROW;
      set(base, () =>
        setRows((r) => {
          const n = [...r];
          n[i] = { ...n[i], ringVisible: true };
          return n;
        })
      );
      set(base + 300, () =>
        setRows((r) => {
          const n = [...r];
          n[i] = { ...n[i], titleVisible: true };
          return n;
        })
      );
      set(base + 700, () =>
        setRows((r) => {
          const n = [...r];
          n[i] = { ...n[i], done: true };
          return n;
        })
      );
    });

    const totalSequence = LINES.length * PER_ROW; // ~8400ms
    set(totalSequence + 2000, () => setContentVisible(false));
    set(totalSequence + 2400, () => setCycle((c) => c + 1));

    return () => timeouts.forEach(clearTimeout);
  }, [started, cycle]);

  return (
    <div
      ref={ref}
      className="w-full max-w-[480px] rounded-[16px]"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E2DB",
        boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
        padding: 28,
        minHeight: 420,
      }}
    >
      {/* Header (always visible) */}
      <div className="flex items-center justify-between">
        <span
          className="font-sans font-medium uppercase"
          style={{ fontSize: 11, letterSpacing: "0.1em", color: "#6B6B6B" }}
        >
          LIVE PROCES
        </span>
        <span className="relative inline-block" style={{ width: 8, height: 8 }}>
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#E8B547", opacity: 0.6 }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#E8B547" }}
          />
        </span>
      </div>
      <div className="mt-4" style={{ height: 1, backgroundColor: "#E5E2DB" }} />

      {/* Animated content */}
      <div
        className="mt-5"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <ul className="flex flex-col" style={{ gap: 16 }}>
          {LINES.map((title, i) => {
            const r = rows[i];
            return (
              <li key={i} className="flex items-center gap-3">
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 16,
                    height: 16,
                    border: r.done ? "2px solid #E8B547" : "2px solid #E8B547",
                    backgroundColor: r.done ? "#E8B547" : "transparent",
                    opacity: r.ringVisible ? 1 : 0,
                    transition:
                      "opacity 200ms ease, background-color 200ms ease, border-color 200ms ease",
                  }}
                >
                  <Check
                    size={10}
                    strokeWidth={3}
                    color="#FFFFFF"
                    style={{
                      opacity: r.done ? 1 : 0,
                      transition: "opacity 200ms ease",
                    }}
                  />
                </div>
                <span
                  className="font-sans font-semibold"
                  style={{
                    fontSize: 15,
                    color: "#152C4E",
                    opacity: r.titleVisible ? 1 : 0,
                    transition: "opacity 200ms ease",
                  }}
                >
                  {title}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const Technology = () => (
  <section className="section-pad" style={{ backgroundColor: "#FBFAF7" }} aria-labelledby="tech-title">
    <div className="container-content">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h2 id="tech-title" className="h2-section">
            Menselijke begeleiding, ondersteund door slimme automatisering
          </h2>
          <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
            Wij combineren persoonlijke begeleiding met slimme systemen voor intake,
            offerte-opbouw, communicatie en dossiercontrole. Daardoor werken we sneller,
            leveren we consistenter en kunnen we opschalen.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <Dashboard />
        </div>
      </div>
    </div>
  </section>
);
