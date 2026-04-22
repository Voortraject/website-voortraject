import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problems } from "@/components/sections/Problems";
import { Process } from "@/components/sections/Process";
import { Why } from "@/components/sections/Why";
import { Technology } from "@/components/sections/Technology";
import { ClosingCta } from "@/components/sections/ClosingCta";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Problems />
        <Process />
        <Why />
        <Technology />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
