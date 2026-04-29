import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { ForWhom } from "@/components/sections/ForWhom";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ForWhom />
        <Process />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
