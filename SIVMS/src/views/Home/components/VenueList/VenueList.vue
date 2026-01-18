<template>
  <div class="venue-list-container">
    <div class="venue-grid" v-loading="loading">
      <el-card
        v-for="venue in venues"
        :key="venue.id"
        class="venue-card"
        shadow="hover"
        :class="{ unavailable: venue.status !== 'available' }"
      >
        <div class="venue-image">
          <img :src="venue.image" :alt="venue.name" />
          <div class="venue-status" :class="venue.status">
            {{ venue.status === 'available' ? '可预订' : '维护中' }}
          </div>
          <div class="venue-rating">
            <el-rate
              v-model="venue.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
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
              <span>{{ venue.location }}</span>
            </div>
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>容量：{{ venue.capacity }}</span>
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
              @click="handleBooking(venue)"
              :disabled="venue.status !== 'available'"
            >
              <el-icon><Calendar /></el-icon>
              立即预订
            </el-button>
            <el-button type="info" size="small" round plain @click="handleView(venue)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Location, User, Money, Calendar, View } from '@element-plus/icons-vue'

export default {
  name: 'VenueList',
  components: {
    Location,
    User,
    Money,
    Calendar,
    View,
  },
  props: {
    venues: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['venue-click', 'booking-click'],
  setup(props, { emit }) {
    const getTypeTag = (type) => {
      const typeMap = {
        篮球: 'success',
        游泳: 'primary',
        健身: 'warning',
        网球: 'info',
      }
      return typeMap[type] || 'info'
    }

    const handleView = (venue) => {
      emit('venue-click', venue)
    }

    const handleBooking = (venue) => {
      emit('booking-click', venue)
    }

    return {
      getTypeTag,
      handleView,
      handleBooking,
    }
  },
}
</script>

<style lang="scss" scoped>
.venue-list-container {
  .venue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;

    .venue-card {
      border: 1px solid rgba(79, 172, 254, 0.1);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;

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

      &:deep(.el-card__body) {
        padding: 0;
      }

      .venue-image {
        position: relative;
        height: 200px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .venue-status {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;

          &.available {
            background: rgba(103, 194, 58, 0.9);
            color: white;
          }

          &.maintenance {
            background: rgba(245, 108, 108, 0.9);
            color: white;
          }
        }

        .venue-rating {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 12px;

          &:deep(.el-rate) {
            .el-rate__icon {
              font-size: 0.9rem;
            }

            .el-rate__text {
              font-size: 0.85rem;
              margin-left: 5px;
            }
          }
        }
      }

      .venue-content {
        padding: 20px;

        .venue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;

          .venue-name {
            color: #2c3e50;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0;
            flex: 1;
            margin-right: 10px;
          }
        }

        .venue-info {
          margin-bottom: 20px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 0.9rem;
            color: #5a6c7d;

            i {
              color: #4facfe;
              font-size: 1rem;
            }

            .venue-price {
              color: #f56c6c;
              font-weight: 600;
            }
          }
        }

        .venue-actions {
          display: flex;
          gap: 10px;

          .el-button {
            flex: 1;

            &.el-button--primary {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              border: none;

              &:hover {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                opacity: 0.9;
              }

              &:disabled {
                background: #c0c4cc;
              }
            }

            i {
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .venue-list-container {
    .venue-card {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(79, 172, 254, 0.2);

      .venue-content {
        .venue-name {
          color: #e2e8f0;
        }

        .venue-info .info-item {
          color: #94a3b8;
        }
      }

      .venue-rating {
        background: rgba(30, 41, 59, 0.9);
      }
    }
  }
}

@media (max-width: 768px) {
  .venue-list-container {
    .venue-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
  }
}
</style>
