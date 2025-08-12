
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// IMPORTANT: Set base to your GitHub repo name so assets resolve correctly on GitHub Pages.
// If your repo name is different, replace MasalaMitra-Frontend below to match exactly.
export default defineConfig({
  plugins: [react()],
  base: '/MasalaMitra-Frontend/'
})
