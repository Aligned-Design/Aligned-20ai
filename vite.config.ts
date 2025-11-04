import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
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
          }
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), expressPlugin()],
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
