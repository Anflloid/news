import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Під час розробки /api та /images йдуть на backend (порт 4000)
    proxy: {
      '/api': 'http://localhost:4000',
      '/images': 'http://localhost:4000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // React і роутер - окремим файлом, який довго кешується
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
