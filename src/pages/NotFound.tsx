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
                maten zijn in em, zodat het blad meeschaalt met het cijfer: 0,79em
                hoog is de kapitaalhoogte van Inter Tight, de marges zetten het blad
                optisch midden tussen de vieren en op de basislijn. */}
            <p
              className="font-['Inter_Tight',_'Inter',_sans-serif] text-[120px] font-bold leading-none tracking-[-0.04em] text-primary md:text-[176px]"
              aria-hidden="true"
            >
              4
              <Blaadje
                takje={false}
                className="mb-[-0.03em] ml-[0.06em] mr-[-0.03em] inline-block h-[0.79em] w-[0.79em] animate-dwarrelen align-baseline motion-reduce:animate-none" />
              4
            </p>

            <p className="label-eyebrow mt-8">Foutmelding 404</p>
            <h1 className="h2-section mt-3">Deze pagina bestaat niet</h1>
            <p className="body-lg mx-auto mt-4 max-w-xl text-muted-foreground">
              De link die je hebt gevolgd werkt niet meer, of er zit een typfout in het adres. Dat kan gebeuren als
              een pagina is verhuisd. Kies hieronder waar je naartoe wilt, dan helpen we je verder.
            </p>

            <ul className="mt-10 grid gap-3 text-left sm:grid-cols-3">
              {ROUTES.map((r) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="flex items-center justify-between gap-2 text-[16px] font-semibold text-primary">
                      {r.titel}
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1.5 text-[14px] leading-snug text-muted-foreground">{r.tekst}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-[14.5px] sm:flex-row sm:gap-6">
              <Link
                to="/"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Terug naar de homepage
              </Link>
              <a
                href="tel:+31502112689"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
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
