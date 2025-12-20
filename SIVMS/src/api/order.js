import request from '@/api/request'

/**
 * ================= 订单相关接口 =================
 */

/**
 * 查询订单列表（管理员 / 用户）
 * @param {number} [type] - 订单类型：1-场馆预约, 2-器材租赁，可选
 */
export function listOrders(type) {
  return request({
    url: '/api/orders',
    method: 'get',
    params: {
      type: type || 1, // 默认查询场馆预约订单
    },
  })
}

/**
 * 用户支付订单
 * @param {string} orderNo - 订单编号
 */
export function payOrder(orderNo) {
  return request({
    url: `/api/orders/${orderNo}/pay`,
    method: 'post',
  })
}

/**
 * 管理员确认订单完成（可评价）
 * @param {string} orderNo - 订单编号
 */
export function finishOrder(orderNo) {
  return request({
    url: `/api/orders/${orderNo}/finish`,
    method: 'put',
  })
}

/**
 * 管理员退款
 * @param {string} orderNo - 订单编号
 * @param {number} amount - 退款金额
 */
export function refundOrder(orderNo, amount) {
  return request({
    url: `/api/orders/${orderNo}/refund`,
    method: 'put',
    params: { amount },
  })
}

/**
 * 查询订单详情（用户/管理员）
 * @param {string} orderNo - 订单编号
 */
export function getOrderDetail(orderNo) {
  return request({
    url: `/api/orders/${orderNo}`,
    method: 'get',
  })
}

/**
 * ================= 工具方法 =================
 */

/**
 * 获取订单状态文本
 * @param {number} status - 订单状态
 */
export function getOrderStatusText(status) {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已完成',
    3: '已取消',
    4: '已过期',
  }
  return statusMap[status] || '未知状态'
}

/**
 * 格式化订单金额
 * @param {number} amount - 金额
 */
export function formatOrderAmount(amount) {
  return `¥${Number(amount).toFixed(2)}`
}

export default {
  listOrders,
  payOrder,
  finishOrder,
  refundOrder,
  getOrderDetail,
  getOrderStatusText,
  formatOrderAmount,
}
