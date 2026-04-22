import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-[15px] font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none px-7 py-3.5";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-[1.02]",
  secondary:
    "bg-white text-primary border border-primary hover:bg-secondary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", href, children, ...props }, ref) => {
    if (href) {
      return (
        <a href={href} className={cn(base, variants[variant], className)}>
          {children}
        </a>
      );
    }
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
