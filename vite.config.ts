import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cloudflare Pages serves the application at /carta-camborio/ through the router,
// but static assets must remain at the site root so Pages can serve them correctly.
const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.CF_PAGES === 'true'

export default defineConfig({
  base: isCloudflarePages ? '/' : (process.env.GITHUB_ACTIONS ? '/CartaDigitalQR/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
