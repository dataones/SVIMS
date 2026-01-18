import request from './request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params
  })
}

// 更新用户
export function updateUser(data) {
  return request({
    url: `/api/admin/users/${data.id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'delete'
  })
}

// 切换用户状态
export function toggleUserStatus(id, status) {
  return request({
    url: `/api/admin/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 重置用户密码
export function resetUserPassword(id, password) {
  return request({
    url: `/api/admin/users/${id}/password`,
    method: 'put',
    data: { password }
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'get'
  })
}
