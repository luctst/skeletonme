import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the project site under /skeletonme/.
export default defineConfig({
  base: '/skeletonme/',
  plugins: [react(), tailwindcss()],
  // Single React instance across the workspace (lib peer + ui peer + app dep).
  resolve: { dedupe: ['react', 'react-dom'] },
  // @workspace/ui ships .tsx source — let the plugin pipeline transform it
  // instead of pre-bundling.
  optimizeDeps: { exclude: ['@workspace/ui'] },
})
