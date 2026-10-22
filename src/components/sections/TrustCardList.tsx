import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

import { minderBeweging } from "@/lib/beweging";

export type TrustCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const TINTEN = {
  /** Zand-verloop. */
  zand: "hs-zand",
  /** Wit (de kaart zelf): de twijfels in "Herken je dit?", op de oker band. */
  wit: "",
  /** Blauwgrijs: de redenen in "Waarom bewoners voor ons kiezen". */
  blauw: "hs-blauw-zacht",
} as const;

// Gedeelde lijst voor "Herken je dit?" en "Waarom bewoners voor ons kiezen", in de
// huisstijl van oktober 2026: lage tegels zonder rand, titel links en het icoon
// in een inktblauw rondje rechts, de uitleg eronder.
// Telefoon en tablet: een swiperij met snap, een stukje van de volgende tegel in
// beeld, en puntjes die je ook kunt aantikken. Desktop (lg): `cards` = drie
// naast elkaar, `list` = onder elkaar naast een foto.
// De ouder moet `min-w-0` hebben als hij een gridkolom is, anders duwt de rij
// van 3 × 88% de kolom open.
export const TrustCardList = ({
  items,
  desktop = "list",
  tint,
}: {
  items: TrustCard[];
  desktop?: "list" | "cards";
  tint: keyof typeof TINTEN;
}) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let idx = 0;
    let best = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const node = child as HTMLElement;
      const dist = Math.abs(node.offsetLeft + node.offsetWidth / 2 - center);
      if (dist < best) {
        best = dist;
        idx = i;
      }
    });
    setActive(idx);
  };

  const naarTegel = (i: number) => {
    const el = scrollerRef.current;
    const tegel = el?.children[i] as HTMLElement | undefined;
    if (!el || !tegel) return;
    setActive(i);
    if (typeof el.scrollTo !== "function") return;
    const inspring = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: tegel.offsetLeft - inspring, behavior: minderBeweging() ? "auto" : "smooth" });
  };

  // De swiperij knipt alles af wat buiten hem valt, ook de schaduw van de tegels
  // (--rs-schaduw: 0 12px 32px, dus 44 px eronder en 20 px erboven). pt-5/pb-11
  // geven die schaduw de ruimte; mt-2 en de -mt-8 van de puntjes nemen dat weer
  // terug, zodat de afstanden gelijk blijven.
  return (
    <>
      <ul
        ref={scrollerRef}
        onScroll={handleScroll}
        className={`relative mt-2 -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-11 pt-5 scroll-px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:-mx-12 md:px-12 md:scroll-px-12 lg:mx-0 lg:grid lg:overflow-visible lg:p-0 ${
          desktop === "cards" ? "lg:mt-9 lg:grid-cols-3 lg:gap-5" : "lg:mt-6 lg:grid-cols-1"
        }`}
      >
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            data-veer
            className={`hs-tegel ${TINTEN[tint]} grid shrink-0 basis-[88%] snap-start grid-cols-[1fr_auto] items-start gap-x-3.5 p-[18px] sm:basis-[62%] md:p-6 lg:basis-auto`}
          >
            <h3 className="hs-h3 self-center">{title}</h3>
            <span className="hs-rondje hs-rondje-ink" aria-hidden="true">
              <Icon size={19} strokeWidth={2} />
            </span>
            <p className="hs-tekst col-span-2 mt-2 text-[15px] leading-[1.6]">{body}</p>
          </li>
        ))}
      </ul>

      {/* Puntjes: alleen waar de tegels swipen. Het zichtbare puntje is klein,
          de rij schuift over de onderruimte van de swiperij (die ruimte is er
          zodat de schaduw van de tegels niet hard wordt afgesneden),
          het raakvlak 24 px. */}
      <div className="relative -mt-8 flex items-center justify-center lg:hidden">
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => naarTegel(i)}
            aria-label={`Toon tegel ${i + 1} van ${items.length}`}
            aria-current={i === active ? "true" : undefined}
            className="grid h-6 min-w-6 place-items-center rounded-full px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              className={`block h-2 rounded-full ${
                i === active ? "w-6 bg-primary" : "w-2 bg-primary/20"
              }`}
            />
          </button>
        ))}
      </div>
    </>
  );
};
