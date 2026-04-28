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
  return (
    <section className="bg-background pt-10 pb-[56px] md:pt-16 md:pb-[80px]" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[5%]">
          <div className="lg:basis-[58%] lg:shrink-0 min-w-0 text-left">
            <div className="animate-fade-up">
              <h1
                id="hero-title"
                className="h1-hero text-foreground text-left text-7xl"
                style={{
                  wordBreak: "keep-all",
                  hyphens: "none",
                  overflowWrap: "normal",
                  maxWidth: 900,
                }}
              >
                Wij vangen het <span style={{ color: "hsl(var(--accent))" }}>voortraject</span> op, zodat jullie kunnen bouwen
              </h1>
              <p className="mt-8 text-[20px] leading-[1.5] text-muted-foreground max-w-[760px] md:text-[22px] lg:text-[24px]">
                Waar veel tijd op lekt, zit vaak niet op de bouwplaats, maar in alles eromheen: bewonersvragen, planuitleg, offerte-opbouw, opvolging en dossiers die strak moeten blijven lopen. Wij pakken juist dat stuk op, zodat jullie minder kantoorlast hebben en meer focus op uitvoering houden.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="/contact" variant="primary">
                  Plan een kennismaking
                </Button>
                <Button href="/uitvoerders#pakketten" variant="secondary">
                  Bekijk pakketten
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:basis-[37%] lg:shrink-0 min-w-0 hidden md:block">
            <img
              src={heroHouses}
              alt="Nederlandse rijtjeshuizen met zonnepanelen op het dak"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
              style={{ height: 480, boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
