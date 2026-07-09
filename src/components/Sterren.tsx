import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

// Sterrenscore die de échte waarde toont, inclusief gedeeltelijke vulling
// (bijv. 4,5 → vier volle sterren + een halve). Werkt met twee lagen: vage
// sterren als achtergrond, gevulde sterren als voorgrond die op de juiste
// breedte wordt afgekapt.
export const Sterren = ({
  waarde = 5,
  size = 16,
  className,
}: {
  waarde?: number;
  size?: number;
  className?: string;
}) => {
  const pct = (Math.max(0, Math.min(5, waarde)) / 5) * 100;

  const rij = (gevuld: boolean) => (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={gevuld ? "text-accent fill-accent" : "text-accent/30"}
          aria-hidden="true"
        />
      ))}
    </span>
  );

  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`${waarde.toLocaleString("nl-NL")} van 5 sterren`}
    >
      {rij(false)}
      <span
        className="absolute inset-y-0 left-0 inline-flex items-center overflow-hidden"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      >
        {rij(true)}
      </span>
    </span>
  );
};
