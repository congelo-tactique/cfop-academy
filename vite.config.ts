import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // cubing.js est servi tel quel depuis public/vendor (voir scripts/vendor-cubing.mjs).
  optimizeDeps: { exclude: ["cubing"] },
  build: { target: "es2022", chunkSizeWarningLimit: 2000 },
});
