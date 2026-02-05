import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  base: './',

  server: {
    https: true,
    host: true,
    port: 5173
  },

  plugins: [
    mkcert()
  ],

  build: {
    target: 'esnext'
  },

  optimizeDeps: {
    include: [
      'three',
      '@ar-js-org/arjs-plugin-artoolkit',
      '@ar-js-org/arjs-plugin-threejs'
    ]
  }
});