import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

const pairs = [
  {
    niet: "Geen koude acquisitie",
    wel: "Jij neemt contact op wanneer het uitkomt",
  },
  {
    niet: "Geen verkooppraatje",
    wel: "Onafhankelijk advies, geen verkoop van pompen of panelen",
  },
  {
    niet: "Geen anonieme call-center-stem",
    wel: "Direct contact met een vaste adviseur uit Groningen",
  },
  {
    niet: "Geen overdreven beloften",
    wel: "Realistisch uitgerekend voor jouw woning",
  },
];

const ACCENT = "#D4AF3D";

export const HowWeWork = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section-pad" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container-content" ref={ref}>
        <div
          className="max-w-3xl mx-auto text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: reduced ? "none" : "opacity 500ms ease-out, transform 500ms ease-out",
          }}
        >
          <h2 className="h2-section">
            Zo werken wij, en zo{" "}
            <span style={{ color: ACCENT }}>niet</span>
          </h2>
          <p
            className="mx-auto mt-6 mb-12 md:mb-16 max-w-2xl"
            style={{
              fontSize: 18,
              color: "hsl(var(--primary) / 0.8)",
              lineHeight: 1.6,
            }}
          >
            In een sector waar veel partijen onder valse vlaggen werken, zijn we vooraf duidelijk over hoe wij werken. Geen verrassingen, geen verkooppraatje.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* Vertical divider, desktop only */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-0 bottom-0 left-1/2"
            style={{
              width: 1,
              backgroundColor: `${ACCENT}33`,
            }}
          />

          {/* Left column: NIET */}
          <div className="px-4 md:px-12">
            <div
              className="mb-4"
              style={{
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#6B7280",
                fontWeight: 600,
              }}
            >
              Niet bij ons
            </div>
            <ul>
              {pairs.map((p, i) => (
                <li
                  key={`n-${i}`}
                  data-row={i}
                  className="hww-row hww-left flex items-start gap-2 py-4"
                  style={{
                    opacity: visible ? 0.5 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-30px)",
                    transition: reduced
                      ? "none"
                      : `opacity 400ms ease-out ${i * 100}ms, transform 400ms ease-out ${i * 100}ms, background-color 200ms ease-out`,
                    color: "hsl(var(--primary))",
                  }}
                >
                  <X
                    size={18}
                    className="mt-1 shrink-0"
                    style={{ color: "#9CA3AF" }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 16, lineHeight: 1.5 }}>{p.niet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: WEL */}
          <div className="px-4 md:px-12">
            <div
              className="mb-4"
              style={{
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: ACCENT,
                fontWeight: 600,
              }}
            >
              Wel bij ons
            </div>
            <ul>
              {pairs.map((p, i) => (
                <li
                  key={`w-${i}`}
                  data-row={i}
                  className="hww-row hww-right flex items-start gap-2 py-4"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(30px)",
                    transition: reduced
                      ? "none"
                      : `opacity 400ms ease-out ${i * 100}ms, transform 400ms ease-out ${i * 100}ms, background-color 200ms ease-out`,
                    color: "hsl(var(--primary))",
                  }}
                >
                  <Check
                    size={18}
                    className="mt-1 shrink-0"
                    style={{ color: ACCENT }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 500 }}>
                    {p.wel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p
            style={{
              fontSize: 16,
              color: "hsl(var(--primary) / 0.8)",
              lineHeight: 1.6,
            }}
          >
            Wil je weten wie er achter Voortraject staat?
          </p>
          <a
            href="/over-ons"
            className="hww-link inline-flex items-center mt-3 font-sans font-semibold"
            style={{ fontSize: 15, color: ACCENT }}
          >
            <span className="hww-link-text">Lees over ons</span>
            <span style={{ marginLeft: 6 }} aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .hww-row { border-radius: 8px; margin-left: -8px; margin-right: -8px; padding-left: 8px; padding-right: 8px; }
        }
        .hww-link-text {
          background-image: linear-gradient(currentColor, currentColor);
          background-size: 0% 1px;
          background-repeat: no-repeat;
          background-position: 0 100%;
          transition: background-size 200ms ease-out;
        }
        .hww-link:hover .hww-link-text { background-size: 100% 1px; }
        @media (prefers-reduced-motion: reduce) {
          .hww-link-text { transition: none; }
        }
      `}</style>
    </section>
  );
};
