// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useUserStore } from '@/stores/user' // ⭐ 新增

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// ⭐⭐⭐ 关键：初始化用户登录状态
const userStore = useUserStore()
userStore.initUser()

app.mount('#app')
