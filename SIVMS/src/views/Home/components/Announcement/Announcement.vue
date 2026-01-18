<template>
  <div class="announcement-container">
    <el-card class="announcement-card" shadow="hover">
      <div v-if="loading" class="announcement-loading">
        <div class="loading-spinner"></div>
        <p>加载公告中...</p>
      </div>
      <div v-else class="announcement-grid">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          :class="{ 'top-notice': notice.isTop }"
          @click="handleClick(notice)"
        >
          <div class="notice-header">
            <div class="notice-icon" :style="{ color: getIconColor(notice.type) }">
              <el-icon><component :is="getIconComponent(notice.icon)" /></el-icon>
            </div>
            <div class="notice-badges">
              <el-tag v-if="notice.isTop" type="warning" size="small" effect="dark">
                <el-icon><Star /></el-icon>
                置顶
              </el-tag>
              <el-tag :type="getPriorityTagType(notice.priority)" size="small" effect="dark">
                {{ getPriorityText(notice.priority) }}
              </el-tag>
            </div>
          </div>
          <div class="notice-content">
            <h4 class="notice-title">{{ notice.title }}</h4>
            <p class="notice-desc">{{ notice.content }}</p>
            <div class="notice-footer">
              <span class="notice-time">{{ notice.time }}</span>
              <span class="notice-views" v-if="notice.readCount">
                <el-icon><View /></el-icon>
                {{ notice.readCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看更多链接 -->
      <div v-if="!loading && notices.length > 0" class="view-more-section">
        <el-button type="text" class="view-more-btn" @click="goToNoticeList">
          查看更多公告
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Bell, Star, Message, InfoFilled, View, ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Announcement',
  components: {
    Bell,
    Star,
    Message,
    InfoFilled,
    View,
    ArrowRight,
  },
  props: {
    notices: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['notice-click'],
  setup() {
    const router = useRouter()

    const handleClick = (notice) => {
      router.push(`/notice/${notice.id}`)
    }

    const goToNoticeList = () => {
      router.push('/notices')
    }

    return {
      handleClick,
      goToNoticeList,
    }
  },
  methods: {
    getIconComponent(iconName) {
      const iconMap = {
        bell: Bell,
        star: Star,
        message: Message,
        info: InfoFilled,
      }
      return iconMap[iconName] || Bell
    },
    getIconColor(type) {
      const colorMap = {
        system: '#409EFF',
        activity: '#67C23A',
        maintenance: '#E6A23C',
        urgent: '#F56C6C',
        other: '#909399',
      }
      return colorMap[type] || '#409EFF'
    },
    getPriorityTagType(priority) {
      const types = {
        1: 'danger', // 高优先级 - 红色
        2: 'success', // 中优先级 - 绿色
        3: 'info', // 低优先级 - 蓝色
      }
      return types[priority] || 'info'
    },
    getPriorityText(priority) {
      const texts = {
        1: '高',
        2: '中',
        3: '低',
      }
      return texts[priority] || '未知'
    },
  },
}
</script>

<style lang="scss" scoped>
.announcement-container {
  .announcement-card {
    border: 1px solid rgba(79, 172, 254, 0.1);
    background: rgba(255, 255, 255, 0.8);

    &:deep(.el-card__body) {
      padding: 20px;
    }
  }

  .announcement-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    min-height: 120px;

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(79, 172, 254, 0.2);
      border-top: 3px solid #4facfe;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .announcement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .notice-item {
      display: flex;
      flex-direction: column;
      padding: 16px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #4facfe;
      }

      &.top-notice {
        border-color: #e6a23c;
        background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);

        &:hover {
          border-color: #e6a23c;
          box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
        }
      }

      .notice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .notice-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(79, 172, 254, 0.1);
          font-size: 18px;
        }

        .notice-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;

          .el-tag {
            font-size: 11px;
            padding: 2px 6px;
            height: auto;
            line-height: 1.2;
          }
        }
      }

      .notice-content {
        flex: 1;

        .notice-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notice-desc {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notice-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;

          .notice-time {
            font-size: 12px;
            color: #909399;
          }

          .notice-views {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #909399;

            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  .view-more-section {
    text-align: center;
    padding: 20px 0 0 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;

    .view-more-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      color: #409eff;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(64, 158, 255, 0.1);
        color: #66b1ff;
      }

      .el-icon {
        transition: transform 0.3s ease;
      }

      &:hover .el-icon {
        transform: translateX(2px);
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .announcement-container {
    .announcement-card {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(79, 172, 254, 0.2);
    }

    .notice-item {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.6));

      &:hover {
        background: rgba(79, 172, 254, 0.2);
      }

      .notice-content {
        .notice-title {
          color: #e2e8f0;
        }

        .notice-desc {
          color: #94a3b8;
        }

        .notice-time {
          color: #64748b;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .announcement-container {
    .announcement-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
}
</style>
