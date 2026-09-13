import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// The production Cloudflare Pages deployment is exposed through the
// www.decelife.com/carta-camborio/ subpath by the router Worker.
// Assets therefore need to be generated under the same public prefix.
const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.CF_PAGES === 'true'
const isProductionBuild = isCloudflarePages || process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  base: isProductionBuild ? '/carta-camborio/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
