import { CSSProperties, ReactNode, useEffect, useId } from "react";

export type AnimatedGradientBorderProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animationMode?: "auto-rotate" | "static";
  animationSpeed?: number; // seconds per rotation
  gradientColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  backgroundColor?: string;
  borderWidth?: number;
  borderRadius?: number;
};

let propertyRegistered = false;

function ensureAngleProperty() {
  if (propertyRegistered) return;
  if (typeof window === "undefined") return;
  const CSSAny = (window as unknown as { CSS?: { registerProperty?: (d: unknown) => void } }).CSS;
  if (CSSAny?.registerProperty) {
    try {
      CSSAny.registerProperty({
        name: "--gradient-angle",
        syntax: "<angle>",
        inherits: false,
        initialValue: "0deg",
      });
    } catch {
      // already registered
    }
  }
  propertyRegistered = true;
}

export const AnimatedGradientBorder = ({
  children,
  className,
  style,
  animationMode = "auto-rotate",
  animationSpeed = 4,
  gradientColors,
  backgroundColor = "#ffffff",
  borderWidth = 2,
  borderRadius = 12,
}: AnimatedGradientBorderProps) => {
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    ensureAngleProperty();
  }, []);

  const primary = gradientColors?.primary ?? "#92701a";
  const secondary = gradientColors?.secondary ?? "#c9a227";
  const accent = gradientColors?.accent ?? "#f5d176";

  const gradient = `conic-gradient(from var(--gradient-angle), ${primary}, ${secondary}, ${accent}, ${secondary}, ${primary})`;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        borderRadius,
        padding: borderWidth,
        background: gradient,
        animation:
          animationMode === "auto-rotate"
            ? `gradient-rotate ${animationSpeed}s linear infinite`
            : undefined,
        ...style,
      }}
      data-agb-id={id}
    >
      <div
        style={{
          backgroundColor,
          borderRadius: Math.max(0, borderRadius - borderWidth),
          height: "100%",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const BorderRotate = AnimatedGradientBorder;

export default AnimatedGradientBorder;
