import { useEffect, useState } from "react";
import { Button } from "../Button";
import { useAudience, Audience } from "@/contexts/AudienceContext";
import heroHouses from "@/assets/hero-houses.jpg";

const content: Record<Audience, {
  h1: React.ReactNode;
  intro: string;
  rotating: string[];
  primary: { label: string; href: string };
}> = {
  uitvoerders: {
    h1: (
      <>
        Extra <span style={{ color: "hsl(var(--accent))" }}>slagkracht</span> voor groeiende verduurzamingsbedrijven
      </>
    ),
    intro: "Wij ondersteunen uitvoerders met",
    rotating: ["bewonersbegeleiding", "regelinguitleg", "offertevoorbereiding", "akkoordtrajecten"],
    primary: { label: "Plan een kennismaking", href: "/contact" },
  },
  bewoners: {
    h1: (
      <>
        Helder advies voor een toekomstbestendige woning
      </>
    ),
    intro: "Wij helpen bewoners met",
    rotating: ["overzicht", "regelinguitleg", "maatregelkeuze", "uitvoerderkeuze"],
    primary: { label: "Plan een vrijblijvend gesprek", href: "/contact" },
  },
};

const RotatingWord = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  useEffect(() => {
    const visibleMs = 2500;
    const fadeMs = 200;
    const tFadeOut = setTimeout(() => setVisible(false), visibleMs);
    const tSwap = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setVisible(true);
    }, visibleMs + fadeMs);
    return () => {
      clearTimeout(tFadeOut);
      clearTimeout(tSwap);
    };
  }, [index, words]);

  return (
    <span
      className="inline-block font-semibold align-baseline"
      style={{
        color: "hsl(var(--accent))",
        minWidth: `${longest.length}ch`,
      }}
    >
      <span
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      >
        {words[index]}
      </span>
      <span className="animate-blink" style={{ color: "hsl(var(--accent))" }}>_</span>
    </span>
  );
};

export const Hero = () => {
  const { audience } = useAudience();
  const c = content[audience];

  return (
    <section className="bg-background pt-16 pb-24 md:pt-24 md:pb-32" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[5%]">
          <div className="lg:basis-[60%] lg:shrink-0 min-w-0 text-left">
            <div key={audience} className="animate-fade-up">
              <h1
                id="hero-title"
                className="h1-hero text-foreground"
                style={{ wordBreak: "keep-all", hyphens: "none", overflowWrap: "normal" }}
              >
                {c.h1}
              </h1>
              <p className="mt-8 text-[17px] md:text-[20px] leading-[1.5] text-muted-foreground max-w-[640px]">
                {c.intro}{" "}
                <RotatingWord words={c.rotating} />
              </p>
              <div className="mt-10">
                <Button href={c.primary.href} variant="primary">
                  {c.primary.label}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:basis-[35%] lg:shrink-0 min-w-0 hidden md:block">
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
