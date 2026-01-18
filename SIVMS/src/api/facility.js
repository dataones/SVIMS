import request from './request'

/**
 * ================= 设施故障管理相关接口 =================
 */

/**
 * 申报故障
 * @param {Object} data - 故障申报数据
 * @param {number} data.venueId - 场馆ID
 * @param {string} data.faultType - 故障类型
 * @param {string} data.description - 故障描述
 * @param {string} data.location - 故障位置
 * @param {string} data.urgency - 紧急程度 (LOW/MEDIUM/HIGH)
 * @param {string} data.contactPhone - 联系方式
 * @param {Array} data.images - 故障图片URL列表
 * @param {string} data.expectedTime - 期望修复时间
 * @param {string} data.remark - 备注信息
 */
export function reportFault(data) {
  return request({
    url: '/api/facility/fault/report',
    method: 'post',
    data
  })
}

/**
 * 获取故障列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.status - 故障状态
 * @param {number} params.venueId - 场馆ID
 * @param {string} params.faultType - 故障类型
 */
export function getFaultList(params = {}) {
  return request({
    url: '/api/facility/fault/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      status: params.status,
      venueId: params.venueId,
      faultType: params.faultType
    }
  })
}

/**
 * 获取故障详情
 * @param {number} id - 故障ID
 */
export function getFaultDetail(id) {
  return request({
    url: `/api/facility/fault/${id}`,
    method: 'get'
  })
}

/**
 * 管理员处理故障
 * @param {number} id - 故障ID
 * @param {number} status - 处理状态
 * @param {string} processRemark - 处理备注
 * @param {string} estimatedTime - 预计完成时间
 */
export function processFault(id, status, processRemark, estimatedTime) {
  return request({
    url: `/api/facility/fault/${id}/process`,
    method: 'put',
    params: {
      status,
      processRemark,
      estimatedTime
    }
  })
}

/**
 * 更新故障进度
 * @param {number} id - 故障ID
 * @param {string} progress - 进度描述
 */
export function updateFaultProgress(id, progress) {
  return request({
    url: `/api/facility/fault/${id}/progress`,
    method: 'put',
    params: {
      progress
    }
  })
}

/**
 * 用户取消故障申报
 * @param {number} id - 故障ID
 * @param {string} reason - 取消原因
 */
export function cancelFault(id, reason) {
  return request({
    url: `/api/facility/fault/${id}/cancel`,
    method: 'put',
    params: {
      reason
    }
  })
}

/**
 * 获取我的故障申报
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.status - 故障状态
 */
export function getMyFaults(params = {}) {
  return request({
    url: '/api/facility/fault/my',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      status: params.status
    }
  })
}

/**
 * 获取故障统计
 * @param {Object} params - 查询参数
 * @param {string} params.type - 统计类型 (day/week/month)
 * @param {number} params.venueId - 场馆ID
 */
export function getFaultStatistics(params = {}) {
  return request({
    url: '/api/facility/fault/statistics',
    method: 'get',
    params: {
      type: params.type || 'month',
      venueId: params.venueId
    }
  })
}

/**
 * 获取设施列表
 * @param {Object} params - 查询参数
 * @param {number} params.venueId - 场馆ID
 * @param {string} params.facilityType - 设施类型
 */
export function getFacilityList(params = {}) {
  return request({
    url: '/api/facility/list',
    method: 'get',
    params: {
      venueId: params.venueId,
      facilityType: params.facilityType
    }
  })
}

export default {
  reportFault,
  getFaultList,
  getFaultDetail,
  processFault,
  updateFaultProgress,
  cancelFault,
  getMyFaults,
  getFaultStatistics,
  getFacilityList
}
