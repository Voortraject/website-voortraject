import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { Herkenning } from "@/components/sections/Herkenning";
import { HelderPlan } from "@/components/sections/HelderPlan";
import { WaaromKiezen } from "@/components/sections/WaaromKiezen";
import { Subsidies } from "@/components/sections/Subsidies";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Gratis advies over verduurzamen en subsidies | Voortraject"
        description="Wij zoeken gratis uit welke maatregelen slim zijn voor jouw woning en welke subsidies je kunt krijgen. Onafhankelijk advies voor bewoners in Noord-Nederland."
        path="/"
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Herkenning />
        <HelderPlan />
        <Subsidies />
        <LogoCarousel />
        <WaaromKiezen />
        <Faq />
      </main>
      <Footer cta={<ClosingCta />} />
    </div>
  );
};

export default Index;
