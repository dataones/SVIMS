<template>
  <div class="hero-banner">
    <div v-if="loading" class="banner-loading">
      <div class="loading-spinner"></div>
      <p>加载轮播图中...</p>
    </div>
    <el-carousel
      v-else
      :interval="interval"
      :autoplay="autoplay"
      height="400px"
      indicator-position="outside"
      arrow="always"
    >
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <div class="banner-item" @click="handleClick(banner)">
          <img
            :src="banner.image_url || banner.imageUrl || banner.image"
            :alt="banner.title"
            class="banner-image"
          />
          <div class="banner-content">
            <h3 class="banner-title">{{ banner.title }}</h3>
            <p class="banner-description">{{ banner.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
export default {
  name: 'HeroBanner',
  props: {
    banners: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    interval: {
      type: Number,
      default: 5000,
    },
  },
  emits: ['banner-click'],
  setup(props, { emit }) {
    const handleClick = (banner) => {
      emit('banner-click', banner)
    }

    return {
      handleClick,
    }
  },
}
</script>

<style lang="scss" scoped>
.hero-banner {
  position: relative;

  .banner-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
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

  :deep(.el-carousel) {
    .el-carousel__container {
      border-radius: 20px;
      overflow: hidden;
    }

    .el-carousel__arrow {
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      i {
        color: #4facfe;
        font-size: 1.5rem;
      }
    }

    .el-carousel__indicators {
      .el-carousel__indicator {
        .el-carousel__button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
        }

        &.is-active .el-carousel__button {
          background: #4facfe;
          width: 24px;
          border-radius: 4px;
        }
      }
    }
  }

  .banner-item {
    position: relative;
    height: 100%;
    cursor: pointer;

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    &:hover .banner-image {
      transform: scale(1.05);
    }

    .banner-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      color: white;

      .banner-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }

      .banner-description {
        font-size: 1.2rem;
        margin-bottom: 20px;
        max-width: 600px;
        opacity: 0.9;
      }

      .banner-button {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border: none;
        font-weight: 600;
        padding: 12px 30px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .hero-banner {
    :deep(.el-carousel) {
      height: 300px;
    }

    .banner-item .banner-content {
      padding: 20px;

      .banner-title {
        font-size: 1.8rem;
      }

      .banner-description {
        font-size: 1rem;
      }

      .banner-button {
        padding: 10px 20px;
        font-size: 0.9rem;
      }
    }
  }
}
</style>
