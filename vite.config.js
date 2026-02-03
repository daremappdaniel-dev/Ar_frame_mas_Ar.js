import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Ar_frame_mas_Ar.js/',
  resolve: {
    alias: {
      'three': path.resolve(__dirname, 'node_modules/three')
    }
  },
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
  }
});