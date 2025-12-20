import request from '@/api/request'

/**
 * ================= 预约管理相关接口 =================
 */

/**
 * 提交场馆预约
 * @param {Object} bookingDTO - 预约数据DTO
 * @param {number} bookingDTO.venueId - 场馆ID
 * @param {string} bookingDTO.date - 预约日期（格式：YYYY-MM-DD）
 * @param {string} bookingDTO.startTime - 开始时间（格式：HH:mm）
 * @param {string} bookingDTO.endTime - 结束时间（格式：HH:mm）
 * @param {string} [bookingDTO.remark] - 预约备注
 * @param {number} [bookingDTO.personCount] - 预约人数
 */
export function submitBooking(bookingDTO) {
  return request({
    url: '/api/booking/submit',
    method: 'post',
    data: bookingDTO,
  })
}

/**
 * 修改场馆预约
 * @param {Object} bookingDTO - 预约数据DTO
 * @param {number} bookingDTO.id - 预约ID（必填）
 * @param {number} bookingDTO.venueId - 场馆ID
 * @param {string} bookingDTO.date - 预约日期（格式：YYYY-MM-DD）
 * @param {string} bookingDTO.startTime - 开始时间（格式：HH:mm）
 * @param {string} bookingDTO.endTime - 结束时间（格式：HH:mm）
 * @param {string} [bookingDTO.remark] - 预约备注
 * @param {number} [bookingDTO.personCount] - 预约人数
 */
export function updateBooking(bookingDTO) {
  return request({
    url: '/api/booking/update',
    method: 'put',
    data: bookingDTO,
  })
}

/**
 * 取消预约
 * @param {number} id - 预约ID
 */
export function cancelBooking(id) {
  return request({
    url: `/api/booking/cancel/${id}`,
    method: 'put',
  })
}

/**
 * 管理员审核预约
 * @param {number} id - 预约ID
 * @param {number} status - 审核状态（如：1-通过，2-拒绝）
 * @param {string} [remark] - 审核备注（可选）
 */
export function auditBooking(id, status, remark = '') {
  return request({
    url: `/api/booking/audit/${id}`,
    method: 'put',
    params: {
      status,
      remark,
    },
  })
}

/**
 * 分页查询预约记录（管理员用）
 * @param {Object} params - 查询参数
 * @param {number} [params.current=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @param {number} [params.userId] - 用户ID筛选
 * @param {number} [params.status] - 状态筛选
 * @param {string} [params.venueName] - 场馆名称搜索
 */
export function getBookingPage(params = {}) {
  return request({
    url: '/api/booking/page',
    method: 'get',
    params: {
      current: params.current || 1,
      size: params.size || 10,
      userId: params.userId || '',
      status: params.status || '',
      venueName: params.venueName || '',
    },
  })
}

/**
 * 查询我的预约记录
 */
export function getMyBookings() {
  return request({
    url: '/api/booking/my',
    method: 'get',
  })
}

/**
 * 查询预约详情
 * @param {number} id - 预约ID
 */
export function getBookingById(id) {
  return request({
    url: `/api/booking/${id}`,
    method: 'get',
  })
}

/**
 * 检查时间冲突
 * @param {Object} params - 查询参数
 * @param {number} params.venueId - 场馆ID
 * @param {string} params.date - 预约日期（格式：YYYY-MM-DD）
 * @param {string} params.startTime - 开始时间（格式：HH:mm）
 * @param {string} params.endTime - 结束时间（格式：HH:mm）
 * @param {number} [params.excludeId] - 排除的预约ID（修改时用）
 */
export function checkTimeConflict(params) {
  return request({
    url: '/api/booking/check-conflict',
    method: 'get',
    params,
  })
}

/**
 * 获取场馆某日期已预约时间段
 * @param {number} venueId - 场馆ID
 * @param {string} date - 日期（格式：YYYY-MM-DD）
 */
export function getBookedTimeSlots(venueId, date) {
  return request({
    url: '/api/booking/booked-slots',
    method: 'get',
    params: {
      venueId,
      date,
    },
  })
}

/**
 * 计算预约费用
 * @param {number} venueId - 场馆ID
 * @param {string} startTime - 开始时间（格式：HH:mm）
 * @param {string} endTime - 结束时间（格式：HH:mm）
 */
export function calculatePrice(venueId, startTime, endTime) {
  return request({
    url: '/api/booking/calculate-price',
    method: 'get',
    params: {
      venueId,
      startTime,
      endTime,
    },
  })
}

// 导出所有接口方法
export default {
  submitBooking,
  updateBooking,
  cancelBooking,
  auditBooking,
  getBookingPage,
  getMyBookings,
  getBookingById,
  checkTimeConflict,
  getBookedTimeSlots,
  calculatePrice,
}
