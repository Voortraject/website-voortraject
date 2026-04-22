import { cn } from "@/lib/utils";
import { useAudience, Audience } from "@/contexts/AudienceContext";

interface Props {
  className?: string;
}

export const AudienceToggle = ({ className }: Props) => {
  const { audience, setAudience } = useAudience();
  const opts: { key: Audience; label: string }[] = [
    { key: "uitvoerders", label: "Voor uitvoerders" },
    { key: "bewoners", label: "Voor bewoners" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Doelgroep kiezen"
      className={cn(
        "inline-flex items-center gap-1 bg-white border border-border rounded-full",
        className
      )}
      style={{ height: "36px", padding: "3px" }}
    >
      {opts.map(({ key, label }) => {
        const active = audience === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => setAudience(key)}
            className={cn(
              "rounded-full transition-all duration-200 font-sans font-medium text-[14px]",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
            style={{ padding: "6px 18px" }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
