import { useEffect, useRef, useState, type RefObject } from "react";
import { Star } from "lucide-react";

import { CIJFER_GOOGLE, CIJFER_ISOLATIE, CIJFER_VERDUURZAMING } from "@/config/cijfers";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

/**
 * "Voortraject in cijfers": een smalle band met drie getallen die naar hun
 * eindwaarde tellen zodra de band in beeld komt.
 *
 * Staat op de homepage tussen "Waarom bewoners voor ons kiezen" en de
 * reviews, en op /over-ons boven "Hoe wij werken". Dat is het moment waarop
 * de bezoeker de belofte heeft gelezen en zich afvraagt of hier een
 * serieuze partij achter zit: eerst de argumenten, dan de cijfers, dan de
 * stemmen van bewoners.
 *
 * De getallen zelf staan in src/config/cijfers.ts, met bron en
 * verificatiedatum erbij. Hier staat alleen hoe ze eruitzien en bewegen.
 */

const TELDUUR_MS = 1600;

// Ruim een derde van de band moet zichtbaar zijn voordat het tellen begint:
// dan telt hij pas als de bezoeker er echt naar kijkt, niet al bij de eerste
// pixel onderin het scherm.
const ZICHTBAAR_VANAF = 0.35;

/**
 * Staat het element in beeld? Gaat weer uit zodra de band het scherm
 * helemaal verlaten heeft, zodat hij bij een volgende passage opnieuw
 * optelt. Het uitzetten gebeurt expres pas bij helemaal weg en niet al
 * onder de drempel: anders knippert het getal als je een klein stukje
 * heen en weer scrolt.
 */
const useInBeeld = (ref: RefObject<Element>) => {
  const [inBeeld, setInBeeld] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Geen IntersectionObserver (oude browser, testomgeving): dan meteen
    // tonen. Een cijfer dat op 0 blijft staan is erger dan geen animatie.
    if (typeof IntersectionObserver !== "function") {
      setInBeeld(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const laatste = entries[entries.length - 1];
        if (laatste.intersectionRatio >= ZICHTBAAR_VANAF) setInBeeld(true);
        else if (!laatste.isIntersecting) setInBeeld(false);
      },
      { threshold: [0, ZICHTBAAR_VANAF] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return inBeeld;
};

const wilGeenBeweging = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Telt van 0 naar `doel`, met een uitloop zodat het laatste stukje afremt.
 * Bij bewegingsreductie (of zolang de band niet in beeld is geweest) staat
 * het eindgetal er gewoon.
 */
const useTelOp = (doel: number, start: boolean) => {
  const [gereduceerd] = useState(wilGeenBeweging);
  const [huidig, setHuidig] = useState(() => (gereduceerd ? doel : 0));
  const vanaf = useRef(huidig);
  vanaf.current = huidig;

  useEffect(() => {
    if (gereduceerd) {
      setHuidig(doel);
      return;
    }
    // Uit beeld: terug naar nul, zodat de volgende passage weer een echte
    // telling is en niet een getal dat er al staat.
    if (!start) {
      setHuidig(0);
      return;
    }

    // Vanaf de waarde die er nú staat, niet vanaf nul. Dat is bijna altijd
    // 0, maar de Google-beoordeling verandert nog als de live query
    // binnenkomt; die telt dan het laatste stukje bij in plaats van
    // terug te springen.
    const begin = performance.now();
    const van = vanaf.current;
    let frame = 0;
    const stap = (nu: number) => {
      const t = Math.min(1, (nu - begin) / TELDUUR_MS);
      setHuidig(van + (doel - van) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [doel, gereduceerd, start]);

  return huidig;
};

const opmaak = (waarde: number, decimalen: number) =>
  waarde.toLocaleString("nl-NL", {
    minimumFractionDigits: decimalen,
    maximumFractionDigits: decimalen,
  });

type CijferProps = {
  waarde: number;
  decimalen?: number;
  voorvoegsel?: string;
  achtervoegsel?: string;
  eenheid?: string;
  ster?: boolean;
  onderschrift: string;
  telt: boolean;
};

const Cijfer = ({
  waarde,
  decimalen = 0,
  voorvoegsel,
  achtervoegsel,
  eenheid,
  ster,
  onderschrift,
  telt,
}: CijferProps) => {
  const huidig = useTelOp(waarde, telt);

  // Het tellende getal is voor schermlezers alleen ruis; die krijgen de
  // eindwaarde in één keer, precies zoals de bezoeker hem na de animatie
  // ziet staan.
  const volledig = [voorvoegsel, `${opmaak(waarde, decimalen)}${achtervoegsel ?? ""}`, eenheid]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="text-center">
      {/* "€ 1.000.000+" is de langste regel: ruim zes tekenbreedtes. Op mobiel
          staat elk cijfer op een eigen regel en mag het groot zijn; vanaf sm
          delen ze de breedte met z'n drieën, dus schaalt de maat daar mee met
          de kolom. Anders loopt het bedrag op een tablet uit zijn vak. */}
      <p className="font-display font-bold text-primary leading-none tracking-[-0.03em] text-[2.5rem] sm:text-[clamp(1.6rem,4vw,3.25rem)]">
        <span className="sr-only">{volledig}</span>
        <span aria-hidden="true">
          {voorvoegsel && <span className="mr-1.5">{voorvoegsel}</span>}
          {/* Tabulaire cijfers: anders springt de breedte bij elk frame. */}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{opmaak(huidig, decimalen)}</span>
          {achtervoegsel && <span className="text-accent">{achtervoegsel}</span>}
          {eenheid && <span className="ml-1.5 text-[0.6em] align-baseline">{eenheid}</span>}
          {ster && (
            <Star size="0.7em" className="ml-1.5 inline-block align-baseline text-accent fill-accent" />
          )}
        </span>
      </p>
      <p className="mx-auto mt-3 max-w-[22rem] text-[14px] md:text-[15px] leading-[1.5] text-muted-foreground">
        {onderschrift}
      </p>
    </div>
  );
};

export const Cijfers = () => {
  const { stats } = useGoogleReviews();
  const sectie = useRef<HTMLElement>(null);
  const telt = useInBeeld(sectie);

  // Live uit google_place_stats; lukt die query niet, dan de waarde uit de
  // config. Zo staat er nooit een leeg vak en veroudert het cijfer niet.
  const rating = stats?.rating ?? CIJFER_GOOGLE.terugval;

  return (
    // Bewust compacter dan .section-pad-home: dit is een band tussen twee
    // secties, geen sectie op zichzelf. De witte grond zet hem af tegen het zand
    // erboven en het navy eronder, zoals de rest van de pagina het ook doet; de
    // site gebruikt nergens randen om secties te scheiden.
    <section
      ref={sectie}
      className="py-[44px] md:py-[64px]"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-labelledby="cijfers-title"
    >
      <div className="container-home">
        <h2 id="cijfers-title" className="sr-only">
          Voortraject in cijfers
        </h2>

        {/* Mobiel netjes onder elkaar: de onderschriften zijn te lang voor een
            halve telefoonbreedte. Vanaf sm staan ze alle drie naast elkaar. */}
        <div className="grid grid-cols-1 gap-y-9 sm:grid-cols-3 sm:gap-x-8 md:gap-x-10">
          <Cijfer {...CIJFER_ISOLATIE} telt={telt} />
          <Cijfer {...CIJFER_VERDUURZAMING} telt={telt} />
          <Cijfer
            waarde={rating}
            decimalen={1}
            ster
            onderschrift={CIJFER_GOOGLE.onderschrift}
            telt={telt}
          />
        </div>
      </div>
    </section>
  );
};

export default Cijfers;
