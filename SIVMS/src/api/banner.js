import request from '@/api/request'

/**
 * ================== 轮播图相关接口 ==================
 */

/**
 * 获取启用的轮播图列表
 */
export function getActiveBanners() {
  return request({
    url: '/api/banner/active',
    method: 'get'
  })
}

/**
 * 获取所有轮播图列表（管理员）
 */
export function getAllBanners() {
  return request({
    url: '/api/banner/list',
    method: 'get'
  })
}

/**
 * 添加轮播图（管理员）
 * @param {Object} data - 轮播图数据
 */
export function addBanner(data) {
  return request({
    url: '/api/banner/admin',
    method: 'post',
    data
  })
}

/**
 * 更新轮播图（管理员）
 * @param {Object} data - 轮播图数据
 */
export function updateBanner(data) {
  return request({
    url: '/api/banner/admin',
    method: 'put',
    data
  })
}

/**
 * 删除轮播图（管理员）
 * @param {number} id - 轮播图ID
 */
export function deleteBanner(id) {
  return request({
    url: `/api/banner/admin/${id}`,
    method: 'delete'
  })
}
