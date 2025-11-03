import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "client"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
});