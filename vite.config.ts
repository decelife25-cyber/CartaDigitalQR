import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages serves the app below /CartaDigitalQR/; Cloudflare Pages is exposed through /carta-camborio/
const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.CF_PAGES === 'true'

export default defineConfig({
  base: isCloudflarePages ? '/carta-camborio/' : (process.env.GITHUB_ACTIONS ? '/CartaDigitalQR/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
