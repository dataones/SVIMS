/**
 * SIMS前端应用主入口文件
 *
 * 功能说明：
 * 1. 创建Vue应用实例
 * 2. 配置全局插件和中间件
 * 3. 初始化用户登录状态
 * 4. 挂载应用到DOM
 *
 * 技术栈：
 * - Vue 3.5.25 (核心框架)
 * - Vue Router 4.6.4 (路由管理)
 * - Pinia 3.0.4 (状态管理)
 * - Element Plus 2.12.0 (UI组件库)
 *
 * @author SIMS开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

// 导入Vue核心功能
import { createApp } from 'vue'
import App from './App.vue'          // 根组件
import router from './router'        // 路由配置
import { createPinia } from 'pinia'  // 状态管理
import ElementPlus from 'element-plus' // UI组件库
import 'element-plus/dist/index.css'   // Element Plus样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // Element Plus图标
import { useUserStore } from '@/stores/user' // 用户状态管理

/**
 * 创建Vue应用实例
 *
 * 配置说明：
 * - Pinia: 全局状态管理，处理用户登录状态、全局数据等
 * - Router: 单页应用路由，支持懒加载和路由守卫
 * - Element Plus: UI组件库，提供丰富的表单、布局、反馈组件
 */
const app = createApp(App)

// 创建Pinia实例并注册到应用
const pinia = createPinia()
app.use(pinia)

// 注册路由插件
app.use(router)

// 注册Element Plus UI组件库
app.use(ElementPlus)

// 注册Element Plus图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/**
 * 初始化用户登录状态
 *
 * 作用：
 * 1. 从localStorage恢复用户登录信息
 * 2. 验证JWT令牌有效性
 * 3. 设置全局用户状态
 * 4. 初始化路由守卫
 *
 * 重要：必须在路由注册后调用，确保路由守卫能获取到用户状态
 */
const userStore = useUserStore()
userStore.initUser()

/**
 * 挂载应用到DOM
 *
 * 将Vue应用挂载到index.html中的#app元素上
 * 启动应用的响应式更新和组件渲染
 */
app.mount('#app')
