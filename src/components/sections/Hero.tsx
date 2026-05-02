import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import heroHouses from "@/assets/hero-houses.jpg";

const rotating = ["bewonersbegeleiding", "regelinguitleg", "offertevoorbereiding", "akkoordtrajecten"];

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
      className="font-semibold max-w-full"
      style={{ color: "#E8B547" }}
    >
      <span>{text}</span>
      <span
        aria-hidden="true"
        className="animate-blink"
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          backgroundColor: "#E8B547",
          verticalAlign: "-0.15em",
          marginLeft: "1px",
        }}
      />
    </span>
  );
};

export const Hero = () => {
  return (
    <section className="bg-background pt-10 pb-[56px] md:pt-16 md:pb-[80px]" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[5%]">
          <div className="lg:basis-[58%] lg:shrink-0 min-w-0 text-left">
            <div className="animate-fade-up">
              <h1
                id="hero-title"
                className="h1-hero text-foreground text-left md:text-6xl lg:text-7xl text-[32px] leading-[1.1]"
                style={{
                  wordBreak: "keep-all",
                  hyphens: "none",
                  overflowWrap: "normal",
                  maxWidth: "none",
                }}
              >
                Focus op <span style={{ color: "hsl(var(--accent))" }}>uitvoering</span>.<br />Wij regelen de rest.
              </h1>
              <p className="mt-10 text-[16px] leading-[1.6] text-muted-foreground max-w-[680px] md:text-[17px] lg:text-[18px]">
                <span className="block sm:inline">Wij ontzorgen uitvoerders met</span>{" "}
                <span className="block sm:inline" style={{ minHeight: "1.6em" }}>
                  <TypewriterWord words={rotating} />
                </span>
              </p>
              <div className="mt-12 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
                <Button href="/contact" variant="primary" className="w-full sm:w-auto">
                  Plan een kennismaking
                </Button>
                <Button href="/uitvoerders#pakketten" variant="secondary" className="w-full sm:w-auto">
                  Bekijk pakketten
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:basis-[37%] lg:shrink-0 min-w-0">
            <img
              src={heroHouses}
              alt="Nederlandse rijtjeshuizen met zonnepanelen op het dak"
              loading="lazy"
              className="w-full rounded-2xl object-cover h-[240px] sm:h-[320px] md:h-[400px] lg:h-[480px]"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
