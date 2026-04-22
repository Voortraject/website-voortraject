import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  intro?: string;
  align?: "center" | "left";
  serif?: boolean;
  className?: string;
}

export const SectionHeader = ({
  title,
  intro,
  align = "center",
  serif = false,
  className,
}: SectionHeaderProps) => {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={cn("max-w-[720px]", alignment, className)}>
      <h2
        className={cn(
          serif
            ? "heading-serif text-4xl md:text-5xl"
            : "font-sans font-semibold text-3xl md:text-[40px] leading-tight tracking-tight"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
};
