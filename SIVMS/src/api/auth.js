// src/api/auth.js
import request from './request'

export const login = (data) => request.post('/api/auth/login', data)

export const register = (data) => request.post('/api/auth/register', data)

// 添加短信验证码发送接口
export const sendSms = (data) => request.post('/api/auth/send-sms', data)

// 添加获取用户信息接口
export const getUserInfo = () => request.get('/api/auth/user-info')

// 添加退出登录接口
export const logout = () => request.post('/api/auth/logout')

// 更新用户资料接口
export const updateUserProfile = (data) => request.put('/api/auth/user/update', data)

// 修改密码接口
export const changePassword = (data) => request.put('/api/auth/change-password', data)
