import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Dev-only proxy naar de Energiesubsidiewijzer (CC-0), zodat we lokaal live
    // tegen de echte bron kunnen bouwen zonder CORS. In productie neemt een
    // edge function deze rol over (zie energiesubsidiewijzerProvider.ts).
    proxy: {
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
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
