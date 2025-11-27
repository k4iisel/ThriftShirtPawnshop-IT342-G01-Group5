import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api requests to the Spring Boot backend (default localhost:8080).
// Restart the dev server after adding this file.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Keep the path unchanged (we want /api/pawnrequests -> /api/pawnrequests on backend)
        rewrite: (path) => path
      }
    }
  }
});
