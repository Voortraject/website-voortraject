import { useCallback, useEffect, useRef } from "react";

import "@/styles/home-boven.css";

type Logo = { src: string; alt: string };

interface LogoCarouselProps {
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
 * Trustbar: één witte tegel met korte titel en de instantie-logo's als rustige
 * marquee in kleur, die over de onderrand van de hero schuift. Huisstijl
 * oktober 2026: geen witte band meer over de hele breedte.
 */
export const LogoCarousel = ({ logos = defaultLogos }: LogoCarouselProps) => {
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
    // Eén witte tegel die over de onderrand van de hero schuift (negatieve
    // marge, boven de hero gestapeld), binnen dezelfde breedte als de inhoud.
    <div className="container-home relative z-10 -mt-10 md:-mt-14">
      <section
        aria-label="Regelingen en instanties waarmee wij werken"
        className="hs-tegel overflow-hidden pt-[22px] pb-6 md:pt-[30px] md:pb-[34px]"
      >
        {/* Op één regel, ook op 360 px: daar schaalt de kop iets mee. */}
        <h2 className="hs-h3 whitespace-nowrap px-3 text-center text-[min(17.5px,4.6vw)] sm:px-[18px] md:text-[24px]">
          We werken met alle officiële <span className="hs-accent">regelingen</span>
        </h2>

        <div
          className="logo-marquee home-logo-masker relative mt-[18px] select-none overflow-hidden"
          style={{ touchAction: "pan-y", cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-10 md:gap-16"
            style={{ willChange: "transform" }}
          >
            {loop.map((logo, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center justify-center"
                aria-hidden={i >= logos.length ? true : undefined}
              >
                <img
                  src={logo.src}
                  alt={i >= logos.length ? "" : logo.alt}
                  loading="lazy"
                  draggable={false}
                  className="pointer-events-none h-[38px] w-auto object-contain md:h-[50px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
