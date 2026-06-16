import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { ForWhom } from "@/components/sections/ForWhom";
import { HowWeWork } from "@/components/sections/HowWeWork";
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
        <ForWhom />
        <HowWeWork />
        <LogoCarousel />
        <AboutTeam />
        <Subsidies />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
