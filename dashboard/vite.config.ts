import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/audit/diff': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        },
        '/audit/clone': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        },
        '/audit/delete': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        },
        '/audit/commit': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        },
        '/audit/discard': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        },
        // This should be last and only match the data endpoint
        '^/audit$': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        }
      }
    },
    // This ensures proper SPA routing with browser history API
    preview: {
      port: 5173,
      host: true
    }
  })
