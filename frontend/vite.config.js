import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['down-arrow.png', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'DownTube - YT Downloader',
        short_name: 'DownTube',
        description: 'Download YouTube videos easily',
        theme_color: '#0f172a', // Matches your slate-950 bg
        icons: [
          {
            src: 'down-arrow.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'down-arrow.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})