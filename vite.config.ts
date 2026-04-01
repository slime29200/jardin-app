import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/jardin-app/', // nom exact de votre repo GitHub
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/openfarm': {
        target: 'https://openfarm.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openfarm/, '/api/v1'),
      },
      '/api/trefle': {
        target: 'https://trefle.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/trefle/, '/api/v1'),
      },
    },
  },
})
