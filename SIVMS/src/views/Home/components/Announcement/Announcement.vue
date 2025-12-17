<template>
  <div class="announcement-container">
    <el-card class="announcement-card" shadow="hover">
      <div class="announcement-grid">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          @click="handleClick(notice)"
        >
          <div class="notice-icon" :style="{ color: getIconColor(notice.type) }">
            <i :class="notice.icon"></i>
          </div>
          <div class="notice-content">
            <h4 class="notice-title">{{ notice.title }}</h4>
            <p class="notice-desc">{{ notice.content }}</p>
            <span class="notice-time">{{ notice.time }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Announcement',
  props: {
    notices: {
      type: Array,
      default: () => []
    }
  },
  emits: ['notice-click'],
  setup(props, { emit }) {
    const getIconColor = (type) => {
      const colors = {
        announcement: '#4facfe',
        activity: '#00f2fe',
        update: '#67c23a'
      }
      return colors[type] || '#909399'
    }

    const handleClick = (notice) => {
      emit('notice-click', notice)
    }

    return {
      getIconColor,
      handleClick
    }
  }
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

  .announcement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .notice-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));

      &:hover {
        background: rgba(79, 172, 254, 0.1);
        transform: translateY(-3px);
        box-shadow: 0 6px 15px rgba(79, 172, 254, 0.15);
      }

      .notice-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        background: rgba(79, 172, 254, 0.1);
        transition: all 0.3s ease;
      }

      .notice-content {
        flex: 1;

        .notice-title {
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .notice-desc {
          color: #5a6c7d;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notice-time {
          color: #909399;
          font-size: 0.8rem;
        }
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
