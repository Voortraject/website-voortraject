import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { Herkenning } from "@/components/sections/Herkenning";
import { HelderPlan } from "@/components/sections/HelderPlan";
import { WaaromKiezen } from "@/components/sections/WaaromKiezen";
import { AboutTeam } from "@/components/sections/AboutTeam";
import { Subsidies } from "@/components/sections/Subsidies";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Voortraject | Ondersteuning in het verduurzamingstraject"
        description="Voortraject begeleidt het hele verduurzamingstraject: uitvoerders houden focus op planning en uitvoering, bewoners krijgen rust en duidelijkheid."
        path="/"
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Herkenning />
        <HelderPlan />
        <Subsidies />
        <WaaromKiezen />
        <LogoCarousel />
        <AboutTeam />
        <Faq />
      </main>
      <Footer cta={<ClosingCta />} />
    </div>
  );
};

export default Index;
