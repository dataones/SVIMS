<template>
  <div class="venue-carousel">
    <!-- 轮播图容器 -->
    <div class="carousel-container" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
      <!-- 轮播图片 - 改为使用img标签 -->
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <img :src="slide.image" :alt="slide.title" class="slide-image" />
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <div class="slide-tag">{{ slide.tag }}</div>
            <h2 class="slide-title">{{ slide.title }}</h2>
            <p class="slide-desc">{{ slide.description }}</p>
            <button class="slide-btn" @click.stop="handleSlideClick(slide)">
              {{ slide.buttonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- 轮播导航 -->
      <button class="carousel-nav prev" @click.stop="prevSlide">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button class="carousel-nav next" @click.stop="nextSlide">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- 轮播指示器 -->
      <div class="carousel-indicators">
        <button
          v-for="(_, index) in slides"
          :key="index"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click.stop="goToSlide(index)"
          :aria-label="`切换到第 ${index + 1} 张轮播图`"
        >
          <div class="indicator-progress" v-if="currentIndex === index"></div>
        </button>
      </div>

      <!-- 当前图片指示 -->
      <div class="slide-counter">
        <span class="current-index">{{ currentIndex + 1 }}</span>
        <span class="divider">/</span>
        <span class="total-slides">{{ slides.length }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'VenueCarousel',

  data() {
    return {
      currentIndex: 0,
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
          title: '专业运动场馆',
          description: '提供最专业的运动场地和设备，满足您的各种运动需求',
          tag: '热门推荐',
          buttonText: '立即预订',
          link: '/booking',
        },
        {
          image:
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
          title: '多种运动选择',
          description: '篮球、羽毛球、游泳、健身等多种项目，一应俱全',
          tag: '运动多样',
          buttonText: '探索场馆',
          link: '/venue',
        },
        {
          image:
            'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
          title: '优质服务体验',
          description: '为您提供舒适便捷的运动环境，专业团队全程服务',
          tag: '服务至上',
          buttonText: '查看详情',
          link: '/venue?sort=rating',
        },
        {
          image:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
          title: '智能预约系统',
          description: '在线预约，实时查看场馆状态，方便快捷',
          tag: '智能便捷',
          buttonText: '开始预约',
          link: '/booking',
        },
      ],
      autoPlayInterval: null,
      isAutoPlaying: true,
      intervalTime: 5000,
    }
  },

  mounted() {
    this.startAutoPlay()
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },

  beforeUnmount() {
    this.stopAutoPlay()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },

  methods: {
    startAutoPlay() {
      this.stopAutoPlay()
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide()
      }, this.intervalTime)
      this.isAutoPlaying = true
    },

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval)
        this.autoPlayInterval = null
      }
      this.isAutoPlaying = false
    },

    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length
    },

    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length
    },

    goToSlide(index) {
      this.currentIndex = index
      this.startAutoPlay()
    },

    handleSlideClick(slide) {
      console.log('点击轮播图:', slide)
      // 跳转到对应页面
      this.$router.push(slide.link)
    },

    handleVisibilityChange() {
      if (document.hidden) {
        this.stopAutoPlay()
      } else {
        this.startAutoPlay()
      }
    },
  },
}
</script>

<style src="./VenueCarousel.css"></style>
