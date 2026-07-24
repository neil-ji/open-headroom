import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/dashboard/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 5173,
    proxy: {
      "/stats": "http://127.0.0.1:8787",
      "/health": "http://127.0.0.1:8787",
      "/stats-lifetime": "http://127.0.0.1:8787",
      "/stats-history": "http://127.0.0.1:8787",
      "/transformations": "http://127.0.0.1:8787",
      "/settings": "http://127.0.0.1:8787",
      "/subscription-window": "http://127.0.0.1:8787",
      "/quota": "http://127.0.0.1:8787",
    },
  },
});
