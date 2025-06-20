import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './assets'),
      '@components': path.resolve(__dirname, './assets/js/components'),
      '@hooks': path.resolve(__dirname, './assets/js/hooks'),
      '@utils': path.resolve(__dirname, './assets/js/utils'),
      '@types': path.resolve(__dirname, './assets/js/types'),
      '@stores': path.resolve(__dirname, './assets/js/stores'),
      '@services': path.resolve(__dirname, './assets/js/services'),
    },
  },
  build: {
    outDir: 'static/js',
    sourcemap: true,
    rollupOptions: {
      input: 'assets/js/main.tsx',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    target: 'es2020',
    minify: 'esbuild',
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:1313',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
    ],
  },
});
