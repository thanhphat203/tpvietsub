import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/tpvietsub/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2018', 'safari14', 'chrome80'],
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
        '/api/nguonc': {
          target: 'https://phim.nguonc.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/nguonc/, ''),
        },
        '/api/phim4k': {
          target: 'https://vsmov.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/phim4k/, ''),
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
