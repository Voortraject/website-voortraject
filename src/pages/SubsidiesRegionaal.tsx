import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SubsidiesRegionaal = () => {
  useEffect(() => {
    document.title = "Regionale subsidies | Voortraject";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-content py-24">
        <h1 className="h1-hero mb-6">Regionale <span className="text-accent">subsidies</span></h1>
        <p className="body-lg text-muted-foreground max-w-2xl">
          Informatie over regionale en gemeentelijke regelingen volgt binnenkort.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SubsidiesRegionaal;
