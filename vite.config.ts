import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "client"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
});
