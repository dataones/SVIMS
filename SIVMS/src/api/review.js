import request from '@/api/request'

/**
 * ================== 评价相关接口 ==================
 */

/**
 * 提交评价（基于订单号）
 * @param {Object} data
 * @param {string} data.orderNo - 订单号
 * @param {string} data.content - 评价内容
 * @param {number} data.rating - 评分（1~5）
 */
export function submitReview(data) {
  return request({
    url: '/api/reviews',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    transformRequest: [
      function (data) {
        const params = new URLSearchParams()
        Object.keys(data).forEach((key) => {
          params.append(key, data[key])
        })
        return params
      },
    ],
  })
}

/**
 * 根据订单号查询评价内容
 * @param {string} orderNo
 */
export function getReviewsByOrderNo(orderNo) {
  return request({
    url: `/api/reviews/${orderNo}`,
    method: 'get',
  })
}

/**
 * 查询指定场馆的评价列表
 * @param {number} venueId
 */
export async function getVenueReviews(venueId) {
  try {
    const res = await request({
      url: `/api/venues/${venueId}/reviews`,
      method: 'get',
    })
    return res.code === 200 ? res.data.list : []
  } catch (err) {
    console.error('获取评价列表失败', err)
    return []
  }
}

/**
 * 查询场馆评价统计信息
 * @param {number} venueId
 */
export async function getVenueReviewStats(venueId) {
  try {
    const res = await request({
      url: `/api/venues/${venueId}/reviews/stats`,
      method: 'get',
    })
    return res.code === 200 ? res.data : { totalReviews: 0, avgRating: '0.0' }
  } catch (err) {
    console.error('获取评价统计失败', err)
    return { totalReviews: 0, avgRating: '0.0' }
  }
}

/**
 * 查询所有评价（后台管理）
 */
export function getAllReviews() {
  return request({
    url: '/api/reviews/all',
    method: 'get',
  })
}
