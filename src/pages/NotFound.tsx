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
        description="Deze pagina bestaat niet (meer). Ga verder naar de subsidiecheck, verduurzamen of neem contact met ons op."
        path={pathname}
        noindex
      />
      <Header />
      <main className="flex-1">
        <section className="section-pad">
          <div className="container-content mx-auto max-w-3xl text-center">
            {/* Het blaadje is van het logo gewaaid en landt boven op de 404,
                zoals het in het logo boven de j staat. */}
            <div className="relative mx-auto w-fit" aria-hidden="true">
              <span className="block font-['Inter_Tight',_'Inter',_sans-serif] text-[112px] font-bold leading-none tracking-[-0.04em] text-primary md:text-[168px]">
                404
              </span>
              <Blaadje className="absolute -right-5 -top-9 h-14 w-14 animate-wegwaaien motion-reduce:animate-none motion-reduce:rotate-[14deg] md:-right-8 md:-top-14 md:h-20 md:w-20" />
            </div>

            <p className="label-eyebrow mt-8">Pagina niet gevonden</p>
            <h1 className="h2-section mt-3">Deze pagina is weggewaaid</h1>
            <p className="body-lg mx-auto mt-4 max-w-xl text-muted-foreground">
              Ons blaadje is even van het logo gewaaid, en de pagina die je zocht is meegewaaid. Misschien is het
              adres veranderd of zit er een tikfout in. Wij weten de weg gelukkig nog wel.
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
