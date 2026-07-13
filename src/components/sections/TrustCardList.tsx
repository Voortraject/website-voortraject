import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type TrustCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

// Gedeelde lijst voor "Herken je dit?" en "Waarom bewoners voor ons kiezen".
// Mobiel: horizontaal swipebare kaarten met snap + peek van de volgende kaart en
// een dot-indicator. Desktop (lg): `list` = de verticale lijst naast een foto,
// `cards` = drie kaarten naast elkaar in één regel (kaartstijl blijft behouden).
export const TrustCardList = ({
  items,
  desktop = "list",
}: {
  items: TrustCard[];
  desktop?: "list" | "cards";
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

  return (
    <>
      <ul
        ref={scrollerRef}
        onScroll={handleScroll}
        className={`mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth -mx-6 px-6 scroll-px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0 ${
          desktop === "cards"
            ? "lg:grid lg:grid-cols-3 lg:gap-6"
            : "lg:block lg:space-y-8"
        }`}
      >
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className={`flex shrink-0 basis-[100%] snap-start items-start gap-4 rounded-2xl border border-accent bg-card p-5 shadow-[0_2px_12px_hsl(var(--primary)/0.05)] sm:basis-[62%] lg:basis-auto ${
              desktop === "cards"
                ? "lg:h-full lg:p-6"
                : "lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
            }`}
          >
            <span className="inline-flex shrink-0 w-11 h-11 items-center justify-center rounded-full bg-accent">
              <Icon size={20} className="text-primary" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display font-semibold text-primary text-[19px] md:text-[22px] leading-[1.2] tracking-[-0.01em]">
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Swipe-indicator: alleen mobiel, maakt zichtbaar dat de kaarten swipebaar zijn */}
      <div className="mt-5 flex items-center justify-center gap-2 lg:hidden" aria-hidden="true">
        {items.map((item, i) => (
          <span
            key={item.title}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-accent" : "w-2 bg-primary/20"
            }`}
          />
        ))}
      </div>
    </>
  );
};
