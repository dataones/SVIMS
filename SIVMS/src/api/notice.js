import request from './request'

// 获取公开公告列表
export function getNoticeList(params) {
  return request({
    url: '/api/notice/list',
    method: 'get',
    params
  })
}

// 获取最新公告（首页显示）
export function getLatestNotices(limit = 4) {
  return request({
    url: '/api/notice/latest',
    method: 'get',
    params: { limit }
  })
}

// 增加公告阅读量
export function increaseReadCount(id) {
  return request({
    url: `/api/notice/${id}/read`,
    method: 'put'
  })
}

// 获取管理员公告列表
export function getAdminNoticeList(params) {
  return request({
    url: '/api/admin/notices',
    method: 'get',
    params
  })
}

// 添加通知
export function addNotice(data) {
  return request({
    url: '/api/admin/notices',
    method: 'post',
    data
  })
}

// 更新通知
export function updateNotice(data) {
  return request({
    url: `/api/admin/notices/${data.id}`,
    method: 'put',
    data
  })
}

// 删除通知
export function deleteNotice(id) {
  return request({
    url: `/api/admin/notices/${id}`,
    method: 'delete'
  })
}

// 发布通知
export function publishNotice(id) {
  return request({
    url: `/api/admin/notices/${id}/publish`,
    method: 'put'
  })
}

// 切换置顶状态
export function toggleNoticeTop(id, isTop) {
  return request({
    url: `/api/admin/notices/${id}/top`,
    method: 'put',
    data: { isTop }
  })
}

// 获取通知详情
export function getNoticeDetail(id) {
  return request({
    url: `/api/admin/notices/${id}`,
    method: 'get'
  })
}

// 获取通知统计
export function getNoticeStats() {
  return request({
    url: '/api/admin/notices/stats',
    method: 'get'
  })
}
