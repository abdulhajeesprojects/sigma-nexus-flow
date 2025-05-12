
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Using optional chaining to prevent error if lovable-tagger is not imported correctly
    mode === 'development' && (() => {
      try {
        return require('lovable-tagger')?.componentTagger?.();
      } catch (e) {
        console.warn('lovable-tagger not found, skipping component tagging');
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
