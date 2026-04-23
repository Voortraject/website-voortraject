import { useEffect, useRef, useState } from "react";
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

const TYPE_MS = 80;
const ERASE_MS = 50;
const HOLD_MS = 1500;
const EMPTY_MS = 200;

const TypewriterWord = ({ words }: { words: string[] }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const phaseRef = useRef<"typing" | "holding" | "erasing" | "empty">("typing");
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const word = words[wordIndex];
    const phase = phaseRef.current;

    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_MS);
      } else {
        phaseRef.current = "holding";
        timer = setTimeout(() => {
          phaseRef.current = "erasing";
          setText((t) => t.slice(0, -1));
        }, HOLD_MS);
      }
    } else if (phase === "erasing") {
      if (text.length > 0) {
        timer = setTimeout(() => setText((t) => t.slice(0, -1)), ERASE_MS);
      } else {
        phaseRef.current = "empty";
        timer = setTimeout(() => {
          phaseRef.current = "typing";
          setWordIndex((i) => (i + 1) % words.length);
        }, EMPTY_MS);
      }
    }
    return () => clearTimeout(timer);
  }, [text, wordIndex, words]);

  const isActive = phaseRef.current === "typing" || phaseRef.current === "erasing";

  return (
    <span
      className="inline-block font-semibold align-baseline"
      style={{ color: "hsl(var(--accent))", minWidth: `${longest.length}ch` }}
    >
      <span>{text}</span>
      <span
        className={isActive ? "" : "animate-blink"}
        style={{ color: "hsl(var(--accent))" }}
      >
        _
      </span>
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
          <div className="lg:basis-[58%] lg:shrink-0 min-w-0 text-left">
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
                <TypewriterWord words={c.rotating} />
              </p>
              <div className="mt-10">
                <Button href={c.primary.href} variant="primary">
                  {c.primary.label}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:basis-[37%] lg:shrink-0 min-w-0 hidden md:block">
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
