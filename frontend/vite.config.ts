import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      }
    }
  },
  esbuild: {
    // Ensure TypeScript is properly handled
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  }
})
