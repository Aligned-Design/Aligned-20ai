import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

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
    proxy: {
      // Proxy API requests to the local backend server running on port 3001
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "client"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
});
