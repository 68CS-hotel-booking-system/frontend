import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { parseProxyTarget, parsePublicEnv } from './src/shared/config/env-schema.ts'

export default defineConfig(({ mode }) => {
  const values = loadEnv(mode, process.cwd(), '')
  parsePublicEnv(values)
  const target = parseProxyTarget(values.API_PROXY_TARGET)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: true },
        '/actuator': { target, changeOrigin: true },
      },
    },
  }
})
