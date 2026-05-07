type Logo = { src: string; alt: string };

interface LogoCarouselProps {
  title?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  { src: "/images/instanties/rijksoverheid.svg", alt: "Rijksoverheid" },
  { src: "/images/instanties/snn.svg", alt: "SNN" },
  { src: "/images/instanties/nij-begun.svg", alt: "Nij Begun" },
  { src: "/images/instanties/isde.jpg", alt: "ISDE" },
  { src: "/images/instanties/nationaal-warmtefonds.webp", alt: "Nationaal Warmtefonds" },
];

const BG = "#F5F2EC";

export const LogoCarousel = ({
  title = "Wij regelen aanvragen voor deze subsidies",
  logos = defaultLogos,
}: LogoCarouselProps) => {
  const loop = [...logos, ...logos, ...logos, ...logos];

  return (
    <section
      aria-label="Subsidies waarvoor wij aanvragen regelen"
      className="py-10 md:py-12"
      style={{ backgroundColor: BG }}
    >
      <style>{`
        @keyframes logoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .logo-marquee-track {
          animation: logoScroll 25s linear infinite;
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
        <p
          className="text-center mb-6"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#6B7280",
          }}
        >
          {title}
        </p>
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
    </section>
  );
};
