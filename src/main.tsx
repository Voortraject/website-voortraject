import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { onthoudHerkomst } from "./lib/herkomst";
import "./index.css";

// Vóór de eerste render: de subsidiecheck herschrijft zijn queryparameters zodra
// hij mount, en dan is `?via=` weg. Zie src/lib/herkomst.ts.
onthoudHerkomst(window.location.search);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
