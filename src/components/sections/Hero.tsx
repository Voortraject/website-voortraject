import { Button } from "../Button";
import { useAudience, Audience } from "@/contexts/AudienceContext";
import heroHouses from "@/assets/hero-houses.jpg";

const content: Record<Audience, {
  h1: string;
  sub: string;
  primary: { label: string; href: string };
}> = {
  uitvoerders: {
    h1: "Extra slagkracht voor groeiende verduurzamingsbedrijven",
    sub: "Wij ondersteunen uitvoerders met bewonersbegeleiding, regelinguitleg, offertevoorbereiding en akkoordtrajecten, zodat jullie kunnen groeien zonder extra intern personeel.",
    primary: { label: "Plan een kennismaking", href: "/contact" },
  },
  bewoners: {
    h1: "Helder advies voor een toekomstbestendige woning",
    sub: "Wij helpen bewoners met overzicht over isolatie, installaties en regelingen, en begeleiden richting een betrouwbare uitvoerder.",
    primary: { label: "Plan een vrijblijvend gesprek", href: "/contact" },
  },
};

export const Hero = () => {
  const { audience } = useAudience();
  const c = content[audience];

  return (
    <section className="bg-background pt-16 pb-24 md:pt-24 md:pb-32" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[5%]">
          <div className="lg:basis-[55%] lg:shrink-0 min-w-0 text-left">
            <div key={audience} className="animate-fade-up">
              <h1 id="hero-title" className="h1-hero text-foreground break-words">
                {c.h1}
              </h1>
              <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
                {c.sub}
              </p>
              <div className="mt-10">
                <Button href={c.primary.href} variant="primary">
                  {c.primary.label}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:basis-[40%] lg:shrink-0 min-w-0 hidden md:block">
            <img
              src={heroHouses}
              alt="Nederlandse rijtjeshuizen met zonnepanelen op het dak"
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
