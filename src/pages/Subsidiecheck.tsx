import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, MapPin, Pencil, SlidersHorizontal } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Binnenkort } from "@/components/subsidiecheck/Binnenkort";
import { StapAdres } from "@/components/subsidiecheck/StapAdres";
import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { StapResultaat } from "@/components/subsidiecheck/StapResultaat";
import { Voortgang } from "@/components/subsidiecheck/Voortgang";
import { usePand3d } from "@/hooks/usePand3d";
import { usePandContour } from "@/hooks/usePandContour";
import { usePdokAdres } from "@/hooks/usePdokAdres";
import { useWoningInfo } from "@/hooks/useWoningInfo";
import { pushGtmEvent } from "@/lib/gtm";
import { normalizePostcode, type PdokAdres, POSTCODE_RE } from "@/lib/pdok";
import {
  ALLE_MAATREGELEN,
  type Bewonertype,
  type Maatregel,
  type SubsidieCheckInput,
} from "@/lib/subsidies";
import { SUBSIDIECHECK_GEGEVENS_POORT, SUBSIDIECHECK_LIVE } from "@/config/features";
import { isTestmodus, leesTestmodusUitUrl } from "@/config/testmodus";

const BEWONERTYPES: Bewonertype[] = ["woningeigenaar", "huurder", "vve", "verhuurder"];

// Hoe lang het ingevulde formulier nog in beeld blijft terwijl het wegvaagt,
// voordat het resultaat de plek overneemt. Kort genoeg om niet als wachten te
// voelen, lang genoeg om de knip weg te halen.
const UITLOOP_MS = 220;

// De volledige stap-state leeft in de URL (?pc=…&hn=…&type=…&m=…): de
// back-button werkt gewoon, een herlaad houdt je resultaat vast en het
// overzicht is deelbaar. Geen m-parameter = alle maatregelen.
const SubsidiecheckLive = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Testmodus (?test=1, nooit op het productiedomein): de hele flow werkt, maar
  // er gaat niets naar het CRM en er vertrekt geen mail. Eén keer uitlezen bij
  // binnenkomst; daarna staat de keuze in sessionStorage, want de stappen
  // herschrijven de queryparameters.
  const [testmodus] = useState(() => {
    leesTestmodusUitUrl();
    return isTestmodus();
  });

  const pc = searchParams.get("pc") ?? "";
  const hn = searchParams.get("hn") ?? "";
  const tv = searchParams.get("tv") ?? "";
  const typeParam = searchParams.get("type");
  const mParam = searchParams.get("m");
  // edit=1: gebruiker wil het adres aanpassen — toon stap 1 mét voorgevulde
  // velden en behoud van situatie/maatregelen, i.p.v. een lege reset.
  const editParam = searchParams.get("edit") === "1";
  // sit=1: bezoeker wil alleen z'n situatie/interesses aanpassen — toon stap 1
  // met het adres als compacte bevestiging en de situatie-uitklap open.
  const sitParam = searchParams.get("sit") === "1";

  const paramsGeldig = POSTCODE_RE.test(pc) && /^[0-9]/.test(hn.trim());
  const bewonertype: Bewonertype | null = BEWONERTYPES.includes(typeParam as Bewonertype)
    ? (typeParam as Bewonertype)
    : null;
  const maatregelen: Maatregel[] = useMemo(() => {
    if (mParam === null) return [];
    return mParam.split(",").filter((m): m is Maatregel => ALLE_MAATREGELEN.includes(m as Maatregel));
  }, [mParam]);

  const adresQuery = usePdokAdres(paramsGeldig ? pc : "", paramsGeldig ? hn : "", tv);
  // Handmatig adres (str/pl in de URL): gebruikt als PDOK het adres niet herkent
  // (bv. nieuwbouw). Geen coördinaten → geen luchtfoto/3D, maar het overzicht
  // werkt gewoon op basis van de postcode.
  const handmatigStraat = searchParams.get("str") ?? "";
  const handmatigPlaats = searchParams.get("pl") ?? "";
  const handmatig = paramsGeldig && handmatigStraat.trim() !== "" && handmatigPlaats.trim() !== "";
  const adres: PdokAdres | null = useMemo(
    () =>
      handmatig
        ? { straatnaam: handmatigStraat, woonplaatsnaam: handmatigPlaats, gemeentenaam: "", provincienaam: "" }
        : paramsGeldig
          ? (adresQuery.data ?? null)
          : null,
    [handmatig, handmatigStraat, handmatigPlaats, paramsGeldig, adresQuery.data],
  );
  const adresZoeken = paramsGeldig && !handmatig && adresQuery.isPending;
  const adresNietGevonden = paramsGeldig && !handmatig && !adresQuery.isPending && !adres;
  // Al bevestigd adres (geldig, gevonden, niet in wijzig-modus): op stap 1 tonen
  // we dat compact i.p.v. de invulvelden (bv. wie via de homepage binnenkomt).
  const bevestigdAdres = !editParam && paramsGeldig && !adresNietGevonden ? adres : null;

  // Prefetch: zodra het adres bekend is, alvast het pand, het 3D-model en het
  // energielabel ophalen. Deze hooks delen hun react-query-cache met
  // StapResultaat (zelfde sleutels), dus op het resultaat staat het woningpaneel
  // al klaar i.p.v. dat het laden dan pas begint.
  const prefetchPand = usePandContour(adres?.centroideRd);
  usePand3d(prefetchPand.data?.pandId); // subject-model (snel)
  usePand3d(prefetchPand.data?.pandId, adres?.centroideRd); // + buurpanden
  useWoningInfo(paramsGeldig ? pc : "", paramsGeldig ? hn : "", tv);

  // De gegevens-poort (tussenoplossing): staat die aan, dan zit er tussen "Jouw
  // woning" en het resultaat een extra stap "Je gegevens". Bewust client-state en
  // niet in de URL: een gedeelde of ververste link vraagt zo opnieuw om gegevens
  // (meer leads). sessionStorage verzacht: binnen dezelfde sessie niet dubbel.
  const poortAan = SUBSIDIECHECK_GEGEVENS_POORT;
  const [ontgrendeld, setOntgrendeld] = useState(() => {
    if (!poortAan) return true;
    try {
      return sessionStorage.getItem("sc_poort_ontgrendeld") === "1";
    } catch {
      return false;
    }
  });
  // Alleen waar op de rendering direct ná het verzenden van de poort. Bij een
  // herlaad of een gedeelde link leest `ontgrendeld` uit sessionStorage en blijft
  // dit false, want dan is er geen aankomst om te vieren.
  const [netBinnen, setNetBinnen] = useState(false);
  // Het formulier is aan het weggaan, het resultaat staat er nog niet. Zonder
  // dit tussenmoment knipt het scherm: het formulier verdwijnt in één frame en
  // het overzicht staat er al terwijl het nog aan het invaden is. Een korte
  // uitloop maakt er een overdracht van in plaats van een schermwissel.
  const [afscheid, setAfscheid] = useState(false);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const ontgrendel = () => {
    try {
      sessionStorage.setItem("sc_poort_ontgrendeld", "1");
    } catch {
      /* private mode → poort blijft binnen deze render-sessie ontgrendeld via state */
    }
    if (reducedMotion) {
      setOntgrendeld(true);
      setNetBinnen(true);
      return;
    }
    setAfscheid(true);
    // Iets korter dan de uitloop zelf, zodat het overzicht begint te verschijnen
    // terwijl het formulier de laatste procenten dekking verliest. Twee losse
    // bewegingen die elkaar niet raken lezen als haperen.
    window.setTimeout(() => {
      setOntgrendeld(true);
      setNetBinnen(true);
    }, UITLOOP_MS);
  };

  // Stap 1 = adres + interesses + evt. situatie invullen. Zodra 'type' gezet is
  // (bij verzenden) is stap 1 klaar; met de poort volgt dan stap 2 (gegevens),
  // anders meteen het resultaat. De situatie staat standaard op woningeigenaar,
  // dus er is geen aparte situatiestap.
  const stap1Actief = editParam || sitParam || !paramsGeldig || adresNietGevonden || !bewonertype;
  // Gememoïseerd omdat de funnel-meting hieronder ervan afhangt: een nieuwe
  // array per render zou dat effect bij elke render opnieuw laten vuren.
  const stappen: readonly string[] = useMemo(
    () => (poortAan ? ["Jouw woning", "Je gegevens", "Resultaat"] : ["Jouw woning", "Resultaat"]),
    [poortAan],
  );
  const resultaatStap = stappen.length; // 3 met poort, anders 2
  const stap = stap1Actief ? 1 : poortAan && !ontgrendeld ? 2 : resultaatStap;

  // Bouwt de queryparams opnieuw op met behoud van situatie/maatregelen.
  const paramsMetKeuzes = (nieuwPc: string, nieuwHn: string, nieuwTv = tv): Record<string, string> => {
    const params: Record<string, string> = { pc: nieuwPc, hn: nieuwHn };
    if (nieuwTv.trim()) params.tv = nieuwTv.trim();
    if (typeParam) params.type = typeParam;
    if (mParam !== null) params.m = mParam;
    return params;
  };

  // Behoudt een handmatig adres (straat + plaats) bij navigatie binnen de flow.
  const metHandmatig = (params: Record<string, string>): Record<string, string> =>
    handmatig ? { ...params, str: handmatigStraat, pl: handmatigPlaats } : params;

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

  // Funnel: elke stap die de bezoeker te zien krijgt, inclusief stap 1. Zonder
  // die noemer is uitval niet te berekenen — subsidiecheck_start meet pas het
  // afrónden van stap 1, niet hoeveel mensen eraan begonnen. Bewust ook op de
  // eerste render: wie via een gedeelde link of de homepage binnenkomt, begint
  // meteen op stap 2 of 3, en dat is een echte instap die mee moet tellen.
  useEffect(() => {
    pushGtmEvent("subsidiecheck_stap", {
      stap,
      stap_naam: stappen[stap - 1] ?? "",
      // Houdt de cijfers vergelijkbaar als de gegevens-poort ooit uitgaat.
      poort: poortAan ? 1 : 0,
    });
  }, [stap, stappen, poortAan]);

  // Het resultaat heeft bewust géén subregel: de samenvatting in StapResultaat
  // vertelt daar het verhaal. De stap-1-kop past zich aan: met een al bekend
  // adres ligt de nadruk op de interesses.
  const kopVoorStap = (): { titel: string; sub?: string; subVerbergMobiel?: boolean } => {
    if (stap === 1) {
      return bevestigdAdres
        ? {
            titel: "Nog één stap",
            sub: "Kies waar je in geïnteresseerd bent, dan zien we meteen jouw regelingen.",
          }
        : {
            titel: "Waar staat jouw woning?",
            sub: "We zoeken de regelingen die bij jouw adres passen, als startpunt voor je verduurzaming.",
            // Op mobiel verbergen: scheelt verticale ruimte zodat de knop onderaan
            // makkelijker binnen één scherm valt. Op sm+ blijft de regel staan.
            subVerbergMobiel: true,
          };
    }
    if (poortAan && stap === 2) {
      // De kop doet twee dingen tegelijk: laten voelen hoe dichtbij het einde is
      // (mensen versnellen richting de finish) en voorkomen dat het woningkaartje
      // eronder voor het overzicht zelf wordt aangezien.
      // Geen subregel meer. Hij zei alleen wat de titel al zegt en wat de
      // legenda boven de velden ("Waar mogen we je overzicht naartoe sturen?")
      // nóg een keer zegt. Drie keer dezelfde mededeling boven één formulier is
      // ruis; de regel eronder telt de gevonden regelingen en dát is de reden
      // om door te gaan.
      return { titel: "Nog één stap tot je overzicht" };
    }
    return { titel: "Jouw subsidieoverzicht" };
  };
  const kop = kopVoorStap();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Subsidiecheck | Voortraject"
        description="Voortraject begeleidt bewoners door het verduurzamingstraject. Doe de gratis check op jouw adres en krijg inzicht in de subsidies en regelingen die bij jouw woning passen, als startpunt voor persoonlijk advies. Subsidie-informatie in samenwerking met Milieu Centraal."
        path="/subsidiecheck"
      />
      <Header />

      <main className="flex-1">
        {/* Compact verticaal ritme: de hele stap moet op één laptopscherm
            passen, inclusief de knop onderaan. */}
        <section className="pt-4 pb-28 md:pt-6 md:pb-24">
          <div className="container-content">
            {/* Stap 1 blijft smal (focus op de invoer); het resultaat krijgt de
                ruimte zodat groepen naast elkaar kunnen staan. De interesses
                staan standaard ingeklapt, dus stap 1 kan compacter dan voorheen. */}
            <div className="mx-auto w-full" style={{ maxWidth: stap === resultaatStap ? 1040 : 640 }}>
              {/* Onmiskenbaar in beeld: anders denk je dat je een echte lead hebt
                  aangemaakt terwijl er niets is opgeslagen, of andersom. */}
              {testmodus && (
                <p
                  role="status"
                  className="mb-4 rounded-lg border-2 border-dashed border-accent px-4 py-2.5 text-center text-[13.5px] font-semibold text-primary"
                  style={{ backgroundColor: "hsl(var(--accent) / 0.12)" }}
                >
                  Testmodus. Je kunt alles invullen en versturen: er komt niets in het CRM en er gaat geen mail uit.
                  Uitzetten met <code>?test=0</code>.
                </p>
              )}

              <Voortgang
                stappen={stappen}
                huidige={stap}
                onStapKlik={() => setSearchParams({ ...paramsMetKeuzes(pc, hn), edit: "1" })}
              />

              <h1
                ref={kopRef}
                tabIndex={-1}
                className="h2-section mt-5 text-center outline-none md:mt-6"
                style={{ fontSize: "clamp(26px, 4vw, 38px)" }}
              >
                {kop.titel}
              </h1>
              {kop.sub && (
                <p
                  className={`mx-auto mt-2 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground${
                    kop.subVerbergMobiel ? " hidden sm:block" : ""
                  }`}
                >
                  {kop.sub}
                </p>
              )}

              {/* Bevestigd adres als subtiele pill boven stap 2 en 3 —
                  visueel te onderscheiden van de content eromheen. */}
              {stap === resultaatStap && adres && (
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
                      adres wijzigen
                    </button>
                    <button
                      type="button"
                      // Alleen de situatie/interesses aanpassen: terug naar stap 1
                      // (adres blijft compact) met de situatie-uitklap open.
                      onClick={() => setSearchParams(metHandmatig({ ...paramsMetKeuzes(pc, hn), sit: "1" }))}
                      className="inline-flex items-center gap-1 text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    >
                      <SlidersHorizontal size={12} aria-hidden="true" />
                      situatie aanpassen
                    </button>
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
                    initBewonertype={bewonertype}
                    initMaatregelen={maatregelen}
                    bevestigdAdres={bevestigdAdres}
                    foutmelding={
                      adresNietGevonden
                        ? "We konden dit adres niet vinden. Check even je postcode en huisnummer."
                        : null
                    }
                    onStart={(nieuwPc, nieuwHn, nieuwTv, type, gekozen) => {
                      // Adres + situatie + interesses bevestigd → direct het overzicht.
                      const params: Record<string, string> = { pc: normalizePostcode(nieuwPc), hn: nieuwHn, type };
                      if (nieuwTv.trim()) params.tv = nieuwTv.trim();
                      // Alles geselecteerd = geen m-parameter (schonere URL).
                      if (gekozen.length !== ALLE_MAATREGELEN.length) params.m = gekozen.join(",");
                      // Behoud een handmatig adres (no-op bij een echt PDOK-adres).
                      setSearchParams(metHandmatig(params));
                    }}
                    onHandmatig={(nieuwPc, nieuwHn, nieuwTv, type, gekozen, straat, stad) => {
                      // PDOK herkent het adres niet: ga verder met wat de bewoner
                      // zelf invulde (str/pl); overzicht werkt op de postcode.
                      const params: Record<string, string> = {
                        pc: normalizePostcode(nieuwPc),
                        hn: nieuwHn,
                        type,
                        str: straat,
                        pl: stad,
                      };
                      if (nieuwTv.trim()) params.tv = nieuwTv.trim();
                      if (gekozen.length !== ALLE_MAATREGELEN.length) params.m = gekozen.join(",");
                      setSearchParams(params);
                    }}
                    onAdresWijzigen={() => setSearchParams({ ...paramsMetKeuzes(pc, hn), edit: "1" })}
                    // sit=1 betekent: de bezoeker klikte op "situatie aanpassen",
                    // dus de situatiekeuze hoort meteen open te staan.
                    situatieOpen={sitParam}
                    // Met de poort volgt er nog een stap, dus niet "Bekijk mijn
                    // subsidies" beloven; wél zeggen wat er gebeurt in plaats van
                    // het nietszeggende "Verder".
                    knopLabel={poortAan ? "Zoek mijn subsidies" : "Bekijk mijn subsidies"}
                  />
                ) : poortAan && stap === 2 ? (
                  checkInput &&
                  adres && (
                    // De uitloop: het formulier vaagt weg en zakt een paar pixels
                    // terug terwijl het overzicht al onderweg is. `pointer-events-none`
                    // omdat een half zichtbaar formulier geen tweede klik mag vangen.
                    <div
                      className={`transition-all duration-200 ease-out ${
                        afscheid ? "pointer-events-none translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                      }`}
                    >
                      <StapGegevens input={checkInput} adres={adres} onOntgrendeld={ontgrendel} />
                    </div>
                  )
                ) : (
                  checkInput && adres && (
                    <StapResultaat
                      input={checkInput}
                      adres={adres}
                      verbergMail={poortAan}
                      // Met de poort draaide de zoeksequentie al op stap 2; hier
                      // nog eens wachten op iets dat in de cache staat is pure
                      // vertraging.
                      alGezocht={poortAan}
                      netBinnen={netBinnen}
                    />
                  )
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

// Feature-gate: zolang de check nog niet echt live is (SUBSIDIECHECK_LIVE = false)
// tonen we de "binnenkort"-melding i.p.v. de postcodecheck. De check-code hierboven
// blijft intact; bij de launch volstaat het omzetten van de flag. De wrapper zelf
// roept geen hooks aan, dus de vaste hook-volgorde in SubsidiecheckLive blijft heel.
const Subsidiecheck = () => (SUBSIDIECHECK_LIVE ? <SubsidiecheckLive /> : <Binnenkort />);

export default Subsidiecheck;
