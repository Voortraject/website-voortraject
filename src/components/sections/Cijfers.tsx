import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Euro, Layers } from "lucide-react";

import { Ster } from "@/components/Sterren";
import { CIJFER_BESPARING, CIJFER_GOOGLE, CIJFER_ISOLATIE } from "@/config/cijfers";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { minderBeweging, useStaffel } from "@/lib/beweging";
import "@/styles/home-onder.css";

/**
 * "Voortraject in cijfers": drie tegels zoals de kaarten van het CRM-dashboard,
 * met een groot gekleurd getal dat één keer naar zijn eindwaarde telt zodra de
 * band in beeld komt.
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
 * Is de band één keer goed in beeld geweest? Gaat daarna nooit meer uit: de
 * getallen tellen één keer op en blijven dan staan (huisstijl oktober 2026,
 * "getallen tellen één keer op"; opnieuw tellen bij elke passage leidt af).
 */
const useEenmaalInBeeld = (ref: RefObject<Element>) => {
  const [gezien, setGezien] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || gezien) return;

    // Geen IntersectionObserver (oude browser): dan meteen tonen. Een cijfer
    // dat op 0 blijft staan is erger dan geen animatie.
    if (typeof IntersectionObserver !== "function") {
      setGezien(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => (e.intersectionRatio ?? 0) >= ZICHTBAAR_VANAF)) {
          setGezien(true);
          io.disconnect();
        }
      },
      { threshold: [0, ZICHTBAAR_VANAF] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, gezien]);

  return gezien;
};

/**
 * Telt van 0 naar `doel`, met een uitloop zodat het laatste stukje afremt.
 * Bij bewegingsreductie staat het eindgetal er meteen.
 */
const useTelOp = (doel: number, start: boolean) => {
  const [gereduceerd] = useState(minderBeweging);
  const [huidig, setHuidig] = useState(() => (gereduceerd ? doel : 0));
  const vanaf = useRef(huidig);
  vanaf.current = huidig;

  useEffect(() => {
    if (gereduceerd) {
      setHuidig(doel);
      return;
    }
    if (!start) return;

    // Vanaf de waarde die er nú staat, niet vanaf nul. Dat is bijna altijd
    // 0, maar de Google-beoordeling verandert nog als de live query
    // binnenkomt; die telt dan het laatste stukje bij in plaats van
    // terug te springen. De begintijd komt uit het eerste frame zelf, zodat
    // die en de frametijden altijd dezelfde klok volgen.
    const van = vanaf.current;
    let begin: number | null = null;
    let frame = 0;
    const stap = (nu: number) => {
      if (begin === null) begin = nu;
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
  /** Verloop van de tegel (hs-blauw, hs-groen, hs-zand). */
  tegel: string;
  /** Kleur van het getal. */
  kleur: string;
  /** Het ronde icoon rechts naast het getal. */
  rondje: ReactNode;
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
  tegel,
  kleur,
  rondje,
}: CijferProps) => {
  const huidig = useTelOp(waarde, telt);

  // Het tellende getal is voor schermlezers alleen ruis; die krijgen de
  // eindwaarde in één keer, precies zoals de bezoeker hem na de animatie
  // ziet staan.
  const volledig = [voorvoegsel, `${opmaak(waarde, decimalen)}${achtervoegsel ?? ""}`, eenheid]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`hs-tegel ho-kpi ${tegel}`} data-veer>
      <p className={`ho-kpi-getal ${kleur}`}>
        <span className="sr-only">{volledig}</span>
        <span aria-hidden="true">
          {voorvoegsel && <span className="mr-1.5">{voorvoegsel}</span>}
          <span>{opmaak(huidig, decimalen)}</span>
          {/* "+" en ",-" in donker oker: gewoon oker haalt als tekst op een
              lichte tegel geen contrast. */}
          {achtervoegsel && <span className="text-[hsl(var(--niveau-gemeente))]">{achtervoegsel}</span>}
          {eenheid && <span className="ml-1 text-[0.6em]">{eenheid}</span>}
          {ster && <Ster size="0.75em" className="ml-1.5 inline-block align-[-0.06em] text-accent" />}
        </span>
      </p>
      {rondje}
      <p className="ho-kpi-tekst hs-tekst">{onderschrift}</p>
    </div>
  );
};

export const Cijfers = () => {
  const { stats } = useGoogleReviews();
  const sectie = useRef<HTMLElement>(null);
  const telt = useEenmaalInBeeld(sectie);
  useStaffel(sectie);

  // Live uit google_place_stats; lukt die query niet, dan de waarde uit de
  // config. Zo staat er nooit een leeg vak en veroudert het cijfer niet.
  const rating = stats?.rating ?? CIJFER_GOOGLE.terugval;

  return (
    // Bewust compacter dan een gewone sectie: dit is een band tussen twee
    // secties, geen sectie op zichzelf.
    <section ref={sectie} className="hs-band py-[44px] md:py-[72px]" aria-labelledby="cijfers-title">
      <div className="container-home">
        <h2 id="cijfers-title" className="sr-only">
          Voortraject in cijfers
        </h2>

        {/* Op de telefoon en tablet onder elkaar, lage tegels met het icoon naast
            het getal. Pas vanaf lg naast elkaar: smaller past "20.000+ m²" er
            naast het icoon niet groot genoeg in. */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5">
          <Cijfer
            {...CIJFER_ISOLATIE}
            telt={telt}
            tegel="hs-blauw"
            kleur="text-[hsl(var(--rs-getal))]"
            rondje={
              <span className="hs-rondje hs-rondje-ink">
                <Layers size={19} strokeWidth={2} aria-hidden="true" />
              </span>
            }
          />
          <Cijfer
            {...CIJFER_BESPARING}
            telt={telt}
            tegel="hs-groen"
            kleur="text-instap-subsidie"
            rondje={
              <span className="hs-rondje hs-rondje-groen">
                <Euro size={19} strokeWidth={2} aria-hidden="true" />
              </span>
            }
          />
          <Cijfer
            waarde={rating}
            decimalen={1}
            ster
            onderschrift={CIJFER_GOOGLE.onderschrift}
            telt={telt}
            tegel="hs-zand"
            kleur="text-[hsl(var(--rs-getal))]"
            rondje={
              <span className="hs-rondje hs-rondje-oker">
                <Ster size={18} />
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Cijfers;
