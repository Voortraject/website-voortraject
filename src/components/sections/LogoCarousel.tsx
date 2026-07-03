import { useCallback, useEffect, useRef } from "react";

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

const COPIES = 4; // aantal kopieën van de logo-set voor een naadloze lus
const SPEED = 30; // autoscroll-snelheid in px per seconde

/**
 * Trustbar: compacte witte balk met één regel kleine tekst en de instantie-logo's
 * als rustige marquee. Logo's staan in grijstinten en krijgen kleur op hover.
 */
export const LogoCarousel = ({
  title = "Wij werken met alle officiële regelingen",
  logos = defaultLogos,
}: LogoCarouselProps) => {
  const loop = Array.from({ length: COPIES }, () => logos).flat();

  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0); // huidige scroll-offset in px
  const setWidth = useRef(0); // exacte breedte van één logo-set (incl. gap)
  const dragging = useRef(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const reduced = useRef(false);

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const w = setWidth.current || 1;
    let o = offset.current % w;
    if (o < 0) o += w;
    track.style.transform = `translate3d(${-o}px, 0, 0)`;
  }, []);

  // Autoscroll + naadloze lus, volledig JS-gestuurd (pauzeert NIET op hover)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Meet de exacte herhaalafstand: afstand tussen set 0 en set 1 (incl. gap).
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const nextSet = track.children[logos.length] as HTMLElement | undefined;
      if (first && nextSet) {
        setWidth.current = nextSet.offsetLeft - first.offsetLeft;
      }
      applyTransform();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduced.current && !dragging.current) {
        offset.current += SPEED * dt;
        applyTransform();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [applyTransform, logos]);

  // Slepen met muis, pen én touch (pointer events dekken alle drie)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    startOffset.current = offset.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    offset.current = startOffset.current - (e.clientX - startX.current);
    applyTransform();
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.style.cursor = "grab";
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer is al vrijgegeven */
    }
  };

  return (
    <section
      aria-label="Regelingen en instanties waarmee wij werken"
      className="py-[48px]"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <style>{`
        .logo-marquee-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
                  mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
        }
        .logo-marquee img {
          filter: grayscale(1);
          opacity: 0.6;
          transition: filter 200ms ease, opacity 200ms ease;
        }
        .logo-marquee div:hover > img {
          filter: grayscale(0);
          opacity: 1;
        }
      `}</style>

      <div className="container-home">
        <p className="text-center text-[14px] font-medium text-muted-foreground">{title}</p>
      </div>

      <div
        className="logo-marquee logo-marquee-mask relative overflow-hidden select-none mt-7"
        style={{ touchAction: "pan-y", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          ref={trackRef}
          className="flex items-center gap-10 md:gap-16 w-max"
          style={{ willChange: "transform" }}
        >
          {loop.map((logo, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center justify-center"
              aria-hidden={i >= logos.length ? true : undefined}
            >
              <img
                src={logo.src}
                alt={i >= logos.length ? "" : logo.alt}
                loading="lazy"
                draggable={false}
                className="object-contain pointer-events-none"
                style={{
                  height: "clamp(40px, 5vw, 56px)",
                  width: "auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
