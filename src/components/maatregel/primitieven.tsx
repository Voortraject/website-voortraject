import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import "@/styles/verduurzamen.css";
import { SECTIE_KLASSE, type SectieBg } from "./stijl";

/**
 * Gedeelde bouwstenen voor de pagina's onder /verduurzamen, in de huisstijl van
 * oktober 2026 (src/styles/huisstijl.css): koppen met een oker markeerstreep,
 * kaarten zonder rand met een zacht verloop en schaduw, een rond icoon naast de
 * titel.
 */

/**
 * Rendert een tekst met [[accent]]-markers. Het gemarkeerde deel krijgt de
 * oker markeerstreep (hs-accent); op donker zet de sectie hs-op-donker.
 */
export const Accent = ({ tekst }: { tekst: string }) => (
  <>
    {tekst.split(/(\[\[[^\]]+\]\])/g).map((deel, i) => {
      const m = deel.match(/^\[\[([^\]]+)\]\]$/);
      return m ? (
        <span key={i} className="hs-accent">
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
    // Maakt het achtergrondritme controleerbaar in een test.
    data-bg={bg}
    className={cn("vd-sectie w-full", SECTIE_KLASSE[bg])}
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
    className={cn("hs-h2 m-0", center ? "text-center" : "text-left", opDonker && "text-primary-foreground")}
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
    className={cn(
      "vd-lead mt-3 max-w-[640px]",
      center && "mx-auto text-center",
      opDonker && "text-primary-foreground/85",
    )}
  >
    {children}
  </p>
);

/** De tint van een kaart: een zacht verloop van boven naar bijna wit. */
export type KaartToon = "blauw" | "zand" | "groen" | "oker" | "wit";

const KAART_TOON: Record<KaartToon, string> = {
  blauw: "hs-blauw-zacht",
  zand: "hs-zand",
  groen: "hs-groen",
  oker: "vd-oker",
  wit: "",
};

/** Kaart zonder rand: verloop, schaduw, grote radius. */
export const Kaart = ({
  children,
  toon = "blauw",
  className = "",
}: {
  children: ReactNode;
  toon?: KaartToon;
  className?: string;
}) => (
  <div className={cn("hs-tegel p-5 md:p-6 h-full w-full", KAART_TOON[toon], className)} data-veer>
    {children}
  </div>
);

export type RondjeKleur = "ink" | "groen" | "oker" | "wit" | "glas" | "provincie" | "gemeente" | "let-op";

// Voluit geschreven: Tailwind gooit klassen uit @layer components weg die hij
// niet letterlijk in de code vindt, dus geen `hs-rondje-${kleur}`.
const RONDJE: Record<RondjeKleur, string> = {
  ink: "hs-rondje-ink",
  groen: "hs-rondje-groen",
  oker: "hs-rondje-oker",
  wit: "hs-rondje-wit",
  glas: "hs-rondje-glas",
  provincie: "hs-rondje-provincie",
  gemeente: "hs-rondje-gemeente",
  "let-op": "vd-rondje-let-op",
};

/** Het ronde icoon met verloop, naast of rechtsboven de titel. */
export const IconCirkel = ({
  Icon,
  size = 40,
  kleur = "ink",
}: {
  Icon: LucideIcon;
  size?: number;
  kleur?: RondjeKleur;
}) => (
  <span
    className={cn("hs-rondje", RONDJE[kleur])}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <Icon size={Math.round(size * 0.48)} strokeWidth={2.1} aria-hidden />
  </span>
);

/** Een genummerd rondje voor stappen en genummerde lijsten. */
export const NummerRondje = ({
  n,
  size = 36,
  kleur = "ink",
}: {
  n: ReactNode;
  size?: number;
  kleur?: RondjeKleur;
}) => (
  <span
    className={cn(
      "hs-rondje font-display font-bold tabular-nums",
      RONDJE[kleur],
    )}
    style={{ width: size, height: size, fontSize: size >= 40 ? 15 : 14 }}
    aria-hidden="true"
  >
    {n}
  </span>
);

export const KaartTitel = ({ children }: { children: ReactNode }) => (
  <h3 className="hs-h3 m-0">{children}</h3>
);

export const KaartTekst = ({ children }: { children: ReactNode }) => (
  <p className="vd-tekst mt-2 mb-0">{children}</p>
);
