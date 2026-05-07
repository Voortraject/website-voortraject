type Logo = { src: string; alt: string };

interface LogoCarouselProps {
  title?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  { src: "/images/instanties/rijksoverheid.svg", alt: "Rijksoverheid" },
  { src: "/images/instanties/snn.svg", alt: "SNN" },
  { src: "/images/instanties/nij-begun.webp", alt: "Nij Begun" },
  { src: "/images/instanties/isde.jpg", alt: "ISDE" },
  { src: "/images/instanties/nationaal-warmtefonds.webp", alt: "Nationaal Warmtefonds" },
];

export const LogoCarousel = ({
  title = "Wij dienen aanvragen in bij",
  logos = defaultLogos,
}: LogoCarouselProps) => {
  const loop = [...logos, ...logos];

  return (
    <section
      aria-label="Instanties waar Voortraject aanvragen indient"
      className="py-6 md:py-8"
      style={{
        backgroundColor: "#F8F4ED",
        borderBottom: "1px solid rgba(232, 181, 71, 0.2)",
      }}
    >
      <style>{`
        @keyframes logo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-marquee-track {
          animation: logo-marquee 40s linear infinite;
        }
        .logo-marquee-mask:hover .logo-marquee-track {
          animation-play-state: paused;
        }
        .logo-marquee-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
                  mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
        }
        .logo-marquee-item {
          filter: grayscale(100%);
          opacity: 0.6;
          transition: filter 200ms ease-out, opacity 200ms ease-out;
        }
        @media (hover: hover) {
          .logo-marquee-item:hover {
            filter: grayscale(0%);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            transform: none;
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
        <div className="logo-marquee-track flex items-center gap-8 md:gap-12 w-max">
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
                className="logo-marquee-item object-contain"
                style={{ height: "clamp(36px, 4vw, 48px)", width: "auto" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
