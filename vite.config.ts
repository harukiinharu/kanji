import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [
    tailwindcss(),
    preact({
      prerender: {
        enabled: true,
        additionalPrerenderRoutes: ['/404'],
      },
    }),
  ],
})
