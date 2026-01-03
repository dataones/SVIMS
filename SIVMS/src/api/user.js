import request from './request'

// 获取管理员统计数据
export function getAdminStats() {
  return request({
    url: '/api/admin/statistics',
    method: 'get',
  })
}

// 获取用户个人统计数据
export function getUserStats() {
  return request({
    url: '/api/user/statistics',
    method: 'get',
  })
}
