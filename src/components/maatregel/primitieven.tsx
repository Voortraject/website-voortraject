import type { ReactNode } from "react";

import { KLEUR, SECTIE_BG, type SectieBg } from "./stijl";

/** Gedeelde componenten voor de pagina's onder /verduurzamen. */

/**
 * Rendert een tekst met [[accent]]-markers, waarbij het gemarkeerde deel goud
 * wordt. Zelfde conventie als op de subsidiepagina's.
 */
export const Accent = ({ tekst }: { tekst: string }) => (
  <>
    {tekst.split(/(\[\[[^\]]+\]\])/g).map((deel, i) => {
      const m = deel.match(/^\[\[([^\]]+)\]\]$/);
      return m ? (
        <span key={i} style={{ color: KLEUR.goud }}>
          {m[1]}
        </span>
      ) : (
        <span key={i}>{deel}</span>
      );
    })}
  </>
);

export const Sectie = ({
  bg,
  id,
  children,
  labelledBy,
}: {
  bg: SectieBg;
  id?: string;
  children: ReactNode;
  labelledBy?: string;
}) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    className="w-full py-12 md:py-[72px]"
    style={{ backgroundColor: SECTIE_BG[bg] }}
  >
    <div className="mx-auto max-w-[1180px] px-6">{children}</div>
  </section>
);

export const SectieKop = ({
  children,
  id,
  center,
  opDonker = false,
}: {
  children: ReactNode;
  id?: string;
  center?: boolean;
  opDonker?: boolean;
}) => (
  <h2
    id={id}
    className={`font-display text-3xl md:text-4xl font-semibold ${center ? "text-center" : "text-left"}`}
    style={{
      color: opDonker ? KLEUR.wit : KLEUR.navy,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      margin: 0,
    }}
  >
    {children}
  </h2>
);

export const SectieIntro = ({
  children,
  center,
  opDonker = false,
}: {
  children: ReactNode;
  center?: boolean;
  opDonker?: boolean;
}) => (
  <p
    className={`mt-4 text-base leading-relaxed ${center ? "mx-auto text-center" : ""}`}
    style={{
      color: opDonker ? KLEUR.wit : KLEUR.navy,
      opacity: opDonker ? 0.85 : 0.75,
      maxWidth: 640,
    }}
  >
    {children}
  </p>
);

export const Kaart = ({
  children,
  bg,
  className = "",
}: {
  children: ReactNode;
  bg?: string;
  className?: string;
}) => (
  <div
    className={`rounded-2xl p-6 h-full ${className}`}
    style={{
      backgroundColor: bg ?? KLEUR.wit,
      border: `1px solid ${KLEUR.rand}`,
    }}
  >
    {children}
  </div>
);

export const IconCirkel = ({
  Icon,
  size = 44,
}: {
  Icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  size?: number;
}) => (
  <span
    className="inline-flex items-center justify-center rounded-full shrink-0"
    style={{
      backgroundColor: KLEUR.goud,
      width: size,
      height: size,
      color: KLEUR.navy,
    }}
  >
    <Icon size={Math.round(size * 0.5)} aria-hidden />
  </span>
);

export const KaartTitel = ({ children }: { children: ReactNode }) => (
  <h3
    className="text-lg font-medium"
    style={{ color: KLEUR.navy, margin: 0, lineHeight: 1.35 }}
  >
    {children}
  </h3>
);

export const KaartTekst = ({ children }: { children: ReactNode }) => (
  <p
    className="text-base leading-relaxed"
    style={{ color: KLEUR.navy, opacity: 0.78, margin: "12px 0 0 0" }}
  >
    {children}
  </p>
);
