import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
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
        // 修改这里：将对象改为函数
        manualChunks(id) {
          // 将 element-plus 单独打包
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
          // 其他 node_modules 依赖打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
