import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      three: path.resolve(__dirname, 'node_modules/three')
    }
  },

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