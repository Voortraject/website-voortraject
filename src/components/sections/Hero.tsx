import { useState } from "react";
import { Button } from "../Button";
import { cn } from "@/lib/utils";

type Audience = "uitvoerders" | "bewoners";

const content: Record<Audience, {
  h1: string;
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}> = {
  uitvoerders: {
    h1: "Extra slagkracht voor groeiende verduurzamingsbedrijven",
    sub: "Wij ondersteunen uitvoerders met bewonersbegeleiding, regelinguitleg, offertevoorbereiding en akkoordtrajecten, zodat jullie kunnen groeien zonder extra intern personeel.",
    primary: { label: "Bespreek samenwerking", href: "/contact" },
    secondary: { label: "Plan een kennismaking", href: "/contact" },
  },
  bewoners: {
    h1: "Helder advies voor een toekomstbestendige woning",
    sub: "Wij helpen bewoners met overzicht over isolatie, installaties en regelingen, en begeleiden richting een betrouwbare uitvoerder.",
    primary: { label: "Plan een vrijblijvend gesprek", href: "/contact" },
    secondary: { label: "Bekijk de maatregelen", href: "/maatregelen" },
  },
};

export const Hero = () => {
  const [audience, setAudience] = useState<Audience>("uitvoerders");
  const c = content[audience];

  return (
    <section className="bg-background pt-16 pb-24 md:pt-24 md:pb-32" aria-labelledby="hero-title">
      <div className="container-content">
        {/* Toggle */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div
            role="tablist"
            aria-label="Doelgroep kiezen"
            className="inline-flex items-center gap-1 p-1 bg-white border border-border rounded-full shadow-subtle"
          >
            {(Object.keys(content) as Audience[]).map((key) => {
              const active = audience === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setAudience(key)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[15px] font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {key === "uitvoerders" ? "Voor uitvoerders" : "Voor bewoners"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-100 gap-8 lg:gap-[5%] items-center" style={{ gridTemplateColumns: undefined }}>
          <div className="lg:[grid-column:span_55] text-left" style={{ minWidth: 0 }}>
            <div key={audience} className="animate-fade-up">
              <h1 id="hero-title" className="h1-hero text-foreground break-words">
                {c.h1}
              </h1>
              <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
                {c.sub}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button href={c.primary.href} variant="primary">
                  {c.primary.label}
                </Button>
                <Button href={c.secondary.href} variant="secondary">
                  {c.secondary.label}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:[grid-column:span_40] hidden md:block" style={{ minWidth: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop"
              alt="Nederlandse rijtjeswoning met daglicht, rustige straat"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
