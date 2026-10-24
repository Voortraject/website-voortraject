import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { bewaarHerkomstUitUrl } from "./lib/herkomst";
import "./index.css";

// Vóór de eerste render: de check en de homepage-CTA herschrijven de URL, en dan
// zijn de utm-tags en de fbclid waarmee de bezoeker binnenkwam weg.
bewaarHerkomstUitUrl();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
