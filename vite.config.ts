import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Het derde argument ("") laadt óók variabelen zonder VITE_-prefix. Dat is
  // precies de bedoeling voor ESW_API_KEY: dit bestand draait in Node, dus de
  // key gaat naar de proxy en komt nooit in de browserbundle terecht. Zou hij
  // VITE_ESW_API_KEY heten, dan stond hij wél in de bundle.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      // Dev-only proxy's naar de Energiesubsidiewijzer, zodat we lokaal tegen de
      // echte bron kunnen bouwen zonder CORS. In productie neemt de edge
      // function deze rol over (zie energiesubsidiewijzerProvider.ts).
      proxy: {
        // De officiële API van Milieu Centraal. De key gaat er hier server-side
        // op. Zonder ESW_API_KEY in je .env geeft de bron een 403.
        "/mc-api": {
          target: "https://www.verbeterjehuis.nl",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/mc-api/, "/api/v1"),
          headers: env.ESW_API_KEY ? { apiKey: env.ESW_API_KEY } : undefined,
        },
        // De oude route (scrape van hun publieke site). Blijft staan zolang die
        // het vangnet is; gaat weg met de opruim-PR (tasks/todo.md).
        "/esw": {
          target: "https://www.verbeterjehuis.nl",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/esw/, ""),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
