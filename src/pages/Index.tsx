import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Hero, HERO_KNOP_ID } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { Herkenning } from "@/components/sections/Herkenning";
import { WaarWeBijHelpen } from "@/components/sections/WaarWeBijHelpen";
import { WaaromKiezen } from "@/components/sections/WaaromKiezen";
import { Cijfers } from "@/components/sections/Cijfers";
import { Reviews } from "@/components/sections/Reviews";
import { Subsidies } from "@/components/sections/Subsidies";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

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
        <Herkenning />
        <WaarWeBijHelpen />
        <Subsidies />
        <WaaromKiezen />
        <Cijfers />
        <Reviews />
        <Team />
        <Faq />
      </main>
      <Footer cta={<ClosingCta />} />
    </div>
  );
};

export default Index;
