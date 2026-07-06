import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudienceProvider } from "@/contexts/AudienceContext";
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
        {/*
          Navy vulling achter de iOS-statusbalk (safe-area boven). BEWUST
          position: fixed i.p.v. absolute: een fixed element hangt aan de
          viewport, niet aan de initial containing block, en wordt daardoor NIET
          geclipt door de `overflow-x: clip` op html/body. WebKit/iOS clipt zulke
          absolute ICB-elementen wél weg — dáárop strandde de vorige poging
          (in Chrome oogde het correct, op de iPhone bleef de zone wit). Net als
          bij coca-cola.com is dit een vaste navy balk achter de statusbalk.
          pointer-events-none + alleen de statusbalk-zone (hoogte 0 zonder
          safe-area, dus geen effect op desktop) → dekt geen interactieve content. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] bg-primary"
          style={{ height: "env(safe-area-inset-top)" }}
        />
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
            <Route path="/subsidies/nij-begun" element={<SubsidiesNijBegun />} />
            <Route path="/subsidies/landelijk" element={<SubsidiesLandelijk />} />
            <Route path="/subsidies/regionaal" element={<SubsidiesRegionaal />} />
            <Route path="/subsidies/stapelen" element={<SubsidiesStapelen />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookieverklaring" element={<Cookie />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AudienceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

