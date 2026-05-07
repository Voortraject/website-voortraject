import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { ForWhom } from "@/components/sections/ForWhom";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Subsidies } from "@/components/sections/Subsidies";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <LogoCarousel />
        <ForWhom />
        <HowWeWork />
        <Subsidies />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
