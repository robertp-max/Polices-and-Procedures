import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward API calls to the Express backend in local dev.
      // In production, terminate /api on the same origin (reverse proxy).
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
