import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(getToken() || '')
  const userInfo = ref({})
  const roles = ref([])

  // 计算属性
  const isLogin = computed(() => !!token.value)
  const avatar = computed(() => userInfo.value.avatar || '') // 没头像先留空
  const name = computed(() => userInfo.value.nickname || userInfo.value.username || '未登录')
  const unreadMessages = computed(() => userInfo.value.unreadMessages || 0)

  // Actions
  const loginAction = async (loginData) => {
    try {
      const res = await login(loginData)
      if (res.code === 200) {
        const { token: newToken } = res.data
        token.value = newToken
        setToken(newToken)
        await getUserInfoAction()
        return Promise.resolve()
      } else {
        return Promise.reject(new Error(res.msg || '登录失败'))
      }
    } catch (error) {
      removeToken()
      return Promise.reject(error)
    }
  }

  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfo()
      console.log('【getUserInfo 原始返回】', res)

      if (res.code === 200 && res.data) {
        userInfo.value = res.data
        roles.value = res.data.roles || []
        return res.data
      } else {
        throw new Error(res.msg || '获取用户信息失败')
      }
    } catch (error) {
      console.error('getUserInfoAction error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      token.value = ''
      userInfo.value = {}
      roles.value = []
      removeToken()
    }
  }

  // 初始化时检查登录状态
  const initUser = async () => {
    const savedToken = getToken()
    if (savedToken) {
      token.value = savedToken
      try {
        await getUserInfoAction()
      } catch (error) {
        console.error('初始化用户信息失败:', error)
        removeToken()
      }
    }
  }

  return {
    // State
    token,
    userInfo,
    roles,

    // Getters
    isLogin,
    avatar,
    name,
    unreadMessages,

    // Actions
    loginAction,
    getUserInfoAction,
    logout,
    initUser,
  }
})
