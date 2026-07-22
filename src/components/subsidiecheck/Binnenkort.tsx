import { Clock } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";

// Tijdelijke "binnenkort beschikbaar"-staat van /subsidiecheck: getoond zolang
// SUBSIDIECHECK_LIVE (src/config/features.ts) uit staat. De echte check wordt dan
// niet gerenderd, dus de postcodecheck is ook niet via een directe link of oude
// Google-hit te gebruiken. noindex houdt deze placeholder uit de zoekresultaten.
export const Binnenkort = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Subsidiecheck | Voortraject"
        description="Onze subsidiecheck is er binnenkort. Wil je nu al weten welke regelingen bij jouw woning passen? Plan een gratis gesprek met Voortraject."
        path="/subsidiecheck"
        noindex
      />
      <Header />

      <main className="flex-1 flex items-center">
        <section className="w-full section-pad">
          <div className="container-content">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Clock size={30} strokeWidth={1.75} aria-hidden="true" />
              </div>

              <h1 className="h2-section" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
                De subsidiecheck komt eraan
              </h1>

              <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted-foreground">
                We leggen de laatste hand aan onze subsidiecheck. Binnenkort zie je hier in één
                minuut welke regelingen bij jouw woning passen. Nog heel even geduld.
              </p>
              <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-muted-foreground">
                Wil je nu al weten wat er voor jouw woning mogelijk is? Plan een gratis gesprek, dan
                kijken we het samen door.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
                <a
                  href="tel:+31502112689"
                  className="text-[15px] font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  of bel 050 211 2689
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Binnenkort;
