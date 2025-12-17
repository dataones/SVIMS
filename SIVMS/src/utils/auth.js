// 从登录注册的响应中获取token
// src/utils/auth.js

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}


export function isAuthenticated() {
  return !!getToken()
}
