import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/upload': 'http://localhost:8000',
        '/detect': 'http://localhost:8000',
        '/health': 'http://localhost:8000',
        '/history': 'http://localhost:8000',
      },
    },
  },
});