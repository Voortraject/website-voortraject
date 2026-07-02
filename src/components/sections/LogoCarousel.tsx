import { useEffect, useRef, useState } from "react";

type Logo = { src: string; alt: string };

interface LogoCarouselProps {
  title?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  { src: "/images/instanties/rijksoverheid.svg", alt: "Rijksoverheid" },
  { src: "/images/instanties/snn.svg", alt: "SNN" },
  { src: "/images/instanties/nij-begun.svg", alt: "Nij Begun" },
  { src: "/images/instanties/isde.png", alt: "ISDE" },
  { src: "/images/instanties/nationaal-warmtefonds.png", alt: "Nationaal Warmtefonds" },
  { src: "/images/instanties/natuurvriendelijk-isoleren.png", alt: "Natuur Vriendelijk Isoleren" },
];

const BG = "#F5F2EC";

export const LogoCarousel = ({
  title = "De subsidies en instanties waarmee wij werken",
  logos = defaultLogos,
}: LogoCarouselProps) => {
  const loop = [...logos, ...logos, ...logos, ...logos];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
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
    <section
      aria-label="Subsidies en instanties waarmee wij werken"
      className="py-10 md:py-12 relative"
      style={{ backgroundColor: BG }}
    >
      <style>{`
        @keyframes logoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .logo-marquee-track {
          animation: logoScroll 35s linear infinite;
        }
        .logo-marquee-mask:hover .logo-marquee-track {
          animation-play-state: paused;
        }
        .logo-marquee-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
                  mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            transform: none;
            width: 100%;
          }
          .logo-marquee-track > .logo-marquee-clone { display: none; }
        }
      `}</style>

      <div className="container-content">
        <h2
          ref={titleRef}
          className="h2-section text-center mb-12 md:mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 500ms ease-out, transform 500ms ease-out",
          }}
        >
          De subsidies en instanties waarmee wij{" "}
          <span style={{ color: "hsl(var(--accent))" }}>werken</span>
        </h2>
      </div>

      <div className="logo-marquee-mask relative overflow-hidden">
        <div className="logo-marquee-track flex items-center gap-10 md:gap-16 w-max">
          {loop.map((logo, i) => (
            <div
              key={i}
              className={`shrink-0 flex items-center justify-center ${i >= logos.length ? "logo-marquee-clone" : ""}`}
              aria-hidden={i >= logos.length ? true : undefined}
            >
              <img
                src={logo.src}
                alt={i >= logos.length ? "" : logo.alt}
                loading="lazy"
                className="object-contain"
                style={{
                  height: "clamp(52px, 6vw, 72px)",
                  width: "auto",
                  filter: "none",
                  opacity: 1,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute w-full"
        style={{
          bottom: 0,
          height: 1,
          backgroundColor: "rgba(212, 175, 61, 0.3)",
        }}
      />
    </section>
  );
};
