import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SubsidiesLandelijk = () => {
  useEffect(() => {
    document.title = "Landelijke subsidies | Voortraject";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-content py-24">
        <h1 className="h1-hero mb-6">Landelijke <span className="text-accent">subsidies</span></h1>
        <p className="body-lg text-muted-foreground max-w-2xl">
          Informatie over landelijke regelingen zoals ISDE volgt binnenkort.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SubsidiesLandelijk;
