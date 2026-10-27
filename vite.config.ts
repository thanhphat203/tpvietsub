import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-hls': ['hls.js'],
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api/anisrc': {
          target: 'https://anisrc.top',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/anisrc/, ''),
        },
        '/api/zophim': {
          target: 'https://api-zophim.blogspot.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/zophim/, ''),
        },
        '/api/kkphim': {
          target: 'https://phimapi.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/kkphim/, ''),
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
