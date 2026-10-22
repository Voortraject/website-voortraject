import { lazy, Suspense } from "react";

import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Hero, HERO_KNOP_ID } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { ClosingCta } from "@/components/sections/ClosingCta";

// Alles onder de subsidiecheck laadt na de eerste weergave; zie HomeVervolg.
const HomeVervolg = lazy(() => import("@/components/sections/HomeVervolg"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Voortraject | Gratis advies over verduurzamen en subsidies"
        description="Wij zoeken gratis uit welke maatregelen slim zijn voor jouw woning en welke subsidies je kunt krijgen. Persoonlijk advies voor bewoners in Noord-Nederland."
        path="/"
      />
      {/* De oker headerknop verschijnt pas als die in de hero uit beeld is. */}
      <Header ctaNaElement={HERO_KNOP_ID} />
      <main className="flex-1">
        <Hero />
        <LogoCarousel />
        <SubsidiecheckCta />
        {/* Tot het vervolg er is: een vlak van een schermhoogte, zodat de footer
            niet even direct onder de subsidiecheck verschijnt. */}
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <HomeVervolg />
        </Suspense>
      </main>
      <Footer cta={<ClosingCta />} />
    </div>
  );
};

export default Index;
