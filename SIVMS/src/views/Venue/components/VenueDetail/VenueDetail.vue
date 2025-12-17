<template>
  <div class="venue-detail-page">
    <!-- 导航栏 -->
    <nav-bar />

    <div class="detail-container" v-if="!loading">
      <!-- 返回按钮 -->
      <div class="back-section">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          返回列表
        </button>
      </div>

      <!-- 场馆基本信息 -->
      <div class="venue-basic">
        <div class="venue-gallery">
          <div class="main-image" :style="{ backgroundImage: `url(${venue.image || defaultImage})` }">
            <div class="image-overlay"></div>
            <div class="venue-status" :class="getStatusClass(venue.status)">
              {{ getStatusText(venue.status) }}
            </div>
          </div>
          <div class="image-thumbs" v-if="venue.images && venue.images.length > 0">
            <div
              v-for="(img, index) in venue.images"
              :key="index"
              class="thumb"
              :class="{ active: activeImageIndex === index }"
              :style="{ backgroundImage: `url(${img})` }"
              @click="activeImageIndex = index"
            ></div>
          </div>
        </div>

        <div class="venue-info">
          <div class="info-header">
            <div class="venue-type-tag">{{ venue.type }}</div>
            <h1 class="venue-name">{{ venue.name }}</h1>
            <div class="venue-meta">
              <span class="meta-item">
                <span class="meta-icon">⭐</span>
                评分：{{ venue.rating || '暂无' }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">👥</span>
                容量：{{ venue.capacity || '未知' }}人
              </span>
            </div>
          </div>

          <div class="price-section">
            <div class="current-price">
              <span class="price-label">参考价格：</span>
              <span class="price-value">¥{{ venue.price || 0 }}</span>
              <span class="price-unit">/小时</span>
            </div>
            <div class="original-price" v-if="venue.originalPrice">
              原价：¥{{ venue.originalPrice }}
            </div>
          </div>

          <div class="venue-address">
            <span class="address-icon">📍</span>
            <span class="address-text">{{ venue.address }}</span>
            <button class="address-btn" @click="showMap">
              查看地图
            </button>
          </div>

          <div class="venue-desc">
            <h3>场馆介绍</h3>
            <p>{{ venue.description || '暂无详细介绍' }}</p>
          </div>

          <div class="venue-features">
            <h3>设施服务</h3>
            <div class="features-grid">
              <div v-for="feature in venueFeatures" :key="feature" class="feature-item">
                <span class="feature-icon">{{ getFeatureIcon(feature) }}</span>
                <span class="feature-text">{{ feature }}</span>
              </div>
            </div>
          </div>

          <div class="venue-contact">
            <h3>联系方式</h3>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span class="contact-text">{{ venue.contactPhone || '暂无电话' }}</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">🕒</span>
                <span class="contact-text">营业时间：{{ venue.openHours || '暂无信息' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 场馆评论 -->
      <div class="venue-reviews" v-if="reviews.length > 0">
        <h2 class="section-title">用户评价</h2>
        <div class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="review-user">
                <div class="user-avatar">{{ review.userName?.charAt(0) || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ review.userName || '匿名用户' }}</div>
                  <div class="review-time">{{ formatTime(review.createTime) }}</div>
                </div>
              </div>
              <div class="review-rating">
                <span class="stars">★★★★★</span>
                <span class="rating-value">{{ review.rating }}</span>
              </div>
            </div>
            <div class="review-content">
              {{ review.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 预订区域 -->
      <div class="booking-section">
        <div class="booking-card">
          <h3 class="booking-title">立即预订</h3>
          <div class="booking-form">
            <div class="form-group">
              <label class="form-label">选择日期</label>
              <input
                v-model="bookingDate"
                type="date"
                class="form-input"
                :min="today"
              />
            </div>

            <div class="form-group">
              <label class="form-label">选择时间</label>
              <div class="time-slots">
                <button
                  v-for="timeSlot in timeSlots"
                  :key="timeSlot"
                  class="time-slot"
                  :class="{
                    selected: selectedTime === timeSlot,
                    disabled: isTimeSlotDisabled(timeSlot)
                  }"
                  @click="selectTimeSlot(timeSlot)"
                >
                  {{ timeSlot }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">预订时长</label>
              <div class="duration-control">
                <button
                  class="duration-btn"
                  @click="decreaseDuration"
                  :disabled="duration <= 1"
                >
                  -
                </button>
                <span class="duration-value">{{ duration }} 小时</span>
                <button
                  class="duration-btn"
                  @click="increaseDuration"
                  :disabled="duration >= maxDuration"
                >
                  +
                </button>
              </div>
            </div>

            <div class="price-summary">
              <div class="summary-row">
                <span>单价：</span>
                <span>¥{{ venue.price }}</span>
              </div>
              <div class="summary-row">
                <span>时长：</span>
                <span>{{ duration }} 小时</span>
              </div>
              <div class="summary-row total">
                <span>合计：</span>
                <span class="total-price">¥{{ totalPrice }}</span>
              </div>
            </div>

            <button
              class="book-btn"
              @click="handleBooking"
              :disabled="!canBook"
            >
              {{ bookingButtonText }}
            </button>

            <p class="booking-tips">
              * 预订成功后，请按时到场使用
              <br>* 如需取消预订，请提前2小时联系客服
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 地图模态框 -->
    <div v-if="showMapModal" class="map-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>场馆位置</h3>
          <button class="close-btn" @click="showMapModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- 这里可以集成真实的地图组件，如百度地图、高德地图 -->
          <div class="map-placeholder">
            <div class="map-icon">🗺️</div>
            <p>地图显示：{{ venue.address }}</p>
            <p>在实际项目中，这里会集成地图API</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchVenueDetail, bookVenue } from './api/venueApi.js'

export default {
  name: 'VenueDetail',

  data() {
    return {
      venue: {},
      loading: true,
      activeImageIndex: 0,
      reviews: [],
      bookingDate: '',
      selectedTime: '',
      duration: 2,
      maxDuration: 8,
      showMapModal: false,
      timeSlots: [
        '08:00-10:00',
        '10:00-12:00',
        '12:00-14:00',
        '14:00-16:00',
        '16:00-18:00',
        '18:00-20:00',
        '20:00-22:00'
      ],
      defaultImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  },

  computed: {
    today() {
      return new Date().toISOString().split('T')[0]
    },

    totalPrice() {
      return (this.venue.price || 0) * this.duration
    },

    canBook() {
      return this.bookingDate && this.selectedTime && this.venue.status === 1
    },

    bookingButtonText() {
      if (this.venue.status !== 1) return '场馆暂未开放'
      if (!this.bookingDate) return '请选择日期'
      if (!this.selectedTime) return '请选择时间'
      return `立即预订 (¥${this.totalPrice})`
    },

    venueFeatures() {
      if (!this.venue.facilities) return []
      return this.venue.facilities.split(/[、,，]/).map(f => f.trim()).filter(f => f)
    }
  },

  mounted() {
    this.fetchVenueDetail()
    // 设置默认预订日期为明天
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    this.bookingDate = tomorrow.toISOString().split('T')[0]
  },

  methods: {
    async fetchVenueDetail() {
      this.loading = true
      try {
        const venueId = this.$route.params.id
        const response = await fetchVenueDetail(venueId)
        this.venue = response.data

        // 模拟评论数据（实际项目从API获取）
        this.reviews = [
          {
            id: 1,
            userName: '张先生',
            rating: 4.5,
            content: '场馆非常专业，设施齐全，工作人员态度很好，会再次光顾。',
            createTime: '2023-10-15 14:30:00'
          },
          {
            id: 2,
            userName: '李女士',
            rating: 5,
            content: '环境干净整洁，场地宽敞，非常适合团队活动，强烈推荐！',
            createTime: '2023-10-10 10:20:00'
          }
        ]
      } catch (error) {
        console.error('获取场馆详情失败:', error)
        this.$message.error('获取场馆详情失败')

        // 开发环境使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          this.venue = {
            id: this.$route.params.id,
            name: '世纪篮球馆',
            type: '篮球馆',
            address: '北京市朝阳区东四环北路88号',
            price: 150,
            rating: 4.8,
            image: this.defaultImage,
            description: '专业室内篮球场馆，配备标准比赛场地和先进照明系统。场馆占地2000平方米，拥有2个标准比赛场地和4个训练场地。所有场地均采用专业篮球地板和照明系统，适合比赛和训练使用。',
            status: 1,
            capacity: 200,
            facilities: '空调、淋浴、停车场、WiFi、更衣室、休息区、自动售货机',
            openHours: '08:00-22:00',
            contactPhone: '010-12345678',
            createTime: '2023-01-15 10:30:00',
            updateTime: '2023-06-20 14:20:00'
          }
        }
      } finally {
        this.loading = false
      }
    },

    getStatusClass(status) {
      switch (status) {
        case 1: return 'open'
        case 0: return 'closed'
        default: return 'unknown'
      }
    },

    getStatusText(status) {
      switch (status) {
        case 1: return '营业中'
        case 0: return '已关闭'
        default: return '状态未知'
      }
    },

    getFeatureIcon(feature) {
      const iconMap = {
        '空调': '❄️',
        '淋浴': '🚿',
        '停车场': '🅿️',
        'WiFi': '📶',
        '更衣室': '👕',
        '休息区': '🛋️',
        '自动售货机': '🍫'
      }
      return iconMap[feature] || '✅'
    },

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    goBack() {
      this.$router.go(-1)
    },

    showMap() {
      this.showMapModal = true
    },

    selectTimeSlot(timeSlot) {
      if (this.isTimeSlotDisabled(timeSlot)) return
      this.selectedTime = this.selectedTime === timeSlot ? '' : timeSlot
    },

    isTimeSlotDisabled(timeSlot) {
      // 这里可以添加时间段的可用性判断逻辑
      // 例如：检查该时间段是否已被预订
      return false
    },

    increaseDuration() {
      if (this.duration < this.maxDuration) {
        this.duration++
      }
    },

    decreaseDuration() {
      if (this.duration > 1) {
        this.duration--
      }
    },

    async handleBooking() {
      if (!this.canBook) return

      try {
        const bookingData = {
          venueId: this.venue.id,
          date: this.bookingDate,
          timeSlot: this.selectedTime,
          duration: this.duration,
          totalPrice: this.totalPrice
        }

        // 这里调用预订API
        await bookVenue(bookingData)
        this.$message.success('预订成功！')

        // 跳转到我的预订页面
        this.$router.push('/my/bookings')
      } catch (error) {
        console.error('预订失败:', error)
        this.$message.error(error.message || '预订失败')
      }
    }
  }
}
</script>

<style src="./VenueDetail.css"></style>
