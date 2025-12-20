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
              <i class="el-icon-shopping-cart-2"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userBookingsCount || 0 }}</div>
              <div class="stat-label">历史预订</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="el-icon-star"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userFavoritesCount || 0 }}</div>
              <div class="stat-label">收藏场馆</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-section" :key="searchKey">
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
              <div class="venue-status" :class="getStatusClass(venue.status)">
                {{ getStatusText(venue.status) }}
              </div>
              <div class="venue-type">{{ venue.type }}</div>
              <!-- 收藏按钮（已注释，暂时禁用该功能） -->
              <!--
              <button
                class="favorite-btn"
                @click.stop="toggleFavorite(venue)"
                :class="{ active: isFavorite(venue.id) }"
              >
                <i class="el-icon-star"></i>
              </button>
              -->
            </div>

            <!-- 场馆信息 -->
            <div class="venue-info">
              <div class="venue-header">
                <h3 class="venue-name" @click="viewVenueDetail(venue)">
                  {{ venue.name }}
                </h3>
                <div class="venue-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-value">{{ venue.rating || '4.5' }}</span>
                  <span class="review-count">({{ venue.reviewCount || '128' }})</span>
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
                  <span class="price-value">{{ venue.price || '150' }}</span>
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

              <!-- 快速预订时间 -->
              <div class="quick-booking" v-if="venue.status === 1">
                <div class="quick-title">快速预订：</div>
                <div class="time-slots">
                  <span
                    v-for="slot in getQuickTimeSlots()"
                    :key="slot"
                    class="time-slot"
                    @click="quickBook(venue, slot)"
                  >
                    {{ slot }}
                  </span>
                </div>
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
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import { fetchVenues } from '@/api/venue'
//import { addFavorite, removeFavorite, fetchFavorites } from '@/api/venue'

export default {
  name: 'BookingPage',

  components: {
    NavBar,
  },

  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const route = useRoute()
    const searchKey = ref(Date.now())
    // 用户相关状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)
    const userAvatar = computed(() => userStore.avatar)

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

    // 收藏相关
    /* const favoriteVenues = ref([])
    const loadingFavorites = ref(false) */

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

    // 用户统计数据（模拟）
    const userBookingsCount = computed(() => {
      return userStore.userInfo?.bookingCount || 0
    })

    // 收藏计数（功能被注释，返回占位 0 避免引用错误）
    const userFavoritesCount = computed(() => 0)

    // 监听登录状态变化
    watch(isLogin, (newVal) => {
      if (newVal) {
        /* loadUserData() */
        loadVenues()
      }
    })

    // 生命周期
    onMounted(() => {
      if (isLogin.value) {
        /* loadUserData() */
        loadVenues()
      }
    })

    const loadVenues = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          status: 1, // 只显示营业中的场馆
          type: selectedType.value || undefined,
          name: searchKeyword.value || undefined,
        }

        const response = await fetchVenues(params)

        let venuesData = response.data.records || response.data.list || []

        // 应用价格筛选（后端返回 price 字段）
        if (selectedPriceRange.value) {
          venuesData = filterByPrice(venuesData, selectedPriceRange.value)
        }

        // 将后端字段映射为前端模板使用的字段
        venues.value = venuesData.map((v) => {
          return {
            // 保留原 id/name/type/price/image/description/status/remark
            ...v,
            // 后端返回 location -> 前端使用 address
            address: v.location || v.address || '',
            // 后端返回 openTime/closeTime -> 前端使用 openHours
            openHours:
              v.openTime && v.closeTime ? `${v.openTime}-${v.closeTime}` : v.openHours || '',
            // facilities 可能来自 remark 或原有字段
            facilities: v.facilities || (v.remark ? v.remark : ''),
            // 保证模板里可能用到的字段有合理默认值
            capacity: v.capacity || v.capacity === 0 ? v.capacity : undefined,
            rating: v.rating || undefined,
            reviewCount: v.reviewCount || undefined,
            originalPrice: v.originalPrice || undefined,
          }
        })

        filteredVenues.value = venues.value
        total.value = response.data.total || venues.value.length
      } catch (error) {
        console.error('加载场馆失败:', error)
        ElMessage.error('加载场馆列表失败')

        // 不再使用本地测试数据，发生错误时清空列表并显示错误
        venues.value = []
        filteredVenues.value = []
        total.value = 0
      } finally {
        loading.value = false
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

    const calculateDiscount = (originalPrice, currentPrice) => {
      if (!originalPrice || originalPrice <= currentPrice) return 0
      const discount = ((originalPrice - currentPrice) / originalPrice) * 100
      return Math.round(discount)
    }

    const viewVenueDetail = (venue) => {
      router.push(`/venue/detail/${venue.id}`)
    }

    const handleBooking = (venue) => {
      if (!isLogin.value) {
        ElMessage.warning('请先登录')
        goToLogin()
        return
      }

      // 跳转到订单页面
      router.push({
        path: '/Order',
        query: { venueId: venue.id },
      })
    }

    const quickBook = (venue, timeSlot) => {
      if (!isLogin.value) {
        ElMessage.warning('请先登录')
        goToLogin()
        return
      }

      ElMessage.info(`快速预订 ${venue.name} ${timeSlot}`)
      // 这里可以快速跳转到预订页面
    }

    const getQuickTimeSlots = () => {
      // 获取未来几小时的快速预订时间
      const now = new Date()
      const currentHour = now.getHours()
      return ['14:00-16:00', '16:00-18:00', '19:00-21:00']
        .filter((slot) => {
          const startHour = parseInt(slot.split(':')[0])
          return startHour > currentHour + 1
        })
        .slice(0, 2)
    }
    // 监听路由变化，重新生成key
    watch(
      () => route.path,
      () => {
        searchKey.value = Date.now()
      },
      { immediate: true },
    )
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
      userFavoritesCount,

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
      route,
      searchKey,
      // 计算属性
      hasFilters,
      venueTypes,

      // 方法
      handleSearch,
      resetFilters,
      getStatusClass,
      getStatusText,
      getFacilities,
      /* isFavorite,
      toggleFavorite, */
      calculateDiscount,
      viewVenueDetail,
      handleBooking,
      quickBook,
      getQuickTimeSlots,
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

/* 用户欢迎信息：改为蓝绿渐变背景 */
.user-welcome {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
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
  background: linear-gradient(135deg, #6adef8 0%, #05dbf7 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 10px 30px rgba(148, 221, 233, 0.3);

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
        color: #66cdea;
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

        i {
          font-size: 24px;
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

// 搜索区域
.search-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-height: 140px; // 添加最小高度
  overflow: visible; // 确保内容不会被裁剪

  @media (max-width: 768px) {
    padding: 25px;
    min-height: 160px; // 移动端增加高度
  }
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 80px; // 确保容器有足够高度
}
// 输入框组 - 防止溢出
.search-input-group {
  :deep(.el-input) {
    height: 48px; // 固定高度
    .el-input__wrapper {
      // 清除可能冲突的padding
      padding: 0 !important; // 先清除所有padding

      // 然后设置自定义padding
      .el-input__inner {
        padding: 0 15px;
        height: 100%;
      }

      .el-input__prefix {
        padding-left: 15px;
        padding-right: 8px;
      }

      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      transition: all 0.3s ease;
      height: 100%;

      &:hover {
        border-color: #cbd5e1;
        background: white;
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        background: white;
      }
    }

    .el-input__inner {
      height: 100%; // 确保输入框内容高度正确
    }

    .el-input__prefix {
      display: flex;
      align-items: center;
      height: 100%;

      .el-icon-search {
        font-size: 18px;
        color: #94a3b8;
      }
    }
  }
}
// 筛选组 - 修复布局问题
.filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap; // 允许换行
  min-height: 50px; // 确保有足够空间

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .type-filter,
  .price-filter {
    flex: 1;
    min-width: 200px; // 设置最小宽度

    @media (max-width: 768px) {
      width: 100%;
      min-width: auto;
    }

    :deep(.el-select) {
      width: 100%;

      .el-input__wrapper {
        height: 48px; // 和输入框保持一致
      }
    }
  }
  .reset-btn {
    white-space: nowrap;
    height: 48px; // 保持按钮高度一致

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

/* 场馆列表区域 - 横向展示（修改） */
.venues-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 每一项横向卡片布局：左 图，中 信息，右 操作 */
.venue-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}

/* 图片区域固定宽度 */
.venue-image {
  flex: 0 0 260px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.venue-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 信息区自适应占满剩余空间 */
.venue-info {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 预订区固定宽度并垂直布局，按钮靠右显示 */
.booking-action {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

/* 处理收藏按钮位置 */
.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}

/* 小部件微调 */
.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.venue-name {
  margin: 0;
  cursor: pointer;
}

.venue-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 13px;
}

/* 分页与空/加载状态保持原样 */
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式：窄屏时回退为竖直布局 */
@media (max-width: 768px) {
  .venue-item {
    flex-direction: column;
    padding: 12px;
  }

  .venue-image {
    width: 100%;
    height: 180px;
    flex: none;
    border-radius: 8px;
  }

  .booking-action {
    width: 100%;
    flex: none;
    align-items: stretch;
    margin-top: 10px;
  }

  .favorite-btn {
    top: 10px;
    right: 10px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .booking-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .login-prompt {
    background: #1e293b;
    border: 1px solid #334155;
  }

  .search-section,
  .venue-item {
    background: #1e293b;
    border: 1px solid #334155;
  }

  // ... 其他暗色主题样式
}
</style>
