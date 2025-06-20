/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets/js'),
      '@components': resolve(__dirname, './assets/js/components'),
      '@hooks': resolve(__dirname, './assets/js/hooks'),
      '@utils': resolve(__dirname, './assets/js/utils'),
      '@types': resolve(__dirname, './assets/js/types'),
      '@stores': resolve(__dirname, './assets/js/stores'),
      '@services': resolve(__dirname, './assets/js/services'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./assets/js/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'assets/js/test/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
      ],
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**',
      '**/*.e2e.*',
    ],
  },
  esbuild: {
    jsx: 'automatic',
  },
});
