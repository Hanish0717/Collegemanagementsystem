import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**'],
    server: {
      deps: {
        inline: [/jsdom/, /html-encoding-sniffer/, /@exodus\/bytes/],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
