import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudienceProvider } from "@/contexts/AudienceContext";
import { RouteTracker } from "@/components/RouteTracker";
import { AdresUitUrl } from "@/components/subsidiecheck/AdresUitUrl";
import { ScrollToTop } from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
// De homepagina zit direct in de hoofdbundel: zij is de eerste indruk en haar
// heroafbeelding bepaalt de LCP. Alle andere pagina's laden pas als je ze
// bezoekt (snelheidsronde oktober 2026: de hoofdbundel was 1 MB, 307 KB
// gecomprimeerd, met daarin onder meer de subsidietool en alle maatregelen).
import Index from "./pages/Index.tsx";
const Zakelijk = lazy(() => import("./pages/Zakelijk.tsx"));

const Isolatie = lazy(() => import("./pages/maatregelen/Isolatie.tsx"));
const Warmtepomp = lazy(() => import("./pages/maatregelen/Warmtepomp.tsx"));
const Airco = lazy(() => import("./pages/maatregelen/Airco.tsx"));
const Thuisbatterij = lazy(() => import("./pages/maatregelen/Thuisbatterij.tsx"));
const Zonnepanelen = lazy(() => import("./pages/maatregelen/Zonnepanelen.tsx"));
const Laadpaal = lazy(() => import("./pages/maatregelen/Laadpaal.tsx"));
const Onderhoud = lazy(() => import("./pages/maatregelen/Onderhoud.tsx"));
const Verduurzamen = lazy(() => import("./pages/Verduurzamen.tsx"));
const OverOns = lazy(() => import("./pages/OverOns.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Subsidiecheck = lazy(() => import("./pages/Subsidiecheck.tsx"));
const SubsidiesNijBegun = lazy(() => import("./pages/SubsidiesNijBegun.tsx"));
const SubsidiesLandelijk = lazy(() => import("./pages/SubsidiesLandelijk.tsx"));
const SubsidiesRegionaal = lazy(() => import("./pages/SubsidiesRegionaal.tsx"));
const SubsidiesStapelen = lazy(() => import("./pages/SubsidiesStapelen.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Cookie = lazy(() => import("./pages/Cookie.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));


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
          <ScrollToTop />
          {/* Vóór RouteTracker: het adres van de subsidiecheck gaat uit de URL
              voordat er iets meet (zie AdresUitUrl). */}
          <AdresUitUrl />
          <RouteTracker />
          {/* Leeg vlak in de achtergrondkleur zolang een pagina laadt: geen
              spinner, die zou bij een snelle verbinding alleen knipperen. */}
          <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/zakelijk" element={<Zakelijk />} />
              {/* Oude adressen van deze pagina. Beide wijzen rechtstreeks naar
                  /zakelijk, dus geen redirect-ketting. Zie ook public/_redirects. */}
              <Route path="/partners" element={<Navigate to="/zakelijk" replace />} />
              <Route path="/uitvoerders" element={<Navigate to="/zakelijk" replace />} />
              <Route path="/bewoners" element={<Navigate to="/" replace />} />
              {/* Was een redirect naar de homepage; sinds er een hub-pagina is,
                  is dit het startpunt van de sectie. */}
              <Route path="/verduurzamen" element={<Verduurzamen />} />
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
          </Suspense>
          <WhatsAppButton />
        </BrowserRouter>
      </AudienceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

