import { ArrowRight } from "lucide-react";

import { ROUTE, type RouteStap } from "@/data/maatregelen";
import { cn } from "@/lib/utils";
import { Accent, NummerRondje, SectieKop } from "./primitieven";

/**
 * De verduurzamingsroute als donkere band halverwege de pagina: beperken,
 * opwekken, slim gebruiken. De stap waar deze maatregel bij hoort licht op.
 *
 * Deze uitleg stond al op elke maatregelpagina (`routeTekst`), maar werd door
 * het oude template niet gerenderd. Hij hoort juist zichtbaar te zijn: de
 * volgorde is het inhoudelijke argument van Voortraject.
 *
 * Huisstijl oktober 2026: glazen tegels zonder rand op het donkere vlak, de
 * actieve stap met een oker rondje en een zachte oker gloed.
 */
export const RouteStrip = ({
  actief,
  tekst,
  kop = "Waar dit staat in de [[route]]",
}: {
  actief?: RouteStap;
  tekst: string;
  kop?: string;
}) => (
  <>
    <div className="text-center">
      <SectieKop center opDonker>
        <Accent tekst={kop} />
      </SectieKop>
    </div>

    <ol className="mt-7 grid list-none grid-cols-1 items-stretch gap-3 p-0 md:mt-10 md:grid-cols-3 md:gap-10">
      {ROUTE.map((stap, i) => {
        const isActief = stap.stap === actief;
        return (
          <li key={stap.stap} className="relative flex" data-veer>
            <div className={cn("w-full rounded-[22px] p-5", isActief ? "vd-glas-aan" : "vd-glas")}>
              <div className="flex items-center gap-3">
                <NummerRondje n={i + 1} size={32} kleur={isActief ? "oker" : "glas"} />
                <h3
                  className={cn(
                    "hs-h3 m-0 text-primary-foreground",
                    !isActief && "text-primary-foreground/85",
                  )}
                >
                  {stap.titel}
                </h3>
              </div>
              <p
                className={cn(
                  "mb-0 mt-2.5 text-[15px] leading-relaxed",
                  isActief ? "text-primary-foreground/90" : "text-primary-foreground/75",
                )}
              >
                {stap.korte}
              </p>
              {isActief && <span className="vd-pil mt-3 bg-accent">Deze maatregel</span>}
            </div>
            {i < ROUTE.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-accent md:flex"
                style={{ right: -32 }}
              >
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            )}
          </li>
        );
      })}
    </ol>

    <p className="mx-auto mt-7 max-w-[820px] text-center text-base leading-relaxed text-primary-foreground/85 md:mt-10">
      {tekst}
    </p>
  </>
);
