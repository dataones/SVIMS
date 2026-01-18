<template>
  <div class="recommended-venues">
    <div class="venues-grid" v-loading="loading">
      <div
        v-for="venue in venues"
        :key="venue.id"
        class="venue-card"
        @click="handleVenueClick(venue)"
      >
        <div class="venue-image">
          <img :src="venue.image || defaultImage" :alt="venue.name" />
          <div class="venue-status" :class="getStatusClass(venue.status)">
            {{ getStatusText(venue.status) }}
          </div>
          <div class="venue-rating">
            <el-rate
              v-model="venue.rating"
              disabled
              show-score
              text-color="#ff9900"
              :precision="1"
              :score-template="
                venue.rating % 1 === 0 ? venue.rating + '.0' : venue.rating.toString()
              "
            />
          </div>
        </div>

        <div class="venue-content">
          <div class="venue-header">
            <h4 class="venue-name">{{ venue.name }}</h4>
            <el-tag :type="getTypeTag(venue.type)" size="small" effect="light">
              {{ venue.type }}
            </el-tag>
          </div>

          <div class="venue-info">
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>{{ venue.location || venue.address }}</span>
            </div>
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>容量：{{ venue.capacity || '暂无' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Money /></el-icon>
              <span class="venue-price">¥{{ venue.price }}/小时</span>
            </div>
          </div>

          <div class="venue-actions">
            <el-button
              type="primary"
              size="small"
              round
              @click.stop="handleBooking(venue)"
              :disabled="venue.status !== 'available' && venue.status !== 1"
            >
              <el-icon><Calendar /></el-icon>
              立即预订
            </el-button>
            <el-button type="info" size="small" round plain @click.stop="handleView(venue)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, User, Money, Calendar, View } from '@element-plus/icons-vue'
import { fetchRecommendedVenues } from '@/api/venue'
import { getVenueReviewStats } from '@/api/review'

export default {
  name: 'RecommendedVenues',
  components: {
    Location,
    User,
    Money,
    Calendar,
    View,
  },
  props: {
    limit: {
      type: Number,
      default: 4,
    },
    excludeVenueId: {
      type: Number,
      default: null,
    },
    useSimpleLayout: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['venue-click', 'booking-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const venues = ref([])
    const loading = ref(false)
    const defaultImage =
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'

    // 获取推荐场馆数据
    const fetchVenues = async () => {
      try {
        loading.value = true
        const response = await fetchRecommendedVenues(props.limit)
        if (response.code === 200 && response.data) {
          // 为每个场馆获取真实的评分数据
          const venuesWithRating = await Promise.all(
            response.data.map(async (venue) => {
              try {
                // 使用评分API获取真实评分
                const ratingResponse = await getVenueReviewStats(venue.id)
                if (ratingResponse.code === 200 && ratingResponse.data) {
                  return {
                    ...venue,
                    rating: parseFloat(parseFloat(ratingResponse.data.avgRating || 4.5).toFixed(1)),
                    status: venue.status === 1 ? 'available' : 'maintenance',
                  }
                }
              } catch (error) {
                console.warn(`获取场馆${venue.id}评分失败:`, error)
              }
              return {
                ...venue,
                rating: parseFloat((4.5).toFixed(1)),
                status: venue.status === 1 ? 'available' : 'maintenance',
              }
            }),
          )

          // 排除指定场馆
          let filteredVenues = venuesWithRating
          if (props.excludeVenueId) {
            filteredVenues = venuesWithRating.filter((v) => v.id !== props.excludeVenueId)
          }

          venues.value = filteredVenues
        } else {
          venues.value = []
        }
      } catch (error) {
        console.error('获取推荐场馆失败:', error)
        venues.value = []
      } finally {
        loading.value = false
      }
    }

    // 模拟场馆数据（后备）
    const getMockVenues = () => {
      return []
    }

    // 获取类型标签
    const getTypeTag = (type) => {
      const typeMap = {
        篮球: 'success',
        游泳: 'primary',
        健身: 'warning',
        网球: 'info',
      }
      return typeMap[type] || 'info'
    }

    // 获取状态样式
    const getStatusClass = (status) => {
      if (status === 'available' || status === 1) return 'available'
      if (status === 'maintenance' || status === 0) return 'maintenance'
      return 'maintenance'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      if (status === 'available' || status === 1) return '可预订'
      if (status === 'maintenance' || status === 0) return '维护中'
      return '维护中'
    }

    // 处理场馆点击
    const handleVenueClick = (venue) => {
      emit('venue-click', venue)
    }

    // 处理查看详情
    const handleView = (venue) => {
      emit('venue-click', venue)
    }

    // 处理预订
    const handleBooking = (venue) => {
      emit('booking-click', venue)
    }

    // 生命周期
    onMounted(() => {
      fetchVenues()
    })

    return {
      venues,
      loading,
      defaultImage,
      getTypeTag,
      getStatusClass,
      getStatusText,
      handleVenueClick,
      handleView,
      handleBooking,
    }
  },
}
</script>

<style lang="scss" scoped>
.recommended-venues {
  .venues-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;

    .venue-card {
      border: 1px solid rgba(79, 172, 254, 0.1);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      background: white;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(79, 172, 254, 0.15);
      }

      &.unavailable {
        opacity: 0.7;
        &:hover {
          transform: none;
          box-shadow: none;
        }
      }

      .venue-image {
        position: relative;
        height: 180px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .venue-status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);

          &.available {
            background: rgba(103, 194, 58, 0.9);
            color: white;
          }

          &.maintenance {
            background: rgba(230, 162, 60, 0.9);
            color: white;
          }
        }

        .venue-rating {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 8px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
      }

      .venue-content {
        padding: 16px;

        .venue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .venue-name {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
            line-height: 1.4;
          }
        }

        .venue-info {
          margin-bottom: 16px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
            font-size: 14px;
            color: #666;

            .el-icon {
              font-size: 16px;
              color: #409eff;
            }

            .venue-price {
              font-weight: 600;
              color: #e6a23c;
            }
          }
        }

        .venue-actions {
          display: flex;
          gap: 8px;

          .el-button {
            flex: 1;
            font-size: 12px;
            padding: 6px 12px;

            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
