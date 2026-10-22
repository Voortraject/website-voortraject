import { cn } from "@/lib/utils";

type Variant = "accent" | "primary" | "licht" | "glas";

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  /**
   * accent = de oker hoofdknop (standaard, één per scherm), primary = inktblauw,
   * licht = wit met schaduw (secundair op licht), glas = matglas (secundair op
   * donker of op een foto).
   */
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

// De klassen staan in src/styles/huisstijl.css.
const variantClasses: Record<Variant, string> = {
  accent: "hs-knop-oker",
  primary: "hs-knop-ink",
  licht: "hs-knop-licht",
  glas: "hs-knop-glas",
};

/**
 * Eén CTA-knop voor de hele site, in de huisstijl van de subsidietool: een pil
 * met een zacht verloop en schaduw, die bij aanwijzen 2px optilt en bij
 * indrukken inveert. Geen zwevende glans meer: rustig boven druk, en de knop
 * valt al op door kleur en gloed.
 */
export const CtaButton = ({
  href,
  children,
  variant = "accent",
  className,
  style,
  "aria-label": ariaLabel,
}: CtaButtonProps) => (
  <a
    href={href}
    aria-label={ariaLabel}
    style={style}
    className={cn("hs-knop", variantClasses[variant], className)}
  >
    {children}
  </a>
);

export default CtaButton;
