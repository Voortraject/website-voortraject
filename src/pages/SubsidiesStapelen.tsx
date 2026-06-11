import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";

const SubsidiesStapelen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Subsidies stapelen | Voortraject"
        description="Lees hoe je verschillende subsidies kunt combineren om je verduurzaming maximaal te laten renderen."
        path="/subsidies/stapelen"
      />
      <Header />
      <main className="flex-1">
        <section className="section-pad">
          <div className="container-content">
            <h1 className="h1-page">Subsidies stapelen</h1>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SubsidiesStapelen;
