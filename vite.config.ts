import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cloudflare Pages is the origin for both the public router path
// (/carta-camborio/) and the Pages deployment URL itself. Keep generated
// assets at the origin root so they are available in both cases.
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
