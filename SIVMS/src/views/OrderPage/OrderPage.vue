<template>
  <div class="order-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 主要内容 -->
    <div class="order-container">
      <!-- 进度条 -->
      <div class="order-progress">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="选择时间" description="选择预订时间段" />
          <el-step title="确认并提交" description="确认订单信息并提交" />
        </el-steps>
      </div>

      <div class="order-content">
        <!-- 步骤1: 选择时间 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-title">
            <h2><i class="el-icon-time"></i> 选择预订时间</h2>
            <!-- <p class="step-subtitle">请选择您的预订日期和时间段</p> -->
          </div>

          <div class="time-selection">
            <!-- 左侧: 日历 -->
            <div class="calendar-section">
              <div class="calendar-header">
                <h3>选择日期</h3>
                <div class="calendar-nav">
                  <el-button @click="prevMonth" size="small" circle>
                    <i class="el-icon-arrow-left"></i>
                  </el-button>
                  <span class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
                  <el-button @click="nextMonth" size="small" circle>
                    <i class="el-icon-arrow-right"></i>
                  </el-button>
                </div>
              </div>

              <div class="calendar-grid">
                <div class="week-header">
                  <div
                    v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
                    :key="day"
                    class="week-day"
                  >
                    {{ day }}
                  </div>
                </div>

                <div class="calendar-days">
                  <div
                    v-for="day in calendarDays"
                    :key="day.date"
                    class="calendar-day"
                    :class="{
                      'other-month': !day.isCurrentMonth,
                      today: day.isToday,
                      selected: selectedDate === day.date,
                      disabled: day.isDisabled,
                    }"
                    @click="selectDate(day)"
                  >
                    <div class="day-number">{{ day.day }}</div>
                    <div v-if="day.isToday" class="today-label">今天</div>

                    <div v-if="day.isDisabled" class="day-status">不可订</div>
                  </div>
                </div>
              </div>

              <div class="date-info">
                <div class="selected-date-display">
                  <i class="el-icon-date"></i>
                  <span>已选择：{{ formatDate(selectedDate) }}</span>
                </div>
                <div class="date-note">
                  <i class="el-icon-info"></i>
                  <span>可预订未来30天内的场地</span>
                </div>
              </div>
            </div>

            <!-- 右侧: 时间选择 -->
            <div class="time-slots-section">
              <div class="slots-header">
                <h3>选择时间</h3>
                <!-- 去掉时段长度显示与切换按钮 -->
              </div>

              <div class="time-slots">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.id"
                  class="time-slot"
                  :class="{
                    selected: selectedSlots.includes(slot.id),
                    disabled: slot.disabled,
                    peak: slot.isPeak,
                  }"
                  @click="toggleTimeSlot(slot)"
                >
                  <div class="slot-time">
                    <!-- 只展示起始时间 -->
                    <div class="slot-range">{{ slot.startTime }}</div>
                  </div>
                  <div class="slot-info">
                    <span class="slot-price">
                      ¥<span class="price-number">{{ formatMoney(slot.price) }}</span>
                    </span>
                    <div v-if="slot.isPeak" class="peak-badge">高峰</div>

                    <div v-else-if="selectedSlots.includes(slot.id)" class="slot-status selected">
                      <i class="el-icon-check"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="time-selection-info">
                <div class="selected-slots-display">
                  <div v-if="selectedSlots.length > 0" class="slots-list">
                    <span v-for="slotId in selectedSlots" :key="slotId" class="selected-slot">
                      {{ getSlotTime(slotId) }}
                    </span>
                  </div>
                  <div v-else class="no-slots">
                    <i class="el-icon-time"></i>
                    <span>请选择时间</span>
                  </div>
                </div>
                <div class="slots-total">
                  <!-- <span>已选择：{{ selectedSlots.length }}个时间</span> -->
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button @click="cancelBooking">取消</el-button>
            <el-button type="primary" @click="nextStep" :disabled="!canProceed">
              下一步：确认订单
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
        </div>

        <!-- 步骤2: 确认订单 -->
        <div v-else-if="currentStep === 2" class="step-content">
          <div class="step-title">
            <h2><i class="el-icon-document-checked"></i> 确认订单信息</h2>
            <p class="step-subtitle">请核对您的预订信息</p>
          </div>

          <div class="order-details">
            <!-- 左侧: 订单详情 -->
            <div class="order-info-section">
              <div class="info-card">
                <div class="card-header">
                  <h3><i class="el-icon-shopping-cart-full"></i> 订单详情</h3>
                </div>
                <div class="card-content">
                  <div class="detail-item">
                    <div class="detail-label">场馆名称：</div>
                    <div class="detail-value">{{ venueInfo.name }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">场馆地址：</div>
                    <div class="detail-value">{{ venueInfo.address }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">预订日期：</div>
                    <div class="detail-value">{{ formatDate(selectedDate) }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">预订时间：</div>
                    <div class="detail-value time-slots-display">
                      <span v-if="startTime && endTime" class="time-badge">
                        {{ startTime }}-{{ endTime }}
                      </span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">总时长：</div>
                    <div class="detail-value">{{ totalHours }}小时</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">预订人数：</div>
                    <div class="detail-value">
                      <el-input-number
                        v-model="bookingPeople"
                        :min="1"
                        :max="maxPeople"
                        size="small"
                      />
                      <!-- <span class="people-note">（最多{{ maxPeople }}人）</span> -->
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-card">
                <div class="card-header">
                  <h3><i class="el-icon-edit"></i> 备注信息</h3>
                </div>
                <div class="card-content">
                  <el-input
                    v-model="bookingNotes"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入您的特殊需求（如：需要裁判、设备要求等）"
                    maxlength="200"
                    show-word-limit
                  />
                </div>
              </div>
            </div>

            <!-- 右侧: 费用明细 -->
            <div class="order-summary-section">
              <div class="summary-card">
                <div class="card-header">
                  <h3><i class="el-icon-money"></i> 费用明细</h3>
                </div>
                <div class="card-content">
                  <div class="price-details">
                    <div class="price-item">
                      <span class="price-label">场地费用</span>
                      <span class="price-value">¥{{ formatMoney(venuePrice) }}</span>
                    </div>
                    <div class="price-item" v-if="equipmentCost > 0">
                      <span class="price-label">设备租赁</span>
                      <span class="price-value">¥{{ formatMoney(equipmentCost) }}</span>
                    </div>
                    <div class="price-item">
                      <span class="price-label">服务费</span>
                      <span class="price-value">¥{{ formatMoney(serviceFee) }}</span>
                    </div>
                    <div class="price-item discount" v-if="discount > 0">
                      <span class="price-label">
                        <i class="el-icon-discount"></i>
                        优惠折扣
                      </span>
                      <span class="price-value">-¥{{ formatMoney(discount) }}</span>
                    </div>
                  </div>

                  <div class="price-total">
                    <div class="total-item">
                      <span class="total-label">合计金额</span>
                      <span class="total-value">¥{{ formatMoney(totalPrice) }}</span>
                    </div>
                    <div v-if="originalPrice > totalPrice" class="original-price">
                      原价：¥{{ formatMoney(originalPrice) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 用户信息 -->
              <div class="user-info-card">
                <div class="card-header">
                  <h3><i class="el-icon-user"></i> 预订人信息</h3>
                </div>
                <div class="card-content">
                  <div class="user-details">
                    <div class="user-item">
                      <div class="user-label">姓名：</div>
                      <div class="user-value">{{ userInfo.name }}</div>
                    </div>
                    <div class="user-item">
                      <div class="user-label">手机号：</div>
                      <div class="user-value">{{ userInfo.phone }}</div>
                    </div>
                    <div class="user-item">
                      <div class="user-label">会员等级：</div>
                      <div class="user-value">
                        <span class="vip-badge" :class="userInfo.vipLevel">
                          {{ userInfo.vipLevel }}会员
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button @click="prevStep">
              <i class="el-icon-arrow-left"></i>
              上一步
            </el-button>
            <!-- 协议确认 -->
            <div class="agreement-section">
              <el-checkbox v-model="agreeTerms" :disabled="isSubmitting">
                我已阅读并同意
                <el-link type="primary" @click="showTermsDialog = true"> 《预订服务协议》 </el-link>
              </el-checkbox>
            </div>
            <el-button
              type="primary"
              @click="submitOrder"
              :loading="isSubmitting"
              :disabled="!agreeTerms || isSubmitting"
            >
              提交订单
              <i class="el-icon-check"></i>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务协议对话框 -->
    <el-dialog v-model="showTermsDialog" title="预订服务协议" width="600px" append-to-body>
      <div class="terms-dialog">
        <div class="terms-content">
          <h4>预订服务协议</h4>
          <p>1. 用户通过本系统预订场馆，即表示同意本协议的全部条款。</p>
          <p>2. 预订成功后如需修改或取消，请至少在预订开始时间前2小时操作。</p>
          <p>3. 预订费用包含场地使用费，如需其他设备需额外支付。</p>
          <p>4. 因用户原因未能按时到场，费用不予退还。</p>
          <p>5. 如遇特殊情况无法使用，请及时联系客服处理。</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showTermsDialog = false">我已阅读</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import { fetchVenues } from '@/api/venue'
import { getBookedTimeSlots, submitBooking } from '@/api/booking' // 新增 API 导入

export default {
  name: 'OrderPage',

  components: {
    NavBar,
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const isSubmitting = ref(false)
    // 登录状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name || '用户')
    const userAvatar = computed(() => userStore.avatar || '')

    // 步骤管理
    const currentStep = ref(1)

    // 场馆信息（初始不使用硬编码测试数据）
    const venueInfo = ref({
      id: route.query.venueId || null,
      name: '',
      address: '',
      price: 0,
      capacity: 0,
      type: '',
      description: '',
      image: '',
      openTime: '',
      closeTime: '',
      status: 0,
      remark: null,
    })

    // 用户信息（从 store 取，尽量不使用硬编码）
    const userInfo = ref({
      name: userStore.name || '用户',
      phone: userStore.phone || '未绑定',
      vipLevel: userStore.vipLevel || '普通',
      balance: userStore.balance || 0,
    })

    // 步骤1: 时间选择相关
    const selectedDate = ref('')
    // selectedSlots 改为存放 slot.id（slot.id = startTime）
    //const selectedSlots = ref([])
    const startTime = ref(null) // "14:00"
    const endTime = ref(null) // "16:00"
    const selectedSlots = computed(() => {
      if (!startTime.value) return []

      // 只选了开始时间 → 高亮开始时间
      if (startTime.value && !endTime.value) {
        return [startTime.value]
      }

      // 同时选了开始 & 结束
      const slots = expandIntervalToStartTimes(startTime.value, endTime.value)

      // ⭐ 把结束时间本身也加进去（用于高亮）
      slots.push(endTime.value)

      return slots
    })

    // 不再使用全局时长选择，保留变量以防其它逻辑依赖（可删）
    const selectedDuration = ref(2)

    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())

    // 已预约起始时间集合（用于标记 disabled）
    const bookedStartTimes = ref([])

    // 步骤2: 订单详情相关
    const bookingPeople = ref(1)
    const bookingNotes = ref('')
    //
    const selectedCoupon = ref(null)

    // 步骤3: 支付相关
    const selectedPayment = ref(1)
    const agreeTerms = ref(false)
    const isPaying = ref(false)
    const showQrCode = ref(false)

    // 对话框状态
    const showCouponDialog = ref(false)
    const showTermsDialog = ref(false)

    // 数据/状态
    const timeSlots = ref([]) // 生成在加载场馆价格后
    const availableCoupons = ref([])
    const calendarDays = ref([])

    // 工具/分页 （保留，若需）
    const orderExpireTime = computed(() => {
      const now = new Date()
      const expire = new Date(now.getTime() + 30 * 60 * 1000) // 30分钟后
      return expire.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })

    // 生命周期
    onMounted(async () => {
      initData()
      await loadVenue()
      generateCalendar()

      // 页面打开后立即加载该场馆、该日期的已预约时段并标记不可选
      if (venueInfo.value.id && selectedDate.value) {
        try {
          await loadBookedSlotsForVenue(venueInfo.value.id, selectedDate.value)
        } catch (e) {
          console.error('初始加载已预约时段失败', e)
        }
      }
    })

    // 加载场馆详情（从后端获取，兼容批量接口）
    const loadVenue = async () => {
      const vid = route.query.venueId || venueInfo.value.id
      if (!vid) {
        // 若没有场馆 id，不中断页面，但保留默认/空数据
        return
      }

      try {
        const res = await fetchVenues({ pageNum: 1, pageSize: 100, id: vid })
        const list = res?.data?.records || res?.data?.list || []
        let v = list.find((it) => String(it.id) === String(vid))
        // 若后端返回单条数据在 data 中
        if (!v && res?.data && !Array.isArray(res.data)) {
          v = res.data
        }
        if (v) {
          venueInfo.value = {
            id: v.id,
            name: v.name || '',
            address: v.location || v.address || '',
            price: Number(v.price || 0),
            capacity: v.capacity || 0,
            type: v.type || '',
            description: v.description || '',
            image: v.image || '',
            openTime: v.openTime || '',
            closeTime: v.closeTime || '',
            status: typeof v.status !== 'undefined' ? v.status : 0,
            remark: v.remark || null,
          }
        } else {
          ElMessage.warning('未找到指定场馆，显示空白信息')
          // 清空以避免沿用旧数据
          venueInfo.value = {
            id: vid,
            name: '',
            address: '',
            price: 0,
            capacity: 0,
            type: '',
            description: '',
            image: '',
            openTime: '',
            closeTime: '',
            status: 0,
            remark: null,
          }
        }
      } catch (err) {
        console.error('加载场馆详情失败', err)
        ElMessage.error('加载场馆信息失败')
      } finally {
        // 在拿到价格后生成时间片（保证价格用于计算）
        generateTimeSlots()
      }
    }

    // 本地化日期格式（避免 toISOString 导致 UTC 偏移）
    const formatDateString = (date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    // 统一时间格式为 "HH:mm"
    const normalizeTime = (t) => {
      if (!t && t !== 0) return ''
      // 如果是 Date
      if (t instanceof Date) {
        return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      }
      // 字符串，如 "9:0", "09:00:00"
      const s = String(t).trim()
      const parts = s.split(':').map((p) => p.padStart(2, '0'))
      return `${parts[0] || '00'}:${(parts[1] || '00').slice(0, 2)}`
    }

    // 在生成时使用 normalizeTime，保证 "09:00" 形式
    const generateTimeSlots = () => {
      timeSlots.value = []
      const basePrice = Number(venueInfo.value.price || 0)
      const open = venueInfo.value.openTime || '08:00'
      const close = venueInfo.value.closeTime || '22:00'
      const startHour = parseInt(open.split(':')[0], 10)
      const endHour = parseInt(close.split(':')[0], 10)
      for (let h = startHour; h < endHour; h++) {
        const isPeak = h >= 18 && h < 21
        const price = isPeak ? Math.round(basePrice * 1.2) : basePrice
        const slot = {
          id: `${String(h).padStart(2, '0')}:00`,
          startTime: normalizeTime(`${String(h).padStart(2, '0')}:00`),
          endTime: normalizeTime(`${String(h + 1).padStart(2, '0')}:00`),
          price,
          isPeak,
          disabled: bookedStartTimes.value.includes(
            normalizeTime(`${String(h).padStart(2, '0')}:00`),
          ),
        }
        timeSlots.value.push(slot)
      }
    }

    // 按「整点小时」展开区间（和 timeSlots 完全一致）
    const expandIntervalToStartTimes = (start, end) => {
      if (!start || !end) return []

      const startHour = parseInt(start.split(':')[0], 10)
      const endHour = parseInt(end.split(':')[0], 10)

      const result = []
      for (let h = startHour; h < endHour; h++) {
        result.push(`${String(h).padStart(2, '0')}:00`)
      }
      return result
    }

    // 加载指定场馆在选定日期的已预约起始时间并标记
    // 加载指定场馆在选定日期的已预约起始时间并标记
    const loadBookedSlotsForVenue = async (venueId, date) => {
      if (!venueId || !date) {
        bookedStartTimes.value = []
        return
      }
      try {
        const res = await getBookedTimeSlots(venueId, date)

        // ⭐⭐⭐ 核心修正点：取真正的业务数据
        const data = res?.data

        console.log('后端返回的预约数据:', data)

        let slots = []

        if (Array.isArray(data)) {
          data.forEach((item) => {
            // ✅ 情况 1：后端直接返回字符串区间 "14:00-16:00"
            if (typeof item === 'string' && item.includes('-')) {
              const [start, end] = item.split('-')
              slots.push(...expandIntervalToStartTimes(start, end))
            }

            // （可选）情况 2：单个时间点 "14:00"
            else if (typeof item === 'string') {
              slots.push(item)
            }

            // 情况 3：对象区间
            else if (item.startTime && item.endTime) {
              slots.push(...expandIntervalToStartTimes(item.startTime, item.endTime))
            }
          })
        }

        bookedStartTimes.value = Array.from(new Set(slots.map(normalizeTime).filter(Boolean)))
      } catch (err) {
        console.error('加载已预约时段失败', err)
        bookedStartTimes.value = []
      } finally {
        console.log('finally bookedStartTimes:', bookedStartTimes.value)
      }
    }

    // 监听选定日期或场馆变化，刷新已预约时段
    watch(bookedStartTimes, () => {
      generateTimeSlots()
    })

    const initData = () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      selectedDate.value = formatDateString(tomorrow)
      //availableCoupons.value = generateCoupons()
    }

    const generateCalendar = () => {
      const days = []
      const date = new Date(currentYear.value, currentMonth.value, 1)
      const today = new Date()
      const todayStr = formatDateString(today)
      const firstDay = date.getDay()
      const prevMonthLastDate = new Date(currentYear.value, currentMonth.value, 0).getDate()

      for (let i = firstDay - 1; i >= 0; i--) {
        const dayDate = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDate - i)
        days.push({
          date: formatDateString(dayDate),
          day: prevMonthLastDate - i,
          isCurrentMonth: false,
          isToday: false,
          isDisabled: true,
          //price: Math.round((venueInfo.value.price || 0) * (0.8 + Math.random() * 0.4)),
        })
      }

      const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(currentYear.value, currentMonth.value, i)
        const dateStr = formatDateString(dayDate)
        const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
        days.push({
          date: dateStr,
          day: i,
          isCurrentMonth: true,
          isToday: dateStr === todayStr,
          isDisabled: isPast || dayDate.getDay() === 0,
          price: Math.round((venueInfo.value.price || 0) * (0.8 + Math.random() * 0.4)),
        })
      }

      const totalCells = 42
      const nextMonthDays = totalCells - days.length
      for (let i = 1; i <= nextMonthDays; i++) {
        const dayDate = new Date(currentYear.value, currentMonth.value + 1, i)
        days.push({
          date: formatDateString(dayDate),
          day: i,
          isCurrentMonth: false,
          isToday: false,
          isDisabled: true,
          price: Math.round((venueInfo.value.price || 0) * (0.8 + Math.random() * 0.4)),
        })
      }

      calendarDays.value = days
    }

    // 调试：输出日历数据，便于发现为空的情况
    const debugLogCalendar = () => {
      console.log(
        'calendarDays',
        calendarDays.value,
        'selectedDate',
        selectedDate.value,
        'venueInfo',
        venueInfo.value,
      )
    }

    // 当场馆信息或日期变更时，重新生成日历并加载已预约时段
    watch(
      () => [
        venueInfo.value.id,
        venueInfo.value.openTime,
        venueInfo.value.closeTime,
        selectedDate.value,
      ],
      () => {
        // 重新生成日历（保证有场馆信息时能显示）
        generateCalendar()
        debugLogCalendar()
      },
    )

    // 确保 loadVenue 后也会生成日历（如果 loadVenue 内没有调用）
    // 如果 loadVenue 已在 finally 调用 generateTimeSlots，请在那之后也调用 generateCalendar()
    // 示例：在 loadVenue 成功分支最后调用 generateCalendar()
    // ...existing code...
    // 其余交互方法保持原样（略）——保留与 BookingPage 相同的跳转校验
    const selectDate = (day) => {
      if (day.isDisabled) return
      selectedDate.value = day.date

      // 切换日期时重新查询该场馆在该日的已预约时段并刷新 timeSlots 的 disabled 状态
      if (venueInfo.value.id) {
        loadBookedSlotsForVenue(venueInfo.value.id, day.date).catch((err) => {
          console.error('切换日期加载已预约时段失败', err)
        })
      }
    }

    const toggleTimeSlot = (slot) => {
      if (slot.disabled) return

      const time = normalizeTime(slot.startTime)

      // 如果选择的是当前时间段，则取消选择
      if (selectedSlots.value.includes(slot.id)) {
        selectedSlots.value = selectedSlots.value.filter((id) => id !== slot.id)
      } else {
        // 否则添加到选择列表
        selectedSlots.value.push(slot.id)
      }

      // 情况 1：什么都没选 → 设为开始时间
      if (!startTime.value && !endTime.value) {
        startTime.value = time
        return
      }

      // 情况 2：只选了开始时间
      if (startTime.value && !endTime.value) {
        // 👉 再点同一个时间 = 取消
        if (time === startTime.value) {
          startTime.value = null
          return
        }

        // 👉 结束时间必须晚于开始时间
        if (time < startTime.value) {
          ElMessage.warning('结束时间必须晚于开始时间')
          return
        }

        // 👉 校验中间是否包含已预约时间
        const interval = expandIntervalToStartTimes(startTime.value, time)
        const hasDisabled = interval.some((t) => bookedStartTimes.value.includes(t))
        if (hasDisabled) {
          ElMessage.error('所选时间段中包含已被预约的时间')
          return
        }

        endTime.value = time
        return
      }

      // 情况 3：已经选完一轮 → 重新开始
      startTime.value = time
      endTime.value = null
    }

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
      generateCalendar()
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
      generateCalendar()
    }

    const getSlotTime = (slotId) => {
      const slot = timeSlots.value.find((s) => s.id === slotId)
      return slot ? slot.startTime : ''
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[date.getDay()]
      return `${month}月${day}日 星期${weekDay}`
    }

    const nextStep = () => {
      if (currentStep.value === 2) return
      currentStep.value++
    }

    const prevStep = () => {
      if (currentStep.value === 1) return
      currentStep.value--
    }

    const cancelBooking = () => {
      ElMessageBox.confirm('确定要取消预订吗？', '取消预订', {
        confirmButtonText: '确定',
        cancelButtonText: '继续预订',
        type: 'warning',
      }).then(() => {
        router.push('/booking')
      })
    }
    const submitOrder = async () => {
      if (!agreeTerms.value) {
        ElMessage.warning('请先阅读并同意服务协议')
        return
      }

      isSubmitting.value = true
      try {
        const bookingDTO = {
          venueId: String(venueInfo.value.id),
          date: selectedDate.value,
          startTime: startTime.value,
          endTime: endTime.value,
          notes: bookingNotes.value,
          people: bookingPeople.value,
        }

        const res = await submitBooking(bookingDTO)

        if (res?.code === 200) {
          ElMessage.success('预约成功！')
          router.push(`OrderManagement`)
        } else {
          ElMessage.error(res?.msg || '提交失败')
        }
      } catch (err) {
        console.error('提交订单失败:', err)
        ElMessage.error('网络错误，请重试')
      } finally {
        isSubmitting.value = false
      }
    }
    // 计算项（保留）
    const totalHours = computed(() => selectedSlots.value.length - 1)

    const venuePrice = computed(() => {
      if (!startTime.value || !endTime.value) return 0

      const s = parseInt(startTime.value.split(':')[0])
      const e = parseInt(endTime.value.split(':')[0])

      return timeSlots.value
        .filter((slot) => {
          const h = parseInt(slot.startTime.split(':')[0])
          return h >= s && h < e
        })
        .reduce((sum, slot) => sum + slot.price, 0)
    })

    const serviceFee = computed(() => venuePrice.value * 0.1)
    const equipmentCost = computed(() => 0)
    // const discount = computed(() => selectedCoupon.value?.value || 0)
    const totalPrice = computed(() => venuePrice.value + serviceFee.value)
    const originalPrice = computed(() => venuePrice.value + serviceFee.value)
    const maxPeople = computed(() => venueInfo.value.capacity || 50)
    const selectedTimeSlots = computed(() =>
      timeSlots.value.filter((slot) => selectedSlots.value.includes(slot.id)),
    )

    // 金额格式化函数 - 确保显示2位小数
    const formatMoney = (value) => {
      const n = Number(value || 0)
      return Number.isFinite(n) ? n.toFixed(2) : '0.00'
    }
    // 允许进入下一步：必须有场馆、有选择日期且至少选中一个起始时间，并且填写预订人数
    const canProceed = computed(() => {
      return (
        !!venueInfo.value.id &&
        !!selectedDate.value &&
        !!startTime.value &&
        !!endTime.value &&
        bookingPeople.value > 0
      )
    })

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      // 状态
      isLogin,
      userName,
      userAvatar,
      currentStep,
      venueInfo,
      userInfo,
      selectedDate,
      selectedSlots,
      selectedDuration,
      currentMonth,
      currentYear,
      bookingPeople,
      bookingNotes,
      selectedCoupon,
      selectedPayment,
      agreeTerms,
      isPaying,
      showQrCode,
      showCouponDialog,
      showTermsDialog,
      timeSlots,
      availableCoupons,
      calendarDays,
      canProceed,
      // 计算属性
      totalHours,
      venuePrice,
      serviceFee,
      equipmentCost,
      // discount,
      totalPrice,
      originalPrice,
      maxPeople,
      selectedTimeSlots,
      // isPaymentDisabled,
      orderExpireTime,
      // 金额格式化函数
      formatMoney,

      // 方法
      submitOrder,
      selectDate,
      toggleTimeSlot,
      prevMonth,
      nextMonth,
      getSlotTime,
      formatDate,
      nextStep,
      prevStep,
      cancelBooking,
      goToLogin,
      startTime,
      endTime,
    }
  },
}
</script>

<style scoped lang="scss">
.order-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.order-progress {
  margin-bottom: 50px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  :deep(.el-steps) {
    .el-step__head.is-process {
      color: #47daff;
      border-color: #47daff;
    }

    .el-step__title.is-process {
      color: #47daff;
      font-weight: 600;
    }
  }
}

.step-content {
  background: white;
  border-radius: 20px;
  padding: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 25px;
  }
}

.step-title {
  margin-bottom: 30px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 30px;

    i {
      color: #667eea;
    }
  }

  .step-subtitle {
    color: #64748b;
    font-size: 14px;
    margin: 0;
    gap: 30px;
  }
}

// 步骤1: 时间选择
.time-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.calendar-section {
  border-right: 1px solid #e2e8f0;
  padding-right: 30px;

  @media (max-width: 992px) {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 30px;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 15px;

  .current-month {
    font-size: 16px;
    font-weight: 600;
    color: #334155;
    min-width: 120px;
    text-align: center;
  }

  :deep(.el-button) {
    background: #f1f5f9;
    border: none;

    &:hover {
      background: #e2e8f0;
    }

    i {
      font-size: 12px;
    }
  }
}

.calendar-grid {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 360px; /* 固定日历区域最小高度 */
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 15px;

  .week-day {
    text-align: center;
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
    padding: 8px;
  }
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 280px; /* 固定最小高度，确保6行日期 */
}

.calendar-day {
  height: 40px; /* 固定高度替代aspect-ratio */
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.other-month {
    opacity: 0.4;
  }

  &.today {
    background: rgba(102, 126, 234, 0.1);

    .today-label {
      font-size: 10px;
      color: #667eea;
      margin-top: 2px;
    }
  }

  &.selected {
    background: linear-gradient(135deg, rgb(16, 205, 222) 100%);
    color: white;

    .day-number,
    .day-price {
      color: white;
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.4;
    background: #f1f5f9;

    .day-status {
      font-size: 10px;
      color: #94a3b8;
    }
  }

  &:hover:not(.disabled):not(.selected) {
    background: #e2e8f0;
  }

  .day-number {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .day-price {
    font-size: 11px;
    color: #10b981;
    font-weight: 600;
  }
}

.date-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  min-height: 50px; /* 固定最小高度 */

  .selected-date-display {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    min-width: 180px; /* 固定最小宽度 */

    i {
      color: #667eea;
    }
  }

  .date-note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    min-width: 160px; /* 固定最小宽度 */

    i {
      font-size: 14px;
    }
  }
}

.time-slots-section {
  .slots-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
  }
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 15px;

  span {
    font-size: 14px;
    color: #64748b;
  }
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.time-slot {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #cbd5e1;
    background: white;
  }

  &.selected {
    border-color: #47daff;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);

    .slot-time {
      .slot-range {
        color: #1e293b;
      }
    }

    .slot-info {
      .slot-price {
        color: #10b981;
      }
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: #f1f5f9;

    .slot-status {
      color: #94a3b8;
    }
  }

  &.peak {
    .peak-badge {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
  }

  .slot-time {
    .slot-range {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .slot-duration {
      font-size: 12px;
      color: #64748b;
    }
  }

  .slot-info {
    text-align: right;

    .slot-price {
      font-size: 20px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 4px;

      .price-number {
        font-size: 24px;
      }
    }
  }
}

.time-selection-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;

  .selected-slots-display {
    margin-bottom: 15px;

    .slots-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .selected-slot {
        background: white;
        border: 1px solid #667eea;
        color: #667eea;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .no-slots {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;

      i {
        font-size: 16px;
      }
    }
  }

  .slots-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;

    span {
      color: #64748b;
      font-size: 14px;
    }

    .total-hours {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }
  }
}

// 步骤2: 确认订单
.order-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.info-card,
.summary-card,
.user-info-card {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      color: #667eea;
    }
  }
}

.card-content {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    flex: 0 0 100px;
    color: #64748b;
    font-size: 14px;
    padding-top: 4px;
  }

  .detail-value {
    flex: 1;
    color: #1e293b;
    font-size: 14px;

    .time-slots-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .time-badge {
        background: white;
        border: 1px solid #cbd5e1;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 13px;
      }
    }

    .people-note {
      margin-left: 10px;
      color: #64748b;
      font-size: 12px;
    }
  }
}

.price-details {
  margin-bottom: 20px;

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #e2e8f0;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .price-label {
      color: #64748b;
      font-size: 14px;
      min-width: 80px;
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .price-value {
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
      text-align: right;
      min-width: 100px;
      flex: 1;
    }

    &.discount {
      .price-label {
        color: #10b981;
      }

      .price-value {
        color: #10b981;
      }
    }
  }
}

.price-total {
  background: white;
  border-radius: 8px;
  padding: 20px;

  .total-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .total-label {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      flex: 0 0 auto;
    }

    .total-value {
      font-size: 28px;
      font-weight: 700;
      color: #c3c000;
      text-align: right;
      min-width: 120px;
      flex: 1;
    }
  }

  .original-price {
    font-size: 14px;
    color: #999;
    text-align: right;
    margin-top: 8px;
  }
}

.user-details {
  .user-item {
    display: flex;
    margin-bottom: 15px;

    .user-label {
      flex: 0 0 80px;
      color: #64748b;
      font-size: 14px;
      align-self: flex-start;
    }

    .user-value {
      flex: 1;
      color: #1e293b;
      font-size: 14px;
      text-align: left;
      align-self: flex-start;
    }
  }

  .vip-badge {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;

    &.黄金 {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    &.白金 {
      background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    }

    &.钻石 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
}

// 步骤3: 支付
.payment-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.payment-methods {
  .methods-card {
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
  }
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.el-radio) {
    margin: 0;
  }
}

.payment-option {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
  }

  :deep(.el-radio__input) {
    display: flex;
    align-items: center;
  }

  :deep(.el-radio__input.is-checked + .el-radio__label) {
    .option-content {
      .option-icon {
        &.wechat {
          background: #07c160;
        }
        &.alipay {
          background: #1677ff;
        }
        &.wallet {
          background: #667eea;
        }
        &.card {
          background: #10b981;
        }
      }
    }
  }
}

.option-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  i {
    font-size: 24px;
    color: white;
  }

  &.wechat {
    background: #07c160;
  }
  &.alipay {
    background: #1677ff;
  }
  &.wallet {
    background: #667eea;
  }
  &.card {
    background: #10b981;
  }
}

.option-info {
  flex: 1;

  .option-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .option-desc {
    font-size: 14px;
    color: #64748b;

    .balance-warning {
      color: #ef4444;
      font-size: 12px;
    }
  }
}

.payment-summary {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;

  .summary-header {
    background: white;
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
  }

  .summary-content {
    padding: 20px;

    .amount-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .amount-label {
        font-size: 16px;
        color: #64748b;
      }

      .amount-value {
        font-size: 32px;
        font-weight: 700;
        color: #667eea;
      }
    }

    .discount-info {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .order-expire {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef4444;
      font-size: 14px;

      i {
        font-size: 16px;
      }
    }
  }
}

.order-confirm {
  .confirm-card {
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
  }
}

.order-summary-compact {
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    &.total {
      .total-amount {
        font-size: 24px;
        font-weight: 700;
        color: #667eea;
      }
    }

    span:first-child {
      color: #64748b;
      font-size: 14px;
    }

    span:last-child {
      color: #1e293b;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.payment-actions {
  .pay-button {
    width: 100%;
    height: 56px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      background: #94a3b8;
    }
  }

  .payment-agreement {
    margin-bottom: 15px;
    text-align: center;

    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: 14px;
        color: #64748b;
      }
    }
  }

  .payment-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #64748b;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }
}

.qr-code-section {
  .qr-code-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #e2e8f0;
  }
}

.qr-header {
  background: #f8fafc;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.qr-content {
  padding: 30px;
  text-align: center;

  .qr-code-placeholder {
    margin-bottom: 20px;
  }
}

.qr-code-simulated {
  width: 200px;
  height: 200px;
  margin: 0 auto 15px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '支付二维码';
    color: #94a3b8;
    font-size: 14px;
  }
}

.qr-amount {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.qr-tips {
  text-align: center;

  p {
    color: #64748b;
    font-size: 14px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    i {
      font-size: 16px;
    }
  }
}

// 优惠券对话框
.coupon-dialog {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;

  .no-coupons {
    text-align: center;
    padding: 40px 20px;

    i {
      font-size: 48px;
      color: #cbd5e1;
      margin-bottom: 20px;
      display: block;
    }

    p {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }
  }
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  display: flex;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
  }

  &.selected {
    border-color: #667eea;
  }

  .coupon-left {
    flex: 0 0 120px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px 0 0 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .coupon-value {
      margin-bottom: 5px;

      .value-number {
        font-size: 28px;
        font-weight: 700;
        display: block;
        line-height: 1;
      }

      .value-type {
        font-size: 12px;
        opacity: 0.9;
      }
    }

    .coupon-condition {
      font-size: 12px;
      opacity: 0.8;
    }
  }

  .coupon-right {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .coupon-name {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .coupon-expire {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .coupon-tags {
      display: flex;
      gap: 8px;

      .coupon-tag {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
    }
  }
}

// 服务协议对话框
.terms-dialog {
  .terms-content {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }

    p {
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 步骤操作按钮
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;

  :deep(.el-button) {
    padding: 12px 30px;
    font-size: 16px;

    i {
      margin: 0 5px;
    }
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .order-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .order-progress,
  .step-content,
  .info-card,
  .summary-card,
  .user-info-card,
  .methods-card,
  .confirm-card,
  .payment-summary,
  .qr-code-card {
    background: #1e293b;
    border-color: #334155;
  }

  .card-header {
    background: #0f172a;
    border-color: #334155;
  }

  .price-total,
  .selected-coupon,
  .no-coupon,
  .payment-option,
  .coupon-item {
    background: #0f172a;
    border-color: #334155;
  }

  .coupon-item .coupon-right {
    background: #1e293b;
  }

  .calendar-grid,
  .time-selection-info,
  .time-slot:not(.selected),
  .qr-code-simulated {
    background: #0f172a;
  }

  .calendar-day {
    &:hover:not(.disabled):not(.selected) {
      background: #334155;
    }

    &.disabled {
      background: #1e293b;
    }
  }

  h2,
  h3,
  h4,
  .step-title h2,
  .calendar-header h3,
  .slots-header h3,
  .card-header h3,
  .summary-header h4,
  .qr-header h4,
  .detail-value,
  .user-value,
  .option-title,
  .amount-value,
  .summary-item span:last-child,
  .qr-amount {
    color: #f1f5f9;
  }

  .step-subtitle,
  .date-note,
  .slot-duration,
  .slot-status,
  .detail-label,
  .price-label,
  .coupon-desc,
  .user-label,
  .option-desc,
  .order-expire,
  .payment-tips,
  .qr-tips p,
  .coupon-expire {
    color: #94a3b8;
  }

  .calendar-nav .current-month,
  .selected-date-display,
  .slot-range,
  .total-label,
  .coupon-name,
  .amount-label {
    color: #cbd5e1;
  }
}
</style>
