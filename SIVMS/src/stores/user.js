import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 1. State
  const token = ref(getToken() || '')
  const userInfo = ref({})
  const roles = ref([])

  // 2. Getters
  const isLogin = computed(() => !!token.value)

  // 头像：后端未返回 avatar 字段，使用默认头像
  const avatar = computed(
    () =>
      userInfo.value.avatar ||
      'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  )

  // 名称显示优先级：昵称 > 用户名 > 默认文本
  const name = computed(() => userInfo.value.nickname || userInfo.value.username || '未登录')

  // 消息数：后端暂无此字段，默认为 0
  const unreadMessages = computed(() => userInfo.value.unreadMessages || 0)

  // ✨ 核心身份逻辑
  // role: 0-普通用户, 1-会员, 2-管理员
  const isAdmin = computed(() => userInfo.value.role === 2)
  const isMember = computed(() => userInfo.value.role === 1)

  // 获取中文身份名称
  const roleName = computed(() => {
    const roleMap = {
      0: '普通用户',
      1: '会员用户',
      2: '系统管理员',
    }
    return roleMap[userInfo.value.role] ?? '未知身份'
  })

  // 3. Actions
  const loginAction = async (loginData) => {
    try {
      const res = await login(loginData)
      if (res.code === 200) {
        // 假设后端返回结构包含 token
        const newToken = res.data.token || res.data // 根据实际登录接口调整
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
