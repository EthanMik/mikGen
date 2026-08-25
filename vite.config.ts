import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// Served as a GitHub Pages project page, so everything sits under the repo name rather than at a
// domain root. Every absolute path below has to carry it, including the ones the PWA generates.
const BASE = '/WHOOPGen/'

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      base: BASE,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'mikGen',
        short_name: 'mikGen',
        start_url: BASE,
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'aggie_logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  base: BASE,
  build: {
    minify: false,
    sourcemap: true,
  },
}))