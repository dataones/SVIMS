import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['element-plus'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,

    // 🔴 关键：强制轮询监听（解决 Windows 不热更新）
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
        },
      },
    },
  },
})
