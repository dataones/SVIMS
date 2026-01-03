import request from '@/api/request'

/**
 * ================= 场馆相关接口 =================
 */

/**
 * 获取场馆列表（支持分页和搜索）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @param {string} params.type - 场馆类型筛选
 * @param {string} params.name - 场馆名称搜索
 * @param {number} params.status - 状态筛选（0-禁用，1-正常）
 * @param {string} params.sortField - 排序字段：createTime, price, name
 * @param {string} params.sortOrder - 排序方式：asc, desc
 */
export function fetchVenues(params = {}) {
  return request({
    url: '/api/venue/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      type: params.type || '',
      name: params.name || '',
      status: params.status ?? '', // 普通用户不传status，只查正常场馆
      sortField: params.sortField || '',
      sortOrder: params.sortOrder || '',
    },
  })
}

/**
 * 获取场馆详情（用户查看详情）- 公共接口
 * @param {number} id - 场馆ID
 */
export function fetchVenueDetail(id) {
  return request({
    url: `/api/venue/${id}`,
    method: 'get',
  })
}

/**
 * 获取场馆详情（管理员查看详情）
 * @param {number} id - 场馆ID
 */
export function fetchVenueDetailForAdmin(id) {
  return request({
    url: `/api/venue/admin/${id}`,
    method: 'get',
  })
}

/**
 * 获取推荐场馆
 * @param {number} limit - 返回数量，默认4
 */
export function fetchRecommendedVenues(limit = 4) {
  return request({
    url: '/api/venue/recommended',
    method: 'get',
    params: { limit },
  })
}

/**
 * 获取热门场馆（按预订量）
 * @param {number} limit - 返回数量，默认6
 */
export function fetchPopularVenues(limit = 6) {
  return request({
    url: '/api/venue/popular',
    method: 'get',
    params: { limit },
  })
}

/**
 * 搜索场馆（简化搜索）
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回数量，默认8
 */
export function searchVenues(keyword, limit = 8) {
  return request({
    url: '/api/venue/search',
    method: 'get',
    params: { keyword, limit },
  })
}

/**
 * ================= 管理员接口 =================
 */

/**
 * 管理员添加场馆
 * @param {Object} data - 场馆数据
 */
export function addVenue(data) {
  return request({
    url: '/api/venue/admin',
    method: 'post',
    data,
  })
}

/**
 * 管理员编辑场馆
 * @param {Object} data - 场馆数据
 */
export function updateVenue(data) {
  return request({
    url: '/api/venue/admin',
    method: 'put',
    data,
  })
}

/**
 * 管理员删除场馆
 * @param {number} id - 场馆ID
 */
export function deleteVenue(id) {
  return request({
    url: `/api/venue/admin/${id}`,
    method: 'delete',
  })
}

/**
 * 批量更新场馆状态
 * @param {Array} ids - 场馆ID数组
 * @param {number} status - 状态：0-禁用，1-启用
 */
export function batchUpdateVenueStatus(ids, status) {
  return request({
    url: '/api/venue/admin/batch-status',
    method: 'put',
    data: { ids, status },
  })
}

/**
 * ================= 场馆类型字典 =================
 */

/**
 * 获取场馆类型列表
 */
export function fetchVenueTypes() {
  return request({
    url: '/api/dict/venue/types',
    method: 'get',
  })
}

/**
 * 获取场馆设施标签列表
 */
export function fetchVenueFacilities() {
  return request({
    url: '/api/dict/venue/facilities',
    method: 'get',
  })
}

/**
 * ================= 场馆预订相关 =================
 */

/**
 * 查询可预订时间段
 * @param {number} venueId - 场馆ID
 * @param {string} date - 预订日期，格式：YYYY-MM-DD
 */
export function fetchAvailableTimeSlots(venueId, date) {
  return request({
    url: '/api/booking/available-slots',
    method: 'get',
    params: { venueId, date },
  })
}

/**
 * 检查场馆是否可预订
 * @param {Object} params
 * @param {number} params.venueId - 场馆ID
 * @param {string} params.date - 预订日期
 * @param {string} params.timeSlot - 时间段
 */
export function checkBookingAvailability(params) {
  return request({
    url: '/api/booking/check',
    method: 'get',
    params,
  })
}

/**
 * 创建预订
 * @param {Object} data - 预订数据
 * @param {number} data.venueId - 场馆ID
 * @param {string} data.date - 预订日期
 * @param {string} data.timeSlot - 时间段
 * @param {number} data.duration - 时长（小时）
 * @param {string} data.remark - 备注
 */
export function createBooking(data) {
  return request({
    url: '/api/booking/create',
    method: 'post',
    data,
  })
}

/**
 * 取消预订
 * @param {number} bookingId - 预订ID
 * @param {string} reason - 取消原因
 */
export function cancelBooking(bookingId, reason = '') {
  return request({
    url: `/api/booking/cancel/${bookingId}`,
    method: 'put',
    data: { reason },
  })
}

/**
 * ================= 评论相关 =================
 */

/**
 * 获取场馆评论
 * @param {number} venueId - 场馆ID
 * @param {Object} params - 分页参数
 */
export function fetchVenueReviews(venueId, params = {}) {
  return request({
    url: `/api/review/venue/${venueId}`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

/**
 * 发表评论
 * @param {Object} data - 评论数据
 * @param {number} data.venueId - 场馆ID
 * @param {number} data.rating - 评分（1-5）
 * @param {string} data.content - 评论内容
 */
export function createReview(data) {
  return request({
    url: '/api/review/create',
    method: 'post',
    data,
  })
}

/**
 * 删除评论
 * @param {number} reviewId - 评论ID
 */
export function deleteReview(reviewId) {
  return request({
    url: `/api/review/${reviewId}`,
    method: 'delete',
  })
}

/**
 * ================= 收藏相关 =================
 */

/**
 * 收藏场馆
 * @param {number} venueId - 场馆ID
 */
export function addFavorite(venueId) {
  return request({
    url: '/api/favorite/add',
    method: 'post',
    data: { venueId },
  })
}

/**
 * 取消收藏
 * @param {number} venueId - 场馆ID
 */
export function removeFavorite(venueId) {
  return request({
    url: `/api/favorite/remove/${venueId}`,
    method: 'delete',
  })
}

/**
 * 获取收藏列表
 * @param {Object} params - 分页参数
 */
export function fetchFavorites(params = {}) {
  return request({
    url: '/api/favorite/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

/**
 * 检查是否已收藏
 * @param {number} venueId - 场馆ID
 */
export function checkFavorite(venueId) {
  return request({
    url: `/api/favorite/check/${venueId}`,
    method: 'get',
  })
}

/**
 * ================= 模拟数据 =================
 */

// 模拟场馆类型数据
export const mockVenueTypes = [
  '篮球馆',
  '羽毛球馆',
  '游泳馆',
  '健身房',
  '乒乓球馆',
  '网球馆',
  '足球场',
  '排球馆',
  '台球厅',
  '武术馆',
  '瑜伽馆',
  '攀岩馆',
  '滑冰场',
  '武术道场',
  '舞蹈室',
  '击剑馆',
]

// 模拟场馆设施标签
export const mockFacilities = [
  '空调',
  '淋浴',
  '停车场',
  'WiFi',
  '更衣室',
  '休息区',
  '自动售货机',
  '储物柜',
  '饮水机',
  '充电宝',
  '急救箱',
  '专业器材',
  '教练指导',
  '团课教室',
  '私教区',
  '有氧区',
  '力量区',
]

// 模拟时间段
export const mockTimeSlots = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
  '22:00-24:00',
]

// 模拟场馆数据
export const mockVenues = [
  {
    id: 1,
    name: '世纪篮球馆',
    type: '篮球馆',
    address: '北京市朝阳区东四环北路88号',
    price: 150.0,
    originalPrice: 180.0,
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519861531473-920034658307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description:
      '专业室内篮球场馆，配备标准比赛场地和先进照明系统。场馆占地2000平方米，拥有2个标准比赛场地和4个训练场地。',
    status: 1,
    capacity: 200,
    facilities: '空调、淋浴、停车场、WiFi、更衣室、休息区',
    openHours: '08:00-22:00',
    contactPhone: '010-12345678',
    rating: 4.8,
    reviewCount: 128,
    bookingCount: 356,
    latitude: 39.9042,
    longitude: 116.4074,
    createTime: '2023-01-15 10:30:00',
    updateTime: '2023-06-20 14:20:00',
    tags: ['专业场地', '设备齐全', '交通便利'],
  },
  {
    id: 2,
    name: '羽林羽毛球馆',
    type: '羽毛球馆',
    address: '上海市浦东新区世纪大道123号',
    price: 80.0,
    image:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description:
      '专业羽毛球训练基地，拥有20片标准场地。采用专业羽毛球地板和照明系统，提供专业教练指导服务。',
    status: 1,
    capacity: 120,
    facilities: '空调、更衣室、商店、训练指导、饮水机',
    openHours: '09:00-21:00',
    contactPhone: '021-87654321',
    rating: 4.6,
    reviewCount: 89,
    bookingCount: 245,
    latitude: 31.2304,
    longitude: 121.4737,
    createTime: '2023-02-10 09:15:00',
    updateTime: '2023-07-15 16:45:00',
    tags: ['专业训练', '教练指导', '设备维护良好'],
  },
  {
    id: 3,
    name: '恒温游泳健身中心',
    type: '游泳馆',
    address: '广州市天河区体育西路456号',
    price: 200.0,
    originalPrice: 250.0,
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description:
      '国际标准游泳池，配备专业救生员和教练团队。全年恒温28°C，水质达到国际标准，适合各年龄段人群。',
    status: 1,
    capacity: 100,
    facilities: '恒温池、淋浴、桑拿、救生员、教练指导、储物柜',
    openHours: '06:30-22:00',
    contactPhone: '020-34567890',
    rating: 4.9,
    reviewCount: 156,
    bookingCount: 412,
    latitude: 23.1291,
    longitude: 113.2644,
    createTime: '2023-03-05 14:20:00',
    updateTime: '2023-08-10 11:30:00',
    tags: ['恒温泳池', '专业救生', '水质优良'],
  },
  {
    id: 4,
    name: '力健高端健身会所',
    type: '健身房',
    address: '深圳市南山区科技园789号',
    price: 120.0,
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: '高端健身会所，全套进口健身设备，专业私教团队。提供个性化训练计划和营养指导服务。',
    status: 1,
    capacity: 150,
    facilities: '器械区、团操室、私教、营养指导、桑拿、停车场',
    openHours: '06:00-23:00',
    contactPhone: '0755-98765432',
    rating: 4.7,
    reviewCount: 203,
    bookingCount: 521,
    latitude: 22.5431,
    longitude: 114.0579,
    createTime: '2023-04-12 16:45:00',
    updateTime: '2023-09-05 09:15:00',
    tags: ['高端设备', '专业私教', '环境优美'],
  },
]

// 模拟评论数据
export const mockReviews = [
  {
    id: 1,
    userId: 101,
    userName: '张先生',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.5,
    content: '场馆非常专业，设施齐全，工作人员态度很好，会再次光顾。',
    images: [],
    createTime: '2023-10-15 14:30:00',
    venueId: 1,
    venueName: '世纪篮球馆',
  },
  {
    id: 2,
    userId: 102,
    userName: '李女士',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5.0,
    content: '环境干净整洁，场地宽敞，非常适合团队活动，强烈推荐！',
    images: [
      'https://images.unsplash.com/photo-1519861531473-920034658307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    ],
    createTime: '2023-10-10 10:20:00',
    venueId: 1,
    venueName: '世纪篮球馆',
  },
]

// 模拟预订数据
export const mockBookings = [
  {
    id: 1,
    venueId: 1,
    venueName: '世纪篮球馆',
    venueImage:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2023-11-20',
    timeSlot: '14:00-16:00',
    duration: 2,
    totalPrice: 300.0,
    status: 1, // 1-已预订，2-已使用，3-已取消
    createTime: '2023-11-18 10:30:00',
    bookingCode: 'BK202311180001',
  },
]

/**
 * ================= 工具函数 =================
 */

/**
 * 格式化价格显示
 * @param {number} price - 价格
 * @param {boolean} showUnit - 是否显示单位
 */
export function formatPrice(price, showUnit = true) {
  const formatted = Number(price).toFixed(2)
  return showUnit ? `¥${formatted}` : formatted
}

/**
 * 计算折扣率
 * @param {number} originalPrice - 原价
 * @param {number} currentPrice - 现价
 */
export function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * 格式化时间显示
 * @param {string} timeStr - 时间字符串
 */
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 获取场馆状态文本
 * @param {number} status - 状态值
 */
export function getVenueStatusText(status) {
  const statusMap = {
    0: '已关闭',
    1: '营业中',
    2: '维护中',
    3: '已满员',
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取预订状态文本
 * @param {number} status - 状态值
 */
export function getBookingStatusText(status) {
  const statusMap = {
    0: '待支付',
    1: '已预订',
    2: '已使用',
    3: '已取消',
    4: '已过期',
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取状态颜色
 * @param {number} status - 状态值
 */
export function getStatusColor(status) {
  const colorMap = {
    0: '#dc3545', // 红色
    1: '#28a745', // 绿色
    2: '#ffc107', // 黄色
    3: '#6c757d', // 灰色
    4: '#6c757d', // 灰色
  }
  return colorMap[status] || '#6c757d'
}

/**
 * 生成时间段选项
 * @param {string} startTime - 开始时间，格式：HH:MM
 * @param {string} endTime - 结束时间，格式：HH:MM
 * @param {number} interval - 间隔（小时）
 */
export function generateTimeSlots(startTime = '08:00', endTime = '22:00', interval = 2) {
  const slots = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  let currentHour = startHour
  let currentMinute = startMinute

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const start = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

    let nextHour = currentHour + interval
    let nextMinute = currentMinute

    if (nextHour >= endHour && (nextHour > endHour || nextMinute > endMinute)) {
      nextHour = endHour
      nextMinute = endMinute
    }

    const end = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
    slots.push(`${start}-${end}`)

    currentHour = nextHour
    currentMinute = nextMinute
  }

  return slots
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 */
export function debounce(func, delay = 500) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 */
export function throttle(func, wait = 1000) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

export default {
  fetchVenues,
  fetchVenueDetail,
  fetchVenueDetailForAdmin,
  fetchRecommendedVenues,
  fetchPopularVenues,
  searchVenues,
  addVenue,
  updateVenue,
  deleteVenue,
  batchUpdateVenueStatus,
  fetchVenueTypes,
  fetchVenueFacilities,
  fetchAvailableTimeSlots,
  checkBookingAvailability,
  createBooking,
  cancelBooking,
  fetchVenueReviews,
  createReview,
  deleteReview,
  addFavorite,
  removeFavorite,
  fetchFavorites,
  checkFavorite,

  // 模拟数据
  mockVenueTypes,
  mockFacilities,
  mockTimeSlots,
  mockVenues,
  mockReviews,
  mockBookings,

  // 工具函数
  formatPrice,
  calculateDiscount,
  formatTime,
  getVenueStatusText,
  getBookingStatusText,
  getStatusColor,
  generateTimeSlots,
  debounce,
  throttle,
}
