import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

type StepStatus = "hidden" | "active" | "done";

type StepDef = {
  activeTitle: string;
  activeSub: string;
  doneTitle: string;
  doneSub: string;
};

const STEPS: StepDef[] = [
  {
    activeTitle: "Intake wordt opgesteld",
    activeSub: "Bewoner · Groningen",
    doneTitle: "Intake voltooid",
    doneSub: "Bewoner · Groningen",
  },
  {
    activeTitle: "Subsidies worden gecontroleerd",
    activeSub: "ISDE + SPUK check",
    doneTitle: "Subsidies gecontroleerd",
    doneSub: "ISDE + SPUK gematched",
  },
  {
    activeTitle: "Offerte wordt opgesteld",
    activeSub: "Automatische opmaak",
    doneTitle: "Offerte opgesteld",
    doneSub: "Verzendklaar",
  },
  {
    activeTitle: "Akkoord wordt verwerkt",
    activeSub: "Klaar voor verzending",
    doneTitle: "Akkoord ontvangen",
    doneSub: "Dossier klaar voor overdracht",
  },
];

const Indicator = ({ status }: { status: StepStatus }) => {
  if (status === "done") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 16, height: 16, backgroundColor: "#E8B547" }}
      >
        <Check size={10} strokeWidth={3} color="#FFFFFF" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: "#E8B547", opacity: 0.5 }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "#E8B547" }}
        />
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [statuses, setStatuses] = useState<StepStatus[]>(["hidden", "hidden", "hidden", "hidden"]);
  const [times, setTimes] = useState<string[]>(["", "", "", ""]);
  const [cardVisible, setCardVisible] = useState(true);
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

    setStatuses(["hidden", "hidden", "hidden", "hidden"]);
    setTimes(["", "", "", ""]);
    setCardVisible(true);

    // Step 1
    set(500, () => {
      setStatuses((s) => { const n = [...s]; n[0] = "active"; return n; });
      setTimes((t) => { const n = [...t]; n[0] = "Bezig..."; return n; });
    });
    set(1800, () => {
      setStatuses((s) => { const n = [...s]; n[0] = "done"; return n; });
      setTimes((t) => { const n = [...t]; n[0] = "Net nu"; return n; });
    });
    // Step 2
    set(2000, () => {
      setStatuses((s) => { const n = [...s]; n[1] = "active"; return n; });
      setTimes((t) => { const n = [...t]; n[1] = "Bezig..."; return n; });
    });
    set(3300, () => {
      setStatuses((s) => { const n = [...s]; n[1] = "done"; return n; });
      setTimes((t) => { const n = [...t]; n[1] = "Net nu"; return n; });
    });
    // Step 3
    set(3500, () => {
      setStatuses((s) => { const n = [...s]; n[2] = "active"; return n; });
      setTimes((t) => { const n = [...t]; n[2] = "Bezig..."; return n; });
    });
    set(4800, () => {
      setStatuses((s) => { const n = [...s]; n[2] = "done"; return n; });
      setTimes((t) => { const n = [...t]; n[2] = "Net nu"; return n; });
    });
    // Step 4
    set(5000, () => {
      setStatuses((s) => { const n = [...s]; n[3] = "active"; return n; });
      setTimes((t) => { const n = [...t]; n[3] = "Bezig..."; return n; });
    });
    set(6300, () => {
      setStatuses((s) => { const n = [...s]; n[3] = "done"; return n; });
      setTimes((t) => { const n = [...t]; n[3] = "Net nu"; return n; });
    });
    // Time labels tick
    set(8000, () => {
      setTimes(["2 min geleden", "1 min geleden", "30 sec geleden", "Net nu"]);
    });
    // Fade out + restart
    set(12000, () => setCardVisible(false));
    set(12500, () => setCycle((c) => c + 1));

    return () => timeouts.forEach(clearTimeout);
  }, [started, cycle]);

  // Compute connecting line segments based on statuses.
  // 4 indicators -> 3 segments. Each segment between i and i+1 is oker if both visible (i is done && i+1 is active or done).
  const segmentColor = (i: number) => {
    const a = statuses[i];
    const b = statuses[i + 1];
    if (a === "done" && (b === "active" || b === "done")) return "#E8B547";
    return "transparent";
  };

  return (
    <div
      ref={ref}
      className="w-full max-w-[480px] rounded-[16px]"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E2DB",
        boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
        padding: 28,
        minHeight: 360,
        opacity: cardVisible ? 1 : 0,
        transition: "opacity 500ms ease",
      }}
    >
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

      <div className="relative mt-6">
        <ul className="relative space-y-5">
          {STEPS.map((s, i) => {
            const status = statuses[i];
            const visible = status !== "hidden";
            const isActive = status === "active";
            const isDone = status === "done";
            const title = isDone ? s.doneTitle : s.activeTitle;
            const sub = isDone ? s.doneSub : s.activeSub;
            return (
              <li
                key={i}
                className="relative"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 300ms ease, transform 300ms ease",
                }}
              >
                {/* Connecting line above (from previous indicator to this one) */}
                {i > 0 && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 7,
                      top: -20,
                      height: 20,
                      width: 2,
                      backgroundColor: segmentColor(i - 1),
                      transition: "background-color 250ms ease",
                    }}
                  />
                )}
                <div
                  className="flex items-start gap-3"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#FDF6E3",
                          padding: "8px",
                          borderRadius: 6,
                          marginLeft: -8,
                          marginRight: -8,
                          transition: "background-color 200ms ease",
                        }
                      : { transition: "background-color 200ms ease" }
                  }
                >
                  <div className="pt-0.5" style={{ width: 16, height: 16 }}>
                    <Indicator status={status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-sans font-semibold"
                      style={{ fontSize: 14, color: "#152C4E" }}
                    >
                      {title}
                    </div>
                    <div
                      className="font-sans"
                      style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}
                    >
                      {sub}
                    </div>
                  </div>
                  <div
                    className="font-sans shrink-0"
                    style={{ fontSize: 11, color: "#8B8680" }}
                  >
                    {times[i]}
                  </div>
                </div>
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
