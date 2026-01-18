import request from './request'

/**
 * ================= 费用结算相关接口 =================
 */

/**
 * 计算订单费用
 * @param {Object} data - 结算数据
 * @param {number} data.venueId - 场馆ID
 * @param {string} data.date - 预订日期
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @param {number} data.quantity - 数量
 * @param {Array} data.services - 附加服务
 */
export function calculateSettlement(data) {
  return request({
    url: '/api/settlement/calculate',
    method: 'post',
    data
  })
}

/**
 * 应用优惠
 * @param {string} orderNo - 订单号
 * @param {string} discountCode - 优惠码
 */
export function applyDiscount(orderNo, discountCode) {
  return request({
    url: '/api/settlement/discount',
    method: 'post',
    params: { orderNo, discountCode }
  })
}

/**
 * 支付订单
 * @param {string} orderNo - 订单号
 */
export function payOrder(orderNo) {
  return request({
    url: `/api/settlement/${orderNo}/pay`,
    method: 'post'
  })
}

/**
 * 申请退款
 * @param {string} orderNo - 订单号
 * @param {string} reason - 退款原因
 */
export function requestRefund(orderNo, reason) {
  return request({
    url: `/api/settlement/${orderNo}/refund-request`,
    method: 'post',
    params: { reason }
  })
}

/**
 * 管理员处理退款
 * @param {string} orderNo - 订单号
 * @param {number} amount - 退款金额
 * @param {string} adminRemark - 管理员备注
 */
export function processRefund(orderNo, amount, adminRemark) {
  return request({
    url: `/api/settlement/${orderNo}/refund`,
    method: 'put',
    params: { amount, adminRemark }
  })
}

/**
 * 确认订单完成
 * @param {string} orderNo - 订单号
 */
export function finishOrder(orderNo) {
  return request({
    url: `/api/settlement/${orderNo}/finish`,
    method: 'put'
  })
}

/**
 * 查询订单详情
 * @param {string} orderNo - 订单号
 */
export function getOrderDetail(orderNo) {
  return request({
    url: `/api/settlement/${orderNo}`,
    method: 'get'
  })
}

/**
 * 查询订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.type - 订单类型
 * @param {number} params.status - 订单状态
 */
export function getOrderList(params = {}) {
  return request({
    url: '/api/settlement',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      type: params.type,
      status: params.status
    }
  })
}

/**
 * 管理员获取所有订单
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.type - 订单类型
 * @param {number} params.status - 订单状态
 * @param {string} params.username - 用户名
 */
export function adminGetOrderList(params = {}) {
  return request({
    url: '/api/settlement/admin/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      type: params.type,
      status: params.status,
      username: params.username
    }
  })
}

/**
 * 获取结算详情
 * @param {string} orderNo - 订单号
 */
export function getSettlementDetail(orderNo) {
  return request({
    url: `/api/settlement/${orderNo}/settlement`,
    method: 'get'
  })
}

export default {
  calculateSettlement,
  applyDiscount,
  payOrder,
  requestRefund,
  processRefund,
  finishOrder,
  getOrderDetail,
  getOrderList,
  adminGetOrderList,
  getSettlementDetail
}
