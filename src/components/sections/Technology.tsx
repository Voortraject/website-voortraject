import { useEffect, useRef, useState } from "react";

const lines = [
  "> Intake ontvangen",
  "> Bewoner geverifieerd",
  "> Subsidies gecheckt",
  "> Offerte gegenereerd",
  "> Akkoord ontvangen",
  "> Dossier klaar voor overdracht",
];

const TYPE_MS = 40;
const AFTER_LINE_PAUSE = 400;
const CHECK_FADE_MS = 200;
const FULL_HOLD_MS = 2000;
const CLEAR_MS = 300;

type LineState = { text: string; typed: boolean };

const Terminal = () => {
  const [states, setStates] = useState<LineState[]>(
    lines.map(() => ({ text: "", typed: false }))
  );
  const [activeLine, setActiveLine] = useState(0);
  const [clearing, setClearing] = useState(false);
  const cycleRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });

    const run = async () => {
      while (!cancelled) {
        // reset
        setClearing(false);
        setStates(lines.map(() => ({ text: "", typed: false })));
        await wait(50);

        for (let i = 0; i < lines.length; i++) {
          if (cancelled) return;
          setActiveLine(i);
          const full = lines[i];
          for (let c = 1; c <= full.length; c++) {
            if (cancelled) return;
            setStates((s) => {
              const next = [...s];
              next[i] = { ...next[i], text: full.slice(0, c) };
              return next;
            });
            await wait(TYPE_MS);
          }
          setStates((s) => {
            const next = [...s];
            next[i] = { text: full, typed: true };
            return next;
          });
          await wait(CHECK_FADE_MS);
          await wait(AFTER_LINE_PAUSE);
        }
        setActiveLine(-1);
        await wait(FULL_HOLD_MS);
        setClearing(true);
        await wait(CLEAR_MS);
        cycleRef.current++;
      }
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="rounded-[12px] p-6 w-full max-w-[480px]"
      style={{
        backgroundColor: "#152C4E",
        boxShadow: "0 8px 32px rgba(21,44,78,0.15)",
        fontFamily: "'JetBrains Mono', Menlo, Monaco, Courier, monospace",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="block rounded-full" style={{ width: 10, height: 10, backgroundColor: "#E8B547" }} />
        <span className="block rounded-full" style={{ width: 10, height: 10, backgroundColor: "#F0E4D0" }} />
        <span className="block rounded-full" style={{ width: 10, height: 10, backgroundColor: "#8B8680" }} />
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.8,
          opacity: clearing ? 0 : 1,
          transition: `opacity ${CLEAR_MS}ms ease`,
        }}
      >
        {states.map((ls, i) => {
          const prefix = ls.text.startsWith(">") ? ">" : "";
          const rest = ls.text.slice(prefix.length);
          const isActive = i === activeLine && !ls.typed;
          return (
            <div key={i} className="flex items-center justify-between gap-3 min-h-[25px]">
              <span className="whitespace-pre">
                <span style={{ color: "#E8B547" }}>{prefix}</span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{rest}</span>
                {isActive && (
                  <span className="animate-blink" style={{ color: "rgba(255,255,255,0.9)" }}>
                    ▊
                  </span>
                )}
              </span>
              <span
                style={{
                  color: "#9BBF9D",
                  opacity: ls.typed ? 1 : 0,
                  transition: `opacity ${CHECK_FADE_MS}ms ease`,
                }}
              >
                ✓
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Technology = () => (
  <section className="bg-background section-pad border-t border-border" aria-labelledby="tech-title">
    <div className="container-content">
      <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-center">
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
          <Terminal />
        </div>
      </div>
    </div>
  </section>
);
