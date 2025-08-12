
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// IMPORTANT: Base path set to match GitHub repo name MasalaMeal
export default defineConfig({
  plugins: [react()],
  base: '/MasalaMeal/'
})
