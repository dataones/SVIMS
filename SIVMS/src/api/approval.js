import request from './request'

// 获取待审批预约
export function getPendingBookings() {
  return request({
    url: '/api/admin/approval/bookings',
    method: 'get'
  })
}

// 获取待审批器材
export function getPendingRentals() {
  return request({
    url: '/api/admin/approval/rentals',
    method: 'get'
  })
}

