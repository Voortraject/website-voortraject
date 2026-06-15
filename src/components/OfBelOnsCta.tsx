import { Phone } from "lucide-react";

interface OfBelOnsCtaProps {
  /** Layout direction for the divider on desktop. Default 'row'. */
  align?: "start" | "center";
  /** Override the colour of label/number (default navy #152C4E). */
  color?: string;
  className?: string;
}

/**
 * Secundaire "Of bel ons"-CTA. Bedoeld om naast een primaire knop te plaatsen,
 * gescheiden door een dunne verticale lijn (op mobiel horizontaal, of weggelaten).
 *
 * Gebruik met een wrapper zoals:
 *   <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
 *     <a ...primaire knop... />
 *     <OfBelOnsCta />
 *   </div>
 */
export const OfBelOnsCta = ({ align = "start", color = "#152C4E", className = "" }: OfBelOnsCtaProps) => {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  const dividerColor = color === "#FFFFFF" ? "rgba(255,255,255,0.25)" : "rgba(21,44,78,0.18)";
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${className}`}
    >
      {/* Scheidingslijn: horizontaal op mobiel, verticaal vanaf sm */}
      <span
        aria-hidden="true"
        className="hidden sm:block"
        style={{ width: 1, height: 40, backgroundColor: dividerColor }}
      />
      <span
        aria-hidden="true"
        className="sm:hidden"
        style={{ height: 1, width: "100%", maxWidth: 80, backgroundColor: dividerColor }}
      />

      <a
        href="tel:+31502112689"
        aria-label="Bel ons: 050 211 2689"
        className={`group inline-flex flex-col ${alignClass} leading-tight transition-colors`}
        style={{ color, textDecoration: "none" }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            opacity: 0.65,
            letterSpacing: "0.02em",
          }}
        >
          Of bel ons
        </span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            marginTop: 2,
          }}
        >
          <Phone size={16} strokeWidth={2.25} style={{ color: "#E8B547" }} aria-hidden="true" />
          <span className="group-hover:underline underline-offset-4">050 211 2689</span>
        </span>
      </a>
    </div>
  );
};

export default OfBelOnsCta;
