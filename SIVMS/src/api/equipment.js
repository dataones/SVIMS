import request from '@/api/request' // 确保这里路径正确，如果是同级目录也可以写 './request'

/**
 * ================= 器材档案列表 (核心修复点) =================
 * 对应 EquipmentManage.vue 中的 fetchEquipments 调用
 */
export function fetchEquipments(params = {}) {
  return request({
    url: '/api/equipment/list', // 对应后端的 EquipmentController
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      name: params.name || '',
      // 使用 ?? 确保 0 (下架) 能正常传递，而不是变成空字符串
      status: params.status ?? '',
    },
  })
}

/**
 * ================= 用户端租赁接口 =================
 */

// 用户提交借用申请
export function applyRental(equipmentId, count) {
  return request({
    url: '/api/equipment-rentals',
    method: 'post',
    params: {
      equipmentId,
      count,
    },
  })
}

// 获取我的借用记录
export function getMyRentals() {
  return request({
    url: '/api/equipment-rentals/my',
    method: 'get',
  })
}

// 用户归还器材
export function returnEquipment(rentalId) {
  return request({
    url: `/api/equipment-rentals/${rentalId}/return`,
    method: 'put',
  })
}

/**
 * ================= 管理员租赁审核接口 =================
 */

// 获取所有借用记录（管理员）
export function getAllRentals() {
  return request({
    url: '/api/admin/equipment-rentals',
    method: 'get',
  })
}

// 管理员审核通过
export function approveRental(id) {
  return request({
    url: `/api/admin/equipment-rentals/${id}/approve`,
    method: 'put',
  })
}

// 管理员驳回
export function rejectRental(id) {
  return request({
    url: `/api/admin/equipment-rentals/${id}/reject`,
    method: 'put',
  })
}

/**
 * ================= 管理员器材档案操作接口 =================
 */

// 2. 新增器材 (管理员)
export function addEquipment(data) {
  return request({
    url: '/api/equipment/admin',
    method: 'post',
    data,
  })
}

// 3. 修改器材 / 上下架 (管理员)
export function updateEquipment(data) {
  return request({
    url: '/api/equipment/admin',
    method: 'put',
    data,
  })
}

// 4. 删除器材 (管理员)
export function deleteEquipment(id) {
  return request({
    url: `/api/equipment/admin/${id}`,
    method: 'delete',
  })
}

// 导出默认对象 (为了兼容性，可选)
export default {
  fetchEquipments,
  applyRental,
  getMyRentals,
  returnEquipment,
  getAllRentals,
  approveRental,
  rejectRental,
  addEquipment,
  updateEquipment,
  deleteEquipment,
}
