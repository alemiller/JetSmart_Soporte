import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-cert': {
        target: 'https://partners-cert.api.jetsmart.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cert/, ''),
        secure: false,
      },
      '/api-prod': {
        target: 'https://partners-prod.api.jetsmart.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-prod/, ''),
        secure: false,
      }
    }
  }
})
