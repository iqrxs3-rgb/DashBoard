import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // دعم top-level await
  },
  server: {
    port: 5173,
    open: true
  }
})