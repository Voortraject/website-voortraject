import { ArrowRight, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Blaadje } from "@/components/Blaadje";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";

// Wie hier landt zocht bijna altijd een van deze dingen. Dus geen doodlopend
// eind, maar de drie routes die wel doorlopen.
const ROUTES = [
  {
    to: "/subsidiecheck",
    titel: "Subsidiecheck",
    tekst: "Bekijk welke regelingen er voor jouw adres zijn.",
  },
  {
    to: "/verduurzamen",
    titel: "Verduurzamen",
    tekst: "Isolatie, warmtepomp, zonnepanelen en meer, per maatregel uitgelegd.",
  },
  {
    to: "/contact",
    titel: "Contact",
    tekst: "Stel je vraag, we denken graag met je mee.",
  },
] as const;

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* noindex: Cloudflare Pages geeft op een onbekend adres de SPA terug met
          status 200. Zonder deze tag ziet Google deze pagina als echte inhoud
          (een "soft 404"). */}
      <Seo
        title="Pagina niet gevonden | Voortraject"
        description="Deze pagina bestaat niet. Ga verder naar de subsidiecheck, verduurzamen of neem contact met ons op."
        path={pathname}
        noindex
      />
      <Header />
      <main className="flex-1">
        <section className="section-pad">
          <div className="container-content mx-auto max-w-3xl text-center">
            {/* In het logo is het blaadje geen losse versiering maar deel van een
                letter (de punt op de j). Hier neemt het dezelfde rol: het staat op
                de plek van de 0, en daarom net als in het logo zonder takje. De
                maten zijn in em, zodat het blad meeschaalt met het cijfer: 0,7em
                hoog, iets onder de kapitaalhoogte van Inter Tight; de marges zetten het blad
                optisch midden tussen de vieren en op de basislijn. */}
            <p
              className="font-['Inter_Tight',_'Inter',_sans-serif] text-[120px] font-bold leading-none tracking-[-0.04em] text-primary md:text-[176px]"
              aria-hidden="true"
            >
              4
              <Blaadje
                takje={false}
                className="mb-[-0.027em] ml-[0.11em] mr-[0.07em] inline-block h-[0.7em] w-[0.7em] animate-dwarrelen align-baseline motion-reduce:animate-none" />
              4
            </p>

            <p className="label-eyebrow mt-8">Foutmelding 404</p>
            <h1 className="hs-h2 mt-3">Deze pagina bestaat niet</h1>
            <p className="hs-tekst mx-auto mt-4 max-w-xl text-[16.5px] leading-[1.6] md:text-[18px]">
              De link die je hebt gevolgd werkt niet meer, of er zit een typfout in het adres. Dat kan gebeuren als
              een pagina is verhuisd. Kies hieronder waar je naartoe wilt, dan helpen we je verder.
            </p>

            <ul className="mt-8 grid gap-3 text-left sm:mt-10 sm:grid-cols-3 sm:gap-4">
              {ROUTES.map((r) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    className="hs-tegel hs-blauw-zacht hs-klik flex h-full flex-col p-[18px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-accent md:p-5"
                  >
                    <span className="hs-h3 flex items-center justify-between gap-2">
                      {r.titel}
                      <ArrowRight
                        size={18}
                        className="hs-pijl shrink-0"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="hs-tekst mt-1.5 text-[14.5px] leading-snug">{r.tekst}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
              <Link to="/" className="hs-pijl-link">
                Terug naar de homepage
                <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
              </Link>
              <a
                href="tel:+31502112689"
                className="hs-tekst inline-flex min-h-[32px] items-center gap-2 text-[15px] font-semibold hover:text-primary"
              >
                <Phone size={15} aria-hidden="true" />
                Of bel ons: 050 211 2689
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
