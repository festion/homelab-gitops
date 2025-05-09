import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/audit': {
          target: 'http://localhost:3070',
          changeOrigin: true,
        }
      }
    }
  })
