import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '@shared': resolve(import.meta.dirname, '../shared/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
      },
    },
  },
  build: {
    target: 'chrome98',
    cssTarget: 'chrome98',
  },
});
