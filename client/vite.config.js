import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'demo' ? '/Covid-Data/' : '/',
  server: {
    proxy: { '/api': 'http://localhost:5000' },
  },
  test: {
    environment: 'jsdom',
  },
}));
