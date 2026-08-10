import { ArrowRight } from "lucide-react";

import { ROUTE, type RouteStap } from "@/data/maatregelen";
import { Accent, SectieKop } from "./primitieven";
import { KLEUR } from "./stijl";

/**
 * De verduurzamingsroute als donkere band halverwege de pagina: beperken,
 * opwekken, slim gebruiken. De stap waar deze maatregel bij hoort licht op.
 *
 * Deze uitleg stond al op elke maatregelpagina (`routeTekst`), maar werd door
 * het oude template niet gerenderd. Hij hoort juist zichtbaar te zijn: de
 * volgorde is het inhoudelijke argument van Voortraject.
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

    <ol
      className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10 items-stretch"
      style={{ listStyle: "none", padding: 0, margin: "40px 0 0 0" }}
    >
      {ROUTE.map((stap, i) => {
        const isActief = stap.stap === actief;
        return (
          <li key={stap.stap} className="relative flex">
            <div
              className="rounded-2xl p-5 w-full transition-colors"
              style={{
                backgroundColor: isActief ? "hsl(var(--accent) / 0.15)" : "hsl(0 0% 100% / 0.06)",
                border: `1px solid ${isActief ? KLEUR.goud : "hsl(0 0% 100% / 0.16)"}`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center justify-center rounded-full text-[13px] font-bold shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: isActief ? KLEUR.goud : "hsl(0 0% 100% / 0.16)",
                    color: isActief ? KLEUR.navy : KLEUR.wit,
                  }}
                >
                  {i + 1}
                </span>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: KLEUR.wit, margin: 0, opacity: isActief ? 1 : 0.75 }}
                >
                  {stap.titel}
                </h3>
              </div>
              <p
                className="mt-2.5 text-[15px] leading-relaxed"
                style={{ color: KLEUR.wit, opacity: isActief ? 0.9 : 0.6, margin: "10px 0 0 0" }}
              >
                {stap.korte}
              </p>
              {isActief && (
                <span
                  className="mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: KLEUR.goud, color: KLEUR.navy }}
                >
                  Deze maatregel
                </span>
              )}
            </div>
            {i < ROUTE.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 items-center justify-center"
                style={{ right: -32, width: 24, height: 24 }}
              >
                <ArrowRight size={18} color={KLEUR.goud} strokeWidth={2.5} />
              </span>
            )}
          </li>
        );
      })}
    </ol>

    <p
      className="mt-10 mx-auto text-base leading-relaxed text-center"
      style={{ color: KLEUR.wit, opacity: 0.85, maxWidth: 820 }}
    >
      {tekst}
    </p>
  </>
);
