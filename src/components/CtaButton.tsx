import { cn } from "@/lib/utils";

type Variant = "accent" | "primary";

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  /** accent = gouden knop met navy tekst (standaard), primary = navy knop met witte tekst */
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

const variantClasses: Record<Variant, string> = {
  accent: "bg-accent text-primary hover:bg-accent-hover",
  primary: "bg-primary text-primary-foreground hover:brightness-[1.15]",
};

/**
 * Eén CTA-knop voor de hele site, met de zwevende "sheen"-glans die ook op de
 * headerknop zit (elke ~5s een lichtstreep). Respecteert prefers-reduced-motion.
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
    className={cn(
      "relative overflow-hidden inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      variantClasses[variant],
      className
    )}
  >
    <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none" aria-hidden="true">
      <span className="btn-sheen absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </span>
  </a>
);

export default CtaButton;
