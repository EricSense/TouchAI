import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: { port: 5173, open: true },
  build: { outDir: 'dist', target: 'esnext' },
  resolve: {
    alias: {
      'touchai-sdk': path.resolve(root, 'sdk/src/index.js'),
    },
  },
});
