import request from '@/api/request'

/**
 * ================== 评价相关接口 ==================
 */

/**
 * 发表评价
 * @param {Object} data - 评价数据
 * @param {number} data.venueId - 场馆ID
 * @param {number} data.rating - 评分（1-5）
 * @param {string} data.content - 评价内容
 * @param {Array} data.images - 图片列表（可选）
 */
export function createReview(data) {
  return request({
    url: '/api/review/create',
    method: 'post',
    data
  })
}

/**
 * 获取场馆评价列表
 * @param {number} venueId - 场馆ID
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @param {string} params.sortBy - 排序方式：latest, highest, lowest
 */
export function getVenueReviews(venueId, params = {}) {
  return request({
    url: `/api/review/venue/${venueId}`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      sortBy: params.sortBy || 'latest'
    }
  })
}

/**
 * 获取场馆评价统计
 * @param {number} venueId - 场馆ID
 */
export function getVenueReviewStats(venueId) {
  return request({
    url: `/api/review/venue/${venueId}/stats`,
    method: 'get'
  })
}

/**
 * 获取我的评价
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 */
export function getMyReviews(params = {}) {
  return request({
    url: '/api/review/my',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10
    }
  })
}

/**
 * 管理员获取所有评价
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @param {number} params.auditStatus - 审核状态：0-待审核, 1-已通过, 2-已隐藏
 * @param {string} params.venueName - 场馆名称
 */
export function getAllReviews(params = {}) {
  return request({
    url: '/api/review/admin/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      auditStatus: params.auditStatus,
      venueName: params.venueName
    }
  })
}

/**
 * 管理员审核评价
 * @param {number} id - 评价ID
 * @param {number} auditStatus - 审核状态：0-待审核, 1-已通过, 2-已隐藏
 */
export function auditReview(id, auditStatus) {
  return request({
    url: `/api/review/admin/audit/${id}`,
    method: 'put',
    params: { auditStatus }
  })
}

/**
 * 删除评价
 * @param {number} id - 评价ID
 */
export function deleteReview(id) {
  return request({
    url: `/api/review/${id}`,
    method: 'delete'
  })
}

// 兼容旧接口
/**
 * 提交评价（基于订单号）
 * @param {Object} data
 * @param {string} data.orderNo - 订单号
 * @param {string} data.content - 评价内容
 * @param {number} data.rating - 评分（1~5）
 */
export function submitReview(data) {
  return request({
    url: '/api/review/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
}

/**
 * 根据订单号查询评价内容
 * @param {string} orderNo
 */
export function getReviewsByOrderNo(orderNo) {
  return request({
    url: `/api/review/reviews/${orderNo}`,
    method: 'get',
  })
}

export default {
  createReview,
  getVenueReviews,
  getVenueReviewStats,
  getMyReviews,
  getAllReviews,
  auditReview,
  deleteReview,
  submitReview,
  getReviewsByOrderNo
}
