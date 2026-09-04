import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminEmail = (
    env.ADMIN_EMAIL ||
    env.VITE_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.VITE_ADMIN_EMAIL ||
    'admin@techelevant.com'
  ).trim();

  const adminPassword = (
    env.ADMIN_PASSWORD ||
    env.VITE_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.VITE_ADMIN_PASSWORD ||
    'Admin@Tech2026!'
  ).trim();

  return {
    plugins: [react(), tailwindcss()],
    define: {
      '__ADMIN_EMAIL__': JSON.stringify(adminEmail),
      '__ADMIN_PASSWORD__': JSON.stringify(adminPassword),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data/**', '**/data/db.json', '**/data/**/*'],
      },
    },
  };
});
