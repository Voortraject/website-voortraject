import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, MapPin, Pencil } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { StapAdres } from "@/components/subsidiecheck/StapAdres";
import { StapResultaat } from "@/components/subsidiecheck/StapResultaat";
import { StapSituatie } from "@/components/subsidiecheck/StapSituatie";
import { Voortgang } from "@/components/subsidiecheck/Voortgang";
import { usePdokAdres } from "@/hooks/usePdokAdres";
import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import {
  ALLE_MAATREGELEN,
  type Bewonertype,
  type Maatregel,
  type SubsidieCheckInput,
} from "@/lib/subsidies";

const BEWONERTYPES: Bewonertype[] = ["woningeigenaar", "huurder", "vve", "verhuurder"];

// De volledige stap-state leeft in de URL (?pc=…&hn=…&type=…&m=…): de
// back-button werkt gewoon, een herlaad houdt je resultaat vast en het
// overzicht is deelbaar. Geen m-parameter = alle maatregelen.
const Subsidiecheck = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pc = searchParams.get("pc") ?? "";
  const hn = searchParams.get("hn") ?? "";
  const tv = searchParams.get("tv") ?? "";
  const typeParam = searchParams.get("type");
  const mParam = searchParams.get("m");
  // edit=1: gebruiker wil het adres aanpassen — toon stap 1 mét voorgevulde
  // velden en behoud van situatie/maatregelen, i.p.v. een lege reset.
  const editParam = searchParams.get("edit") === "1";

  const paramsGeldig = POSTCODE_RE.test(pc) && /^[0-9]/.test(hn.trim());
  const bewonertype: Bewonertype | null = BEWONERTYPES.includes(typeParam as Bewonertype)
    ? (typeParam as Bewonertype)
    : null;
  const maatregelen: Maatregel[] = useMemo(() => {
    if (mParam === null) return [];
    return mParam.split(",").filter((m): m is Maatregel => ALLE_MAATREGELEN.includes(m as Maatregel));
  }, [mParam]);

  const adresQuery = usePdokAdres(paramsGeldig ? pc : "", paramsGeldig ? hn : "", tv);
  const adres = paramsGeldig ? (adresQuery.data ?? null) : null;
  const adresZoeken = paramsGeldig && adresQuery.isPending;
  const adresNietGevonden = paramsGeldig && !adresQuery.isPending && !adres;

  const stap: 1 | 2 | 3 = editParam || !paramsGeldig || adresNietGevonden ? 1 : !bewonertype ? 2 : 3;

  // Bouwt de queryparams opnieuw op met behoud van situatie/maatregelen.
  const paramsMetKeuzes = (nieuwPc: string, nieuwHn: string, nieuwTv = tv): Record<string, string> => {
    const params: Record<string, string> = { pc: nieuwPc, hn: nieuwHn };
    if (nieuwTv.trim()) params.tv = nieuwTv.trim();
    if (typeParam) params.type = typeParam;
    if (mParam !== null) params.m = mParam;
    return params;
  };

  const checkInput: SubsidieCheckInput | null = useMemo(() => {
    if (!adres || !bewonertype) return null;
    return {
      postcode: normalizePostcode(pc),
      huisnummer: hn.trim(),
      toevoeging: tv.trim() || undefined,
      gemeente: adres.gemeentenaam,
      provincie: adres.provincienaam,
      bewonertype,
      maatregelen: maatregelen.length > 0 ? maatregelen : [...ALLE_MAATREGELEN],
    };
  }, [adres, bewonertype, pc, hn, tv, maatregelen]);

  // Focus-management: bij elke stapwissel naar de kop, zodat toetsenbord- en
  // screenreadergebruikers niet zwevend achterblijven.
  const kopRef = useRef<HTMLHeadingElement>(null);
  const eersteRender = useRef(true);
  useEffect(() => {
    if (eersteRender.current) {
      eersteRender.current = false;
      return;
    }
    kopRef.current?.focus({ preventScroll: false });
  }, [stap]);

  // Stap 3 heeft bewust géén subregel: de resultaatsamenvatting in
  // StapResultaat vertelt daar het verhaal — geen dubbele koppen.
  const koppen: Record<1 | 2 | 3, { titel: string; sub?: string }> = {
    1: {
      titel: "Waar staat jouw woning?",
      sub: "Vul je postcode en huisnummer in — we zoeken alle regelingen die op jouw adres van toepassing zijn.",
    },
    2: {
      titel: "Vertel iets over je situatie",
      sub: "Twee korte vragen, zodat we alleen tonen wat voor jou geldt.",
    },
    3: {
      titel: "Jouw subsidieoverzicht",
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Subsidiecheck | Voortraject"
        description="Check gratis welke verduurzamingssubsidies er voor jouw woning zijn. Vul je postcode in en zie landelijke, provinciale en gemeentelijke regelingen in één overzicht."
        path="/subsidiecheck"
      />
      <Header />

      <main className="flex-1">
        {/* Compact verticaal ritme: de hele stap moet op één laptopscherm
            passen, inclusief de knop onderaan. */}
        <section className="pt-4 pb-16 md:pt-6 md:pb-24">
          <div className="container-content">
            <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
              <Voortgang
                huidige={stap}
                onStapKlik={(doel) => {
                  if (doel === 1) {
                    setSearchParams({ ...paramsMetKeuzes(pc, hn), edit: "1" });
                  } else {
                    // Naar stap 2: type laten vallen, maatregelen behouden.
                    const params: Record<string, string> = { pc, hn };
                    if (mParam !== null) params.m = mParam;
                    setSearchParams(params);
                  }
                }}
              />

              <h1
                ref={kopRef}
                tabIndex={-1}
                className="h2-section mt-5 text-center outline-none md:mt-6"
                style={{ fontSize: "clamp(26px, 4vw, 38px)" }}
              >
                {koppen[stap].titel}
              </h1>
              {koppen[stap].sub && (
                <p className="mx-auto mt-2 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground">
                  {koppen[stap].sub}
                </p>
              )}

              {/* Bevestigd adres als subtiele pill boven stap 2 en 3 —
                  visueel te onderscheiden van de content eromheen. */}
              {stap > 1 && adres && (
                <div className="mt-4 flex justify-center">
                  <p className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border bg-card px-4 py-2 text-[13.5px] text-foreground/80 shadow-subtle">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="text-muted-foreground" aria-hidden="true" />
                      {adres.straatnaam} {hn.trim()}
                      {tv.trim() ? ` ${tv.trim()}` : ""}, {adres.woonplaatsnaam}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ ...paramsMetKeuzes(pc, hn), edit: "1" })}
                      className="inline-flex items-center gap-1 text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    >
                      <Pencil size={12} aria-hidden="true" />
                      wijzig
                    </button>
                    {stap === 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          // Terug naar stap 2 mét behoud van adres en maatregelen.
                          const params: Record<string, string> = { pc, hn };
                          if (mParam !== null) params.m = mParam;
                          setSearchParams(params);
                        }}
                        className="inline-flex items-center gap-1 text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                      >
                        situatie aanpassen
                      </button>
                    )}
                  </p>
                </div>
              )}

              <div className="mt-6">
                {adresZoeken ? (
                  <p className="flex items-center justify-center gap-2 py-10 text-[15px] text-muted-foreground" aria-live="polite">
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Adres controleren…
                  </p>
                ) : stap === 1 ? (
                  <StapAdres
                    initPostcode={pc}
                    initHuisnummer={hn}
                    initToevoeging={tv}
                    foutmelding={
                      adresNietGevonden
                        ? "We konden dit adres niet vinden — check even je postcode en huisnummer."
                        : null
                    }
                    onBevestigd={(nieuwPc, nieuwHn, nieuwTv) =>
                      // Behoud eerdere keuzes: wie via "wijzig" alleen het adres
                      // aanpast, springt direct terug naar het resultaat.
                      setSearchParams(paramsMetKeuzes(normalizePostcode(nieuwPc), nieuwHn, nieuwTv))
                    }
                  />
                ) : stap === 2 ? (
                  <StapSituatie
                    initBewonertype={bewonertype}
                    initMaatregelen={maatregelen}
                    onVerder={(type, gekozen) => {
                      const params: Record<string, string> = { pc, hn, type };
                      // Alles geselecteerd = geen m-parameter (schonere URL).
                      if (gekozen.length !== ALLE_MAATREGELEN.length) params.m = gekozen.join(",");
                      setSearchParams(params);
                    }}
                  />
                ) : (
                  checkInput && adres && <StapResultaat input={checkInput} adres={adres} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Subsidiecheck;
