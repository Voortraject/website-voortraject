import { useId, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, type LucideIcon } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { useStaffel } from "@/lib/beweging";
import { cn } from "@/lib/utils";
import "@/styles/subsidies.css";

// Bouwstenen voor de vier subsidiepagina's (landelijk, Nij Begun, regionaal,
// stapelen) in de huisstijl van oktober 2026. Alleen die vier pagina's
// gebruiken dit; de klassen komen uit src/styles/huisstijl.css en
// src/styles/subsidies.css.

type Icoon = LucideIcon;

/** De kleur van een rond icoon; het niveau volgt de subsidietool. */
export type RondjeKleur = "ink" | "provincie" | "gemeente" | "groen" | "oker" | "wit";

// Voluit geschreven: Tailwind gooit klassen uit @layer components weg die het
// niet letterlijk in de broncode ziet, dus geen `hs-rondje-${kleur}`.
const RONDJE_KLASSE: Record<RondjeKleur, string> = {
  ink: "hs-rondje-ink",
  provincie: "hs-rondje-provincie",
  gemeente: "hs-rondje-gemeente",
  groen: "hs-rondje-groen",
  oker: "hs-rondje-oker",
  wit: "hs-rondje-wit",
};

export const Rondje = ({
  Icon,
  kleur = "ink",
  maat = 40,
  className,
}: {
  Icon: Icoon;
  kleur?: RondjeKleur;
  maat?: number;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn("hs-rondje", RONDJE_KLASSE[kleur], className)}
    style={{ width: maat, height: maat }}
  >
    <Icon size={Math.round(maat * 0.48)} strokeWidth={2} aria-hidden />
  </span>
);

/** Het accentwoord in een kop: oker markeerstreep onder inktblauw. */
export const Accent = ({ children }: { children: ReactNode }) => <span className="hs-accent">{children}</span>;

/**
 * Een sectie. `band` is de warme band die om en om valt; de rest staat op
 * off-white. Alles met `data-veer` erin veert gestaffeld in.
 */
export const Sectie = ({
  id,
  band = false,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  band?: boolean;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) => {
  const ref = useRef<HTMLElement>(null);
  useStaffel(ref);
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-[52px] md:py-[88px]", band ? "hs-band" : "bg-background", className)}
    >
      <div className="container-content max-w-[1200px]">{children}</div>
    </section>
  );
};

/** Een h2 in de huisstijl, met optioneel een korte inleiding eronder. */
export const Kop2 = ({
  id,
  children,
  lead,
  midden = false,
  className,
}: {
  id?: string;
  children: ReactNode;
  lead?: ReactNode;
  midden?: boolean;
  className?: string;
}) => (
  <div className={cn(midden ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)} data-veer>
    <h2 id={id} className="hs-h2">
      {children}
    </h2>
    {lead && <p className="hs-tekst mt-3 text-[16.5px] leading-[1.6] md:mt-4 md:text-[18px]">{lead}</p>}
  </div>
);

/** Tekstlink met een pijl die meeveert. Als knop wanneer er geen href is. */
export const PijlLink = ({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
}) => {
  const inhoud = (
    <>
      {children}
      <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden />
    </>
  );
  const klassen = cn("hs-pijl-link min-h-[44px]", className);
  return href ? (
    <a href={href} onClick={onClick} className={klassen}>
      {inhoud}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={klassen}>
      {inhoud}
    </button>
  );
};

/**
 * De bovenkant van een subsidiepagina: kop, inleiding, één oker knop met een
 * tekstlink ernaast, en rechts (op de telefoon eronder) een eigen blok.
 * `knopId` laat de headerknop wachten tot deze knop uit beeld is.
 */
export const SubsidieHero = ({
  titel,
  intro,
  knop,
  tweede,
  naast,
  knopId = "subsidie-hero-knop",
}: {
  titel: ReactNode;
  intro: ReactNode;
  knop: ReactNode;
  tweede?: ReactNode;
  naast?: ReactNode;
  knopId?: string;
}) => (
  <section className="hs-band -mt-20 rounded-b-[32px] pb-12 pt-[104px] md:rounded-b-[48px] md:pb-20 md:pt-36">
    <div className="container-content max-w-[1200px]">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[3fr_2fr] lg:gap-14">
        <div className="min-w-0">
          <h1 className="font-display text-[31px] font-bold leading-[1.1] tracking-[-0.03em] text-primary [text-wrap:balance] md:text-[48px] lg:text-[56px]">
            {titel}
          </h1>
          <p className="hs-tekst mt-4 max-w-[620px] text-[16.5px] leading-[1.6] md:mt-5 md:text-[18px]">{intro}</p>
          <div id={knopId} className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6 md:mt-8">
            {knop}
            {tweede}
          </div>
        </div>
        {naast && <div className="min-w-0">{naast}</div>}
      </div>
    </div>
  </section>
);

/** De drie korte beloftes naast de hero: lage regels met een rond icoon. */
export const HeroLijst = ({
  items,
  kleur,
  vlak,
}: {
  items: { Icon: Icoon; tekst: ReactNode }[];
  kleur: RondjeKleur;
  vlak: string;
}) => (
  <ul className={cn("hs-tegel grid gap-3.5 p-5 md:gap-4 md:p-6", vlak)}>
    {items.map((it, i) => (
      <li key={i} className="flex items-center gap-3">
        <Rondje Icon={it.Icon} kleur={kleur} maat={36} />
        <span className="text-[15px] leading-[1.45] text-foreground [&_strong]:text-primary">{it.tekst}</span>
      </li>
    ))}
  </ul>
);

/** Twee logo's naast elkaar, met een dun streepje ertussen. */
export const LogoPaar = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 flex items-center justify-center gap-5 px-2 py-2 md:gap-6 md:py-4">{children}</div>
);

/** Een vinkje in een klein groen rondje, voor lijsten. */
export const Vink = () => (
  <span aria-hidden="true" className="hs-rondje hs-rondje-groen mt-[1px]" style={{ width: 22, height: 22, boxShadow: "none" }}>
    <Check size={13} strokeWidth={3} aria-hidden />
  </span>
);

export const VinkRegel = ({ children, klein = false }: { children: ReactNode; klein?: boolean }) => (
  <li className={klein ? "flex items-start gap-2 py-1" : "flex items-start gap-2.5 py-1"}>
    <Vink />
    <span className={klein ? "text-[14px] leading-[1.5] text-foreground" : "text-[15px] leading-[1.5] text-foreground"}>{children}</span>
  </li>
);

/** Een kruisje in een zacht rondje, voor "niet vergoed". */
export const KruisRegel = ({ Icon, children }: { Icon: Icoon; children: ReactNode }) => (
  <li className="flex items-start gap-2.5 py-1">
    <span
      aria-hidden="true"
      className="mt-[1px] inline-grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[hsl(var(--rs-hoofd-midden))] text-[hsl(var(--rs-tekst-zacht))]"
    >
      <Icon size={13} strokeWidth={3} aria-hidden />
    </span>
    <span className="text-[15px] leading-[1.5] text-foreground">{children}</span>
  </li>
);

/**
 * Een tegel die openklapt: eigen tegel, chevron in een rond knopje, geen
 * lijnen. Voor de FAQ en voor de toelichtingen op de pagina's.
 */
export const Uitklap = ({
  vraag,
  open,
  onWissel,
  kop: Kop = "h3",
  Icon,
  icoonKleur = "oker",
  children,
}: {
  vraag: ReactNode;
  open: boolean;
  onWissel: () => void;
  /** De vraag als kop (h3/h4), of als gewone tekst waar er nooit een kop stond. */
  kop?: "h3" | "h4" | "span";
  Icon?: Icoon;
  icoonKleur?: RondjeKleur;
  children: ReactNode;
}) => {
  const id = useId();
  const knopId = `${id}-knop`;
  const paneelId = `${id}-paneel`;
  return (
    <div className="sp-klap" data-open={open ? "true" : "false"}>
      <button type="button" id={knopId} className="sp-klap-vraag" aria-expanded={open} aria-controls={paneelId} onClick={onWissel}>
        {Icon && <Rondje Icon={Icon} kleur={icoonKleur} maat={34} />}
        <Kop className="m-0 flex-1 font-display text-[16.5px] font-bold leading-[1.3] text-primary md:text-[17.5px]">{vraag}</Kop>
        <span className="sp-chev" aria-hidden="true">
          <ChevronDown size={18} strokeWidth={2.4} />
        </span>
      </button>
      <div className="sp-klap-inhoud" id={paneelId} role="region" aria-labelledby={knopId}>
        <div>
          <div className="hs-tekst px-[18px] pb-[18px] text-[15.5px] leading-[1.6] md:px-[22px]">{children}</div>
        </div>
      </div>
    </div>
  );
};

/** Eén uitklaptegel die zijn eigen open/dicht bijhoudt. */
export const LosseUitklap = (props: Omit<Parameters<typeof Uitklap>[0], "open" | "onWissel">) => {
  const [open, setOpen] = useState(false);
  return <Uitklap {...props} open={open} onWissel={() => setOpen((v) => !v)} />;
};

export interface Vraag {
  q: string;
  a: string;
}

/** De veelgestelde vragen: één tegelijk open, zoals op de homepagina. */
export const SubsidieFaq = ({ faqs, band = false }: { faqs: Vraag[]; band?: boolean }) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Sectie band={band} labelledBy="faq-titel">
      <div className="mx-auto max-w-[820px]">
        <Kop2 id="faq-titel" midden lead="Wat we het vaakst gevraagd krijgen, kort beantwoord.">
          Veelgestelde <Accent>vragen</Accent>
        </Kop2>
        <ul className="mt-6 grid gap-2.5 md:mt-8">
          {faqs.map((f, i) => (
            <li key={f.q} data-veer>
              <Uitklap vraag={f.q} open={open === i} onWissel={() => setOpen(open === i ? null : i)}>
                <p className="m-0">{f.a}</p>
              </Uitklap>
            </li>
          ))}
        </ul>
      </div>
    </Sectie>
  );
};

export interface Stap {
  n: string;
  t: string;
  d: string;
}

/** Het stappenplan: inktblauwe rondjes met het nummer, twee kolommen op breed. */
export const Stappen = ({ stappen }: { stappen: Stap[] }) => (
  <ol className="mt-7 grid list-none gap-6 p-0 md:mt-10 md:grid-cols-2 md:gap-x-12 md:gap-y-8">
    {stappen.map((s) => (
      <li key={s.n} className="sp-stap" data-veer>
        <span aria-hidden="true" className="hs-rondje hs-rondje-ink sp-stap-nr">
          {s.n}
        </span>
        <div className="min-w-0">
          <h3 className="hs-h3">{s.t}</h3>
          <p className="hs-tekst mt-1.5 text-[15px] leading-[1.6] md:text-[16px]">{s.d}</p>
        </div>
      </li>
    ))}
  </ol>
);

/** Het tussenblok na de stappen: een korte vraag en één knop. */
export const TussenCta = ({ kop, tekst, knop }: { kop: ReactNode; tekst?: ReactNode; knop: ReactNode }) => (
  <div className="hs-tegel hs-blauw-zacht mx-auto mt-10 max-w-[760px] px-5 py-7 text-center md:mt-14 md:px-8 md:py-10" data-veer>
    <p className="font-display text-[20px] font-bold leading-[1.25] tracking-[-0.01em] text-primary md:text-[24px]">{kop}</p>
    {tekst && <p className="hs-tekst mx-auto mt-2 max-w-[520px] text-[15px] leading-[1.6]">{tekst}</p>}
    <div className="mt-5">{knop}</div>
  </div>
);

export interface Reden {
  Icon: Icoon;
  t: string;
  d: string;
}

/** "Waarom bewoners voor Voortraject kiezen": lage tegels, icoon rechtsboven. */
export const WaaromTegels = ({ redenen }: { redenen: Reden[] }) => (
  <ul className="mt-6 grid gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
    {redenen.map((r) => (
      <li key={r.t} className="hs-tegel hs-blauw-zacht grid grid-cols-[1fr_auto] items-start gap-x-3.5 p-[18px] md:p-6" data-veer>
        <h3 className="hs-h3 self-center">{r.t}</h3>
        <Rondje Icon={r.Icon} kleur="ink" />
        <p className="hs-tekst col-span-2 mt-2 text-[15px] leading-[1.6]">{r.d}</p>
      </li>
    ))}
  </ul>
);

/**
 * De slot-CTA, gelijk op alle vier de pagina's. Hoort via de `cta`-prop in het
 * donkere paneel van de Footer, zodat er geen naad ontstaat.
 */
export const SlotCta = ({ laatstBijgewerkt }: { laatstBijgewerkt: string }) => (
  <section className="hs-op-donker py-16 md:py-20">
    <div className="container-content max-w-[640px] text-center">
      <h2 className="hs-h2 text-primary-foreground">Ontdek welke subsidies voor jouw woning gelden</h2>
      <p className="mt-4 text-[16px] leading-[1.6] text-primary-foreground/85">
        Wij zoeken het voor jouw adres uit en stapelen alles wat kan. Eén gesprek, geen loketten. Vrijblijvend en gratis.
      </p>
      <div className="mt-7">
        <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
      </div>
      <p className="mt-7 text-[13.5px] text-primary-foreground/70">Laatst bijgewerkt: {laatstBijgewerkt}</p>
    </div>
  </section>
);
