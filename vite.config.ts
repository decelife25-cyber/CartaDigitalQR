import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages serves the app below /CartaDigitalQR/; Cloudflare Pages is exposed through /carta-camborio/
export default defineConfig({
  base: process.env.CF_PAGES === 'true' ? '/carta-camborio/' : (process.env.GITHUB_ACTIONS ? '/CartaDigitalQR/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
