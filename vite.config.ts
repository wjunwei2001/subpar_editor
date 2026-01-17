import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
<<<<<<< Updated upstream
  publicDir: 'public',
=======
  publicDir: '../public',
>>>>>>> Stashed changes
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
  },
});
