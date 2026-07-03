import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    cloudflare(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000,
        navigateFallbackDenylist: [/^\/api/, /^\/__/]
      },
      manifest: {
        name: 'HealthTracker',
        short_name: 'HealthTracker',
        description: 'Seu acompanhamento clínico inteligente',
        theme_color: '#0f766e',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3203/3203071.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3203/3203071.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})