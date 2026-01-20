/**
 * 用户状态管理Store
 *
 * 负责管理用户登录状态、用户信息和权限控制
 *
 * 功能模块：
 * 1. 用户认证 - 登录、登出、令牌管理
 * 2. 用户信息 - 基本信息、角色权限
 * 3. 状态计算 - 登录状态、权限判断
 * 4. 持久化 - localStorage存储和恢复
 *
 * 技术特性：
 * - Pinia 3.0.4 (状态管理)
 * - Vue 3 Composition API
 * - 响应式状态计算
 * - 本地存储持久化
 *
 * @author SIMS开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // ==================== 1. 状态定义 ====================

  /**
   * JWT令牌
   * 用于API请求认证，存储在localStorage中
   */
  const token = ref(getToken() || '')

  /**
   * 用户基本信息
   * 包含用户ID、用户名、昵称、角色、邮箱、手机号等
   */
  const userInfo = ref({})

  /**
   * 用户角色列表
   * 用于权限控制，支持多角色场景
   */
  const roles = ref([])

  // ==================== 2. 计算属性 ====================

  /**
   * 登录状态
   * @returns {boolean} 是否已登录
   */
  const isLogin = computed(() => !!token.value)

  /**
   * 用户头像
   * 优先使用后端返回的头像，否则使用默认头像
   * @returns {string} 头像URL
   */
  const avatar = computed(
    () =>
      userInfo.value.avatar ||
      'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  )

  /**
   * 用户显示名称
   * 优先级：昵称 > 用户名 > 默认文本
   * @returns {string} 显示名称
   */
  const name = computed(() => userInfo.value.nickname || userInfo.value.username || '未登录')

  /**
   * 未读消息数
   * 后端暂无此字段，默认为0
   * @returns {number} 未读消息数量
   */
  const unreadMessages = computed(() => userInfo.value.unreadMessages || 0)

  /**
   * 管理员权限判断
   * @returns {boolean} 是否为管理员
   */
  const isAdmin = computed(() => userInfo.value.role === 2)

  /**
   * 会员权限判断
   * @returns {boolean} 是否为会员
   */
  const isMember = computed(() => userInfo.value.role === 1)

  /**
   * 角色名称映射
   * @returns {string} 中文角色名称
   */
  const roleName = computed(() => {
    const roleMap = {
      0: '普通用户',    // 普通注册用户
      1: '会员用户',    // VIP会员用户
      2: '系统管理员',  // 系统管理员
    }
    return roleMap[userInfo.value.role] ?? '未知身份'
  })

  // ==================== 3. 用户操作 ====================

  /**
   * 用户登录操作
   *
   * 处理用户登录请求，包括：
   * 1. 调用登录API
   * 2. 存储JWT令牌
   * 3. 获取用户信息
   * 4. 更新状态
   *
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<boolean>} 登录是否成功
   */
  const loginAction = async (loginData) => {
    try {
      const res = await login(loginData)
      if (res.code === 200) {
        // 获取JWT令牌，兼容不同的后端返回格式
        const newToken = res.data.token || res.data
        token.value = newToken
        setToken(newToken)

        // 获取并存储用户信息
        await getUserInfoAction()
        return true
      } else {
        throw new Error(res.msg || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }


  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfo()
      // console.log('【Store获取用户信息】', res)

      if (res.code === 200 && res.data) {
        userInfo.value = res.data
        // 为了兼容某些基于数组判断权限的组件，手动构造 roles
        roles.value = [String(res.data.role)]
        return res.data
      } else {
        throw new Error(res.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息异常:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.warn('退出接口调用失败，强制清除本地状态')
    } finally {
      token.value = ''
      userInfo.value = {}
      roles.value = []
      removeToken()
    }
  }

  const initUser = async () => {
    const savedToken = getToken()
    if (savedToken) {
      token.value = savedToken
      try {
        await getUserInfoAction()
      } catch (error) {
        removeToken()
      }
    }
  }

  return {
    token,
    userInfo,
    roles,
    isLogin,
    avatar,
    name,
    unreadMessages,
    isAdmin, // 导出供 Profile 使用
    isMember, // 导出
    roleName, // 导出
    loginAction,
    getUserInfoAction,
    logout,
    initUser,
  }
})
