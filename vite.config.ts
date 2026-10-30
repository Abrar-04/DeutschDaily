import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// For https://<username>.github.io/deutschdaily/ use /deutschdaily/.
// To deploy at a custom domain or root site, set VITE_BASE_PATH=/.
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || '/deutschdaily/'),
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'DeutschDaily — German Reading',
        short_name: 'DeutschDaily',
        description: 'Short original German stories for curious minds.',
        theme_color: '#f8f7f3',
        background_color: '#f8f7f3',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
}));
