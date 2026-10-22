import { cn } from "@/lib/utils";

// Een puntige, gevulde ster. Bewust niet de Star van lucide: die heeft ronde
// hoeken en leest als een sticker; scherpe punten ogen rustiger en verfijnder
// (feedback opdrachtgever, oktober 2026). Ook gebruikt in de cijferband.
export const STER_PAD = "M12 1.6l3.05 6.93 7.53.7-5.7 4.98 1.67 7.39L12 17.74 5.45 21.6l1.67-7.39-5.7-4.98 7.53-.7z";

export const Ster = ({ size = 16, className }: { size?: number | string; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
    <path d={STER_PAD} />
  </svg>
);

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
        <Ster key={i} size={size} className={gevuld ? "text-accent" : "text-accent/30"} />
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
