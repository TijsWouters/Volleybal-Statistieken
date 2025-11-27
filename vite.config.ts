import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'

const vitePwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  manifest: {
    name: 'Volleybal Statistieken',
    short_name: 'VolleyStats',
    description: 'Een app om statistieken voor volleybalteams, wedstrijden en competities te bekijken',
    theme_color: '#3d0099',
    background_color: '#f0e6ff',
    start_url: '/?source=pwa',
    display: 'standalone',
    scope: '/',
    orientation: 'any',
    icons: [
      {
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,.woff2,.ttf,.jpg}'],
  },
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [react(), isSsrBuild && VitePWA(vitePwaConfig), cloudflare()],
    publicDir: 'frontend/public',
    resolve: {
      alias: {
        '@': '/frontend/src/',
      },
    },
    build: {
      manifest: true,
    },
  }
})
