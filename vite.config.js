import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Make sure '/King/' matches your GitHub repo name
export default defineConfig({
  base: '/King/',
  plugins: [react()]
})
