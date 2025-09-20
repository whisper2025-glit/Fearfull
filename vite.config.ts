import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Replit-specific Vite configuration override
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true, // Allow all hosts for Replit compatibility
    proxy: {
      // Proxy KoboldAI requests to avoid CORS issues when running locally
      '/kobold': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/kobold/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('KoboldAI proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending KoboldAI request to:', proxyReq.path);
          });
        }
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));