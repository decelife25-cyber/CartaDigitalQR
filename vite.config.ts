import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages serves the app below /CartaDigitalQR/; Cloudflare Pages serves it at /
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/CartaDigitalQR/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
