import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudienceProvider } from "@/contexts/AudienceContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index.tsx";
import Partners from "./pages/Partners.tsx";

import Isolatie from "./pages/maatregelen/Isolatie.tsx";
import Warmtepomp from "./pages/maatregelen/Warmtepomp.tsx";
import Airco from "./pages/maatregelen/Airco.tsx";
import Thuisbatterij from "./pages/maatregelen/Thuisbatterij.tsx";
import Zonnepanelen from "./pages/maatregelen/Zonnepanelen.tsx";
import Laadpaal from "./pages/maatregelen/Laadpaal.tsx";
import Onderhoud from "./pages/maatregelen/Onderhoud.tsx";
import OverOns from "./pages/OverOns.tsx";
import Contact from "./pages/Contact.tsx";
import Subsidiecheck from "./pages/Subsidiecheck.tsx";
import SubsidiesNijBegun from "./pages/SubsidiesNijBegun.tsx";
import SubsidiesLandelijk from "./pages/SubsidiesLandelijk.tsx";
import SubsidiesRegionaal from "./pages/SubsidiesRegionaal.tsx";
import SubsidiesStapelen from "./pages/SubsidiesStapelen.tsx";
import Privacy from "./pages/Privacy.tsx";
import Cookie from "./pages/Cookie.tsx";
import NotFound from "./pages/NotFound.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AudienceProvider>
        {/* De navy safe-area-vulling achter de statusbalk zit nu in <Header/>:
            een in-flow strook die mee-scrollt, zodat de pagina-content de zone
            vult bij het scrollen (i.p.v. een vaste balk). */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/uitvoerders" element={<Navigate to="/partners" replace />} />
            <Route path="/bewoners" element={<Navigate to="/" replace />} />
            <Route path="/verduurzamen" element={<Navigate to="/" replace />} />
            <Route path="/verduurzamen/isolatie" element={<Isolatie />} />
            <Route path="/verduurzamen/warmtepomp" element={<Warmtepomp />} />
            <Route path="/verduurzamen/airco" element={<Airco />} />
            <Route path="/verduurzamen/thuisbatterij" element={<Thuisbatterij />} />
            <Route path="/verduurzamen/zonnepanelen" element={<Zonnepanelen />} />
            <Route path="/verduurzamen/laadpaal" element={<Laadpaal />} />
            <Route path="/verduurzamen/onderhoud" element={<Onderhoud />} />
            <Route path="/maatregelen" element={<Navigate to="/" replace />} />
            <Route path="/over-ons" element={<OverOns />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/subsidiecheck" element={<Subsidiecheck />} />
            <Route path="/subsidies/nij-begun" element={<SubsidiesNijBegun />} />
            <Route path="/subsidies/landelijk" element={<SubsidiesLandelijk />} />
            <Route path="/subsidies/regionaal" element={<SubsidiesRegionaal />} />
            <Route path="/subsidies/stapelen" element={<SubsidiesStapelen />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookieverklaring" element={<Cookie />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </AudienceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

