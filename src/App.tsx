import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudienceProvider } from "@/contexts/AudienceContext";
import Index from "./pages/Index.tsx";
import Uitvoerders from "./pages/Uitvoerders.tsx";
import Bewoners from "./pages/Bewoners.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AudienceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/uitvoerders" element={<Uitvoerders />} />
            <Route path="/bewoners" element={<Bewoners />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AudienceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

