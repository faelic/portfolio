import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

// Public files are otherwise copied verbatim by Vite, including Git-based builds
// where CLI upload exclusions do not define the published dist/ contents.
const obsoletePublicAssets = [
  'assets/background/desktop.jpg',
  'assets/background/portrait-clean-alternate.png',
  'assets/profile/marcus.jpg',
  'assets/profile/marcus-clean.jpg',
  'assets/profile/brooklyn-map.jpg',
  'assets/icons/dock.jpg',
  'assets/effects/pendant-lamp-fixture.png',
  'assets/effects/pendant-lamp-fixture-off.png',
  'assets/projects/previews/README.md',
];
let outputDirectory: string;

export default defineConfig({
  plugins: [react(), {
    name: 'exclude-obsolete-public-assets',
    apply: 'build',
    configResolved(config) { outputDirectory = resolve(config.root, config.build.outDir); },
    closeBundle() {
      for (const asset of obsoletePublicAssets) rmSync(resolve(outputDirectory, asset), { force: true });
    },
  }, {
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
  server: {
    open: false, host: "127.0.0.1", port: 5173, strictPort: true,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
  preview: {
    host: "127.0.0.1", port: 4173, strictPort: true,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
