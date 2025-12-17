<template>
  <div class="quick-actions-container">
    <div class="actions-grid">
      <div
        v-for="action in actions"
        :key="action.id"
        class="action-item"
        :style="{ '--action-color': action.color, '--action-bg': action.bgColor }"
        @click="handleClick(action)"
      >
        <div class="action-icon">
          <i :class="action.icon"></i>
        </div>
        <div class="action-content">
          <h4 class="action-title">{{ action.title }}</h4>
          <p class="action-desc">{{ action.description }}</p>
        </div>
        <div class="action-arrow">
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['action-click'],
  setup(props, { emit }) {
    const handleClick = (action) => {
      emit('action-click', action)
    }

    return {
      handleClick
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-actions-container {
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .action-item {
      background: var(--action-bg);
      border: 2px solid var(--action-color);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--action-color), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(79, 172, 254, 0.2);

        &::before {
          opacity: 0.1;
        }

        .action-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .action-arrow {
          transform: translateX(5px);
        }
      }

      .action-icon {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background: var(--action-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;
      }

      .action-content {
        flex: 1;
        position: relative;
        z-index: 1;

        .action-title {
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .action-desc {
          color: #5a6c7d;
          font-size: 0.85rem;
          line-height: 1.4;
        }
      }

      .action-arrow {
        color: var(--action-color);
        font-size: 1.2rem;
        transition: transform 0.3s ease;
        position: relative;
        z-index: 1;
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .quick-actions-container {
    .action-item {
      .action-content {
        .action-title {
          color: #e2e8f0;
        }

        .action-desc {
          color: #94a3b8;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-actions-container {
    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
  }
}

@media (max-width: 480px) {
  .quick-actions-container {
    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
