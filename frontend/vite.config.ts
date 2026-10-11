import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export const API_BASE = 'http://172.16.218.210:8081/api/v1'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://172.16.218.210:8081',
        changeOrigin: true,
      }
    }
  }
})
