import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: true,
    hmr: true,
    watch: { usePolling: true, interval: 250 },
  },
  build: { rollupOptions: { output: { manualChunks: { leaflet: ['leaflet', 'leaflet.markercluster'], react: ['react', 'react-dom'] } } } },
});
