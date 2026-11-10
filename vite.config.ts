import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "retryable-globe-import",
    renderDynamicImport({ targetModuleId }) {
      if (targetModuleId?.endsWith("/map/LocationGlobe.tsx")) {
        return { left: "import(", right: " + '?attempt=' + Date.now())" };
      }
      return null;
    },
  }],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["thinking-orbs/engine"],
  },
  server: { open: false },
});
