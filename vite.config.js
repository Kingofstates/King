import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // <-- FIXED FOR VERCEL
  plugins: [react()]
})
