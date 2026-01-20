<template>
  <div class="booking-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 登录检查 -->
    <div v-if="!isLogin" class="login-required">
      <div class="login-prompt">
        <div class="prompt-icon">
          <i class="el-icon-user"></i>
        </div>
        <h2>请先登录</h2>
        <p>预订场馆需要登录账号，请先登录或注册</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="login-btn">
            <i class="el-icon-user"></i>
            立即登录
          </el-button>
          <el-button type="success" size="large" @click="goToRegister" plain>
            <i class="el-icon-user-plus"></i>
            注册账号
          </el-button>
        </div>
      </div>
    </div>

    <!-- 已登录用户显示内容 -->
    <div v-else class="booking-container">
      <!-- 用户欢迎信息 -->
      <div class="user-welcome">
        <div class="welcome-content">
          <div class="user-avatar">
            <el-avatar :size="60" :src="userAvatar">
              {{ userName.charAt(0) }}
            </el-avatar>
          </div>
          <div class="user-info">
            <h2 class="welcome-text">欢迎回来，{{ userName }}！</h2>
            <p class="welcome-subtext">开始预订您心仪的运动场馆</p>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <ShoppingCart />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userBookingsCount || 0 }}</div>
              <div class="stat-label">历史预订</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索框 - 移除 :key 绑定 -->
      <div class="search-section">
        <div class="search-box">
          <div class="search-input-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索场馆名称、地址或类型..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
          </div>

          <div class="filter-group">
            <el-select
              v-model="selectedType"
              placeholder="所有类型"
              size="large"
              clearable
              class="type-filter"
              @change="handleSearch"
            >
              <el-option v-for="type in venueTypes" :key="type" :label="type" :value="type" />
            </el-select>

            <el-select
              v-model="selectedPriceRange"
              placeholder="价格区间"
              size="large"
              clearable
              class="price-filter"
              @change="handleSearch"
            >
              <el-option
                v-for="range in priceRanges"
                :key="range.value"
                :label="range.label"
                :value="range.value"
              />
            </el-select>

            <el-button
              type="info"
              size="large"
              @click="resetFilters"
              :disabled="!hasFilters"
              class="reset-btn"
            >
              <i class="el-icon-refresh"></i>
              重置筛选
            </el-button>
          </div>
        </div>
      </div>

      <!-- 场馆列表 -->
      <div class="venues-section">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载场馆中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredVenues.length === 0" class="empty-state">
          <div class="empty-icon">🏟️</div>
          <h3>未找到符合条件的场馆</h3>
          <p>尝试更换搜索关键词或筛选条件</p>
          <el-button type="primary" @click="resetFilters">显示所有场馆</el-button>
        </div>

        <!-- 场馆列表 -->
        <div v-else class="venues-list">
          <div v-for="venue in filteredVenues" :key="venue.id" class="venue-item">
            <!-- 场馆图片 -->
            <div class="venue-image" @click="viewVenueDetail(venue)">
              <img :src="venue.image || defaultImage" :alt="venue.name" />
              <div
                class="venue-status"
                :class="getStatusClass(venue.status)"
                :style="getStatusStyle(venue.status)"
              >
                {{ getStatusText(venue.status) }}
              </div>
            </div>

            <!-- 场馆信息 -->
            <div class="venue-info">
              <div class="venue-header">
                <h3 class="venue-name" @click="viewVenueDetail(venue)">
                  {{ venue.name }}
                </h3>
                <div class="venue-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-value">{{ getVenueRating(venue) }}</span>
                  <span class="review-count">({{ getVenueReviewCount(venue) }})</span>
                </div>
              </div>

              <div class="venue-meta">
                <div class="meta-item">
                  <i class="el-icon-location"></i>
                  <span>{{ venue.address || '地址信息' }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-user"></i>
                  <span>容量: {{ venue.capacity || '50' }}人</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-time"></i>
                  <span>{{ venue.openHours || '08:00-22:00' }}</span>
                </div>
              </div>

              <p class="venue-description">
                {{ venue.description || '专业运动场馆，配备先进设施' }}
              </p>

              <div class="venue-facilities">
                <span
                  v-for="(facility, index) in getFacilities(venue)"
                  :key="index"
                  class="facility-tag"
                >
                  {{ facility }}
                </span>
              </div>
            </div>

            <!-- 预订区域 -->
            <div class="booking-action">
              <div class="price-info">
                <div class="current-price">
                  <span class="price-label">¥</span>
                  <span class="price-value">{{ venue.price }}</span>
                  <span class="price-unit">/小时</span>
                </div>
                <div v-if="venue.originalPrice" class="original-price">
                  ¥{{ venue.originalPrice }}
                </div>
                <div class="discount-badge" v-if="venue.originalPrice">
                  -{{ calculateDiscount(venue.originalPrice, venue.price) }}%
                </div>
              </div>

              <div class="action-buttons">
                <el-button
                  type="info"
                  size="large"
                  @click="viewVenueDetail(venue)"
                  class="detail-btn"
                >
                  <i class="el-icon-view"></i>
                  查看详情
                </el-button>

                <el-button
                  type="success"
                  size="large"
                  @click="handleBooking(venue)"
                  :disabled="venue.status !== 1"
                  class="book-btn"
                >
                  <i class="el-icon-shopping-cart-2"></i>
                  立即预订
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredVenues.length > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
  <div>
    <!-- 底部信息 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3><i class="el-icon-s-opportunity"></i> 体育场馆综合管理系统</h3>
          <p>智慧管理 · 便捷预约 · 高效运营</p>
          <p>为您提供最优质的体育场馆服务体验</p>
        </div>
        <div class="footer-section">
          <h4>服务支持</h4>
          <ul>
            <li><el-link :underline="false">使用帮助</el-link></li>
            <li><el-link :underline="false">常见问题</el-link></li>
            <li><el-link :underline="false">联系我们</el-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li><el-link :underline="false">平台介绍</el-link></li>
            <li><el-link :underline="false">服务条款</el-link></li>
            <li><el-link :underline="false">隐私政策</el-link></li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        © 2025 体育场馆综合管理系统. All rights reserved.
        <div>
          <img
            src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
            alt="渝公网安备"
            style="width: 20px; height: 20px; margin-right: 5px"
          />
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch"
            target="_blank"
            style="color: aliceblue"
          >
            渝公网安备50024002000227号</a
          ><span> · </span>
          <a href="https://beian.miit.gov.cn/" target="_blank" style="color: aliceblue"
            >渝ICP备2025076592号-3</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import { fetchVenues } from '@/api/venue'
import { getUserStats } from '@/api/user'
import { getMyBookings } from '@/api/booking'
import { getVenueReviewStats } from '@/api/review'

export default {
  name: 'BookingPage',

  components: {
    NavBar,
    User,
    ShoppingCart,
  },

  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const route = useRoute()

    // 用户相关状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)
    const userAvatar = computed(() => userStore.avatar)
    const userStats = ref({})

    // 搜索和筛选状态
    const searchKeyword = ref('')
    const selectedType = ref('')
    const selectedPriceRange = ref('')
    const venues = ref([])
    const filteredVenues = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const venueReviewStats = ref({}) // 评价统计数据

    // 默认图片
    const defaultImage =
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 价格区间选项
    const priceRanges = [
      { value: '0-50', label: '¥0-50' },
      { value: '50-100', label: '¥50-100' },
      { value: '100-200', label: '¥100-200' },
      { value: '200+', label: '¥200以上' },
    ]

    // 计算属性
    const hasFilters = computed(() => {
      return searchKeyword.value || selectedType.value || selectedPriceRange.value
    })

    const venueTypes = computed(() => {
      const types = new Set()
      venues.value.forEach((venue) => {
        if (venue.type) types.add(venue.type)
      })
      return Array.from(types)
    })

    // 用户统计数据
    const userBookingsCount = computed(() => {
      return userStats.value.bookings || 0
    })

    // 获取用户统计数据
    const loadUserStats = async () => {
      if (!isLogin.value) return

      try {
        // 先尝试使用getUserStats API
        try {
          const res = await getUserStats()

          if (res.code === 200 && res.data) {
            userStats.value = res.data
            return
          }
        } catch (statsError) {}

        // 如果getUserStats失败，使用getMyBookings来统计
        const bookingsRes = await getMyBookings()

        if (bookingsRes.code === 200 && bookingsRes.data) {
          const bookingCount = Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0

          userStats.value = {
            balance: 0,
            bookingCount: bookingCount,
            favoriteCount: 0, // 暂时设为0，后续可以添加收藏API
          }
        }
      } catch (error) {
        console.error('获取用户统计数据失败:', error)
        userStats.value = {
          balance: 0,
          bookingCount: 0,
          favoriteCount: 0,
        }
      }
    }

    // 监听登录状态变化
    watch(isLogin, (newVal) => {
      if (newVal) {
        loadVenues()
        loadUserStats()
      }
    })

    // 生命周期
    onMounted(() => {
      if (isLogin.value) {
        loadVenues()
        loadUserStats()
      }
    })

    const loadVenues = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          status: 1,
          type: selectedType.value || undefined,
          name: searchKeyword.value || undefined,
        }

        const response = await fetchVenues(params)

        let venuesData = response.data.records || response.data.list || []

        if (selectedPriceRange.value) {
          venuesData = filterByPrice(venuesData, selectedPriceRange.value)
        }

        venues.value = venuesData.map((v) => {
          return {
            ...v,
            address: v.location || v.address || '',
            openHours:
              v.openTime && v.closeTime ? `${v.openTime}-${v.closeTime}` : v.openHours || '',
            facilities: v.facilities || (v.remark ? v.remark : ''),
            capacity: v.capacity || v.capacity === 0 ? v.capacity : undefined,
            rating: v.rating || undefined,
            reviewCount: v.reviewCount || undefined,
            originalPrice: v.originalPrice || undefined,
          }
        })

        // 获取每个场馆的评价统计
        await loadVenueReviewStats()

        filteredVenues.value = venues.value
        total.value = response.data.total || venues.value.length

        // Force image repaint to avoid transient visual artifacts
        const forceImageRepaint = () => {
          requestAnimationFrame(() => {
            const imgs = document.querySelectorAll('.booking-page .venue-image img')
            imgs.forEach((img) => {
              if (img.complete) {
                img.style.transform = 'translateZ(0)'
                void img.offsetHeight
                img.style.transform = ''
              } else {
                img.addEventListener(
                  'load',
                  () => {
                    img.style.transform = 'translateZ(0)'
                    void img.offsetHeight
                    img.style.transform = ''
                  },
                  { once: true },
                )
              }
            })
          })
        }

        forceImageRepaint()
      } catch (error) {
        console.error('加载场馆失败:', error)
        ElMessage.error('加载场馆列表失败')
        venues.value = []
        filteredVenues.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 获取场馆评价统计
    const loadVenueReviewStats = async () => {
      for (const venue of venues.value) {
        try {
          const res = await getVenueReviewStats(venue.id)
          if (res.code === 200 && res.data) {
            venueReviewStats.value[venue.id] = res.data
          }
        } catch (error) {
          console.error(`获取场馆 ${venue.id} 评价统计失败:`, error)
          venueReviewStats.value[venue.id] = { avgRating: '0.0', totalReviews: 0 }
        }
      }
    }

    const filterByPrice = (venues, range) => {
      return venues.filter((venue) => {
        const price = venue.price || 0
        switch (range) {
          case '0-50':
            return price <= 50
          case '50-100':
            return price > 50 && price <= 100
          case '100-200':
            return price > 100 && price <= 200
          case '200+':
            return price > 200
          default:
            return true
        }
      })
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadVenues()
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      selectedType.value = ''
      selectedPriceRange.value = ''
      currentPage.value = 1
      loadVenues()
    }

    const getStatusClass = (status) => {
      return status === 1 ? 'open' : 'closed'
    }

    const getStatusText = (status) => {
      return status === 1 ? '营业中' : '已关闭'
    }

    const getFacilities = (venue) => {
      if (!venue.facilities) return ['空调', '淋浴', '停车场']
      return venue.facilities.split(/[、,，]/).slice(0, 3)
    }

    // 获取场馆评分
    const getVenueRating = (venue) => {
      const stats = venueReviewStats.value[venue.id]
      return stats ? stats.avgRating : '0.0'
    }

    // 获取场馆评价数量
    const getVenueReviewCount = (venue) => {
      const stats = venueReviewStats.value[venue.id]
      return stats ? stats.totalReviews : 0
    }

    // 获取状态样式（内联样式，确保刷新后也能显示）
    const getStatusStyle = (status) => {
      const baseStyle = {
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        maxWidth: 'fit-content',
        zIndex: '6',
      }

      if (status === 1) {
        return {
          ...baseStyle,
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
        }
      } else {
        return {
          ...baseStyle,
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
        }
      }
    }

    // 获取类型样式（内联样式，确保刷新后也能显示）
    const getTypeStyle = (venue) => {
      return {
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '10px',
        lineHeight: '1.2',
        whiteSpace: 'nowrap',
        zIndex: '5',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    }

    const calculateDiscount = (originalPrice, currentPrice) => {
      if (!originalPrice || originalPrice <= currentPrice) return 0
      const discount = ((originalPrice - currentPrice) / originalPrice) * 100
      return Math.round(discount)
    }

    const viewVenueDetail = (venue) => {
      router.push(`/venue/details/${venue.id}`)
    }

    const handleBooking = (venue) => {
      if (!isLogin.value) {
        ElMessage.warning('请先登录')
        goToLogin()
        return
      }

      router.push({
        path: '/Order',
        query: { venueId: venue.id },
      })
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadVenues()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadVenues()
    }

    const goToLogin = () => {
      router.push('/login')
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      // 用户相关
      isLogin,
      userName,
      userAvatar,
      userBookingsCount,

      // 搜索和筛选
      searchKeyword,
      selectedType,
      selectedPriceRange,
      venues,
      filteredVenues,
      loading,
      currentPage,
      pageSize,
      total,
      defaultImage,
      priceRanges,
      venueReviewStats, // 评价统计

      // 计算属性
      hasFilters,
      venueTypes,

      // 方法
      handleSearch,
      resetFilters,
      getStatusClass,
      getStatusText,
      getFacilities,
      getVenueRating,
      getVenueReviewCount,
      getStatusStyle,
      getTypeStyle,
      calculateDiscount,
      viewVenueDetail,
      handleBooking,
      handleSizeChange,
      handleCurrentChange,
      goToLogin,
      goToRegister,
    }
  },
}
</script>

<style scoped lang="scss">
.booking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 登录提示样式 */
.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;

  .login-prompt {
    background: white;
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

    .prompt-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;

      i {
        font-size: 40px;
        color: white;
      }
    }

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 15px;
    }

    p {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;

      @media (max-width: 480px) {
        flex-direction: column;
      }

      .login-btn {
        padding: 15px 40px;
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border: none;

        i {
          margin-right: 8px;
        }
      }
    }
  }
}

// 已登录用户内容
.booking-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

// 用户欢迎信息
.user-welcome {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.3);

  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  .welcome-content {
    display: flex;
    align-items: center;
    gap: 25px;
    margin-bottom: 30px;

    @media (max-width: 480px) {
      flex-direction: column;
      text-align: center;
    }

    .user-avatar {
      :deep(.el-avatar) {
        background: white;
        color: #4facfe;
        font-size: 24px;
        font-weight: 600;
      }
    }

    .user-info {
      flex: 1;

      .welcome-text {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 10px 0;

        @media (max-width: 768px) {
          font-size: 24px;
        }
      }

      .welcome-subtext {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
      }
    }
  }

  .user-stats {
    display: flex;
    gap: 40px;

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 20px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 24px;
          height: 24px;
          color: white;
        }
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.8;
        }
      }
    }
  }
}

// 搜索区域 - 核心修复
.search-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 输入框组 - 固定尺寸防止收缩
.search-input-group {
  width: 100%;

  :deep(.el-input) {
    width: 100%;

    .el-input__wrapper {
      height: 48px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      box-sizing: border-box;
      transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease,
        background-color 0.3s ease;

      &:hover {
        border-color: #cbd5e1;
        background: white;
      }

      &.is-focus {
        border-color: #4facfe;
        box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1);
        background: white;
      }
    }

    .el-input__prefix {
      .el-icon-search {
        font-size: 18px;
        color: #94a3b8;
      }
    }
  }
}

// 筛选组 - 使用固定宽度
.filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .type-filter,
  .price-filter {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
    }

    :deep(.el-select) {
      width: 100% !important;
      max-width: 100% !important;

      .el-input__wrapper {
        height: 48px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: #f8fafc;
        box-sizing: border-box;
        transition:
          border-color 0.3s ease,
          box-shadow 0.3s ease,
          background-color 0.3s ease;
        width: 100% !important;

        &:hover {
          border-color: #cbd5e1;
          background: white;
        }

        &.is-focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1);
          background: white;
        }
      }

      .el-input__inner {
        width: 100% !important;
      }
    }
  }

  .reset-btn {
    height: 48px;
    min-height: 48px;
    padding: 0 24px;
    border-radius: 12px;
    white-space: nowrap;
    flex-shrink: 0;
    box-sizing: border-box;

    @media (max-width: 768px) {
      width: 100%;
    }

    i {
      margin-right: 6px;
    }
  }
}

// 场馆列表区域
.venues-section {
  min-height: 400px;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top-color: #4facfe;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 20px;
    color: #64748b;
    font-size: 16px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 24px;
    color: #1e293b;
    margin-bottom: 10px;
  }

  p {
    color: #64748b;
    margin-bottom: 30px;
  }
}

// 场馆列表
.venues-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 场馆卡片
.venue-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
  }
}

// 场馆图片
.venue-image {
  flex: 0 0 280px;
  height: 180px;
  min-height: 180px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
    height: 200px;
    min-height: 200px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    display: block; /* 防止 img 出现空白行 */
    border-radius: 12px; /* 确保图片和容器圆角一致 */
  }

  &:hover img {
    transform: scale(1.05);
  }

  .venue-image .venue-status {
    /* 样式主要通过内联样式应用 */
  }

  .venue-image .venue-type {
    /* 样式主要通过内联样式应用 */
  }

  /* 如果存在旧的 image-overlay 元素（子组件内），使用深度选择器强制覆盖 */
  ::v-deep .image-overlay {
    display: none !important;
    background: transparent !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    z-index: 0 !important;
  }

  /* 确保图片位于较低但可见的层级（让状态/类型浮层可见） */
  ::v-deep .venue-image img {
    position: relative !important;
    z-index: 1 !important;
    display: block !important;
  }

  /* 提升状态/类型标签层级，确保它们始终可见 */
  ::v-deep .venue-status {
    z-index: 12 !important;
  }

  ::v-deep .venue-type {
    z-index: 11 !important;
  }

  /* 兜底：隐藏常见加载占位类（如果存在） */
  ::v-deep .skeleton,
  ::v-deep .lazyload-placeholder,
  ::v-deep .loading-placeholder {
    display: none !important;
    background: transparent !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
}

// 场馆信息
.venue-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;

  .venue-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    flex-wrap: wrap;

    .venue-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #4facfe;
      }
    }

    .venue-rating {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .stars {
        color: #fbbf24;
        font-size: 14px;
      }

      .rating-value {
        font-weight: 600;
        color: #1e293b;
      }

      .review-count {
        color: #94a3b8;
        font-size: 13px;
      }
    }
  }

  .venue-meta {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 14px;

      i {
        color: #94a3b8;
      }
    }
  }

  .venue-description {
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .venue-facilities {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .facility-tag {
      padding: 4px 12px;
      background: #f1f5f9;
      color: #64748b;
      border-radius: 20px;
      font-size: 12px;
    }
  }
}

// 预订区域
.booking-action {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
    align-items: stretch;
  }

  .price-info {
    text-align: right;

    @media (max-width: 768px) {
      text-align: left;
    }

    .current-price {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      gap: 2px;

      @media (max-width: 768px) {
        justify-content: flex-start;
      }

      .price-label {
        font-size: 16px;
        color: #ef4444;
        font-weight: 600;
      }

      .price-value {
        font-size: 28px;
        font-weight: 700;
        color: #ef4444;
      }

      .price-unit {
        font-size: 14px;
        color: #94a3b8;
      }
    }

    .original-price {
      text-decoration: line-through;
      color: #94a3b8;
      font-size: 14px;
    }

    .discount-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #fef2f2;
      color: #ef4444;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
    align-items: stretch;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .el-button {
      flex: 1;
      border-radius: 10px;
      font-weight: 600;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        margin-right: 6px;
      }
    }

    .detail-btn {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #64748b;

      &:hover {
        background: #e2e8f0;
        color: #475569;
      }
    }

    .book-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
      }
    }
  }
}

// 分页
.pagination-section {
  margin-top: 40px;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 8px;

      &.is-active {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .booking-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .login-prompt,
  .search-section,
  .venue-item {
    background: #1e293b;
    border: 1px solid #334155;
  }

  .venue-name,
  .venue-rating .rating-value {
    color: #f1f5f9;
  }

  .venue-description,
  .venue-meta .meta-item {
    color: #94a3b8;
  }

  .search-input-group :deep(.el-input .el-input__wrapper),
  .filter-group :deep(.el-select .el-input__wrapper) {
    background: #334155;
    border-color: #475569;

    &:hover,
    &.is-focus {
      background: #3b4252;
    }
  }
}
</style>

<style lang="scss" scoped>
.home-footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 60px 20px 30px;
  margin-top: 80px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;

    .footer-section {
      h3 {
        color: #4facfe;
        margin-bottom: 15px;
        font-size: 1.3rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;

        i {
          font-size: 1.5rem;
        }
      }

      h4 {
        color: #4facfe;
        margin-bottom: 20px;
        font-size: 1.2rem;
        font-weight: 600;
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 2px;
        }
      }

      p {
        color: #cbd5e1;
        font-size: 0.9rem;
        margin-bottom: 10px;
        line-height: 1.6;

        &:first-of-type {
          color: #94a3b8;
          font-weight: 500;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .el-link {
            color: #cbd5e1;
            transition: all 0.3s ease;

            &:hover {
              color: #4facfe;
              padding-left: 5px;
            }
          }
        }
      }
    }
  }

  .copyright {
    max-width: 1200px;
    margin: 50px auto 0;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
  }
}
</style>
