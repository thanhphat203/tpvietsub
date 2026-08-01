import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // 👇 QUAN TRỌNG: bắt buộc phải có để deploy đúng trên GitHub Pages dạng
    // username.github.io/tên-repo/. Nếu sau này bạn đổi tên repo, phải sửa lại đây.
    // Nếu bạn dùng custom domain riêng (có file CNAME), đổi lại thành base: '/'.
    base: '/tpvietsub/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});