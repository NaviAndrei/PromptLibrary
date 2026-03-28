import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// NOTE: vite-plugin-pwa@1.2.0 has a known incompatibility with Vite 8 (Rolldown).
// PWA manifest is served via public/manifest.json instead until the plugin is updated.
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/PromptLibrary/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split node_modules into a separate vendor chunk
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // 1MB threshold for library components
    sourcemap: true // Useful for debugging production issues
  }
})
