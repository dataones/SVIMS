<template>
  <div class="venue-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 轮播图 - 添加外层容器 -->
    <section class="venue-carousel-section">
      <venue-carousel />
    </section>

    <!-- 查询框 -->
    <venue-search @search="handleSearch" :venueTypes="venueTypes" />

    <!-- 场馆列表 -->
    <venue-list
      :venues="venueList"
      :loading="loading"
      :pagination="pagination"
      @load-more="loadMore"
      @refresh="fetchVenues"
      @venue-click="handleVenueClick"
    />
  </div>
</template>

<script>
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import VenueCarousel from './components/VenueCarousel/VenueCarousel.vue'
import VenueSearch from './components/VenueSearch/VenueSearch.vue'
import VenueList from './components/VenueList/VenueList.vue'
import { fetchVenues, mockVenueTypes } from '@/api/venue'

export default {
  name: 'VenuePage',

  components: {
    NavBar,
    VenueCarousel,
    VenueSearch,
    VenueList,
  },

  data() {
    return {
      venueList: [],
      venueTypes: mockVenueTypes,
      loading: false,
      searchParams: {
        name: '',
        type: '',
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        hasMore: true,
      },
    }
  },

  mounted() {
    this.fetchVenues()
  },

  methods: {
    async fetchVenues(resetPage = true) {
      if (resetPage) {
        this.pagination.pageNum = 1
      }

      this.loading = true
      try {
        const params = {
          ...this.searchParams,
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
        }

        const response = await fetchVenues(params)
        const data = response.data

        if (resetPage) {
          this.venueList = data.records || data.list || []
        } else {
          this.venueList = [...this.venueList, ...(data.records || data.list || [])]
        }

        // 更新分页信息
        this.pagination.total = data.total || 0
        this.pagination.hasMore =
          this.venueList.length < (data.total || 0) &&
          this.pagination.pageNum * this.pagination.pageSize < (data.total || 0)
      } catch (error) {
        console.error('获取场馆列表失败:', error)
        this.$message.error('获取场馆列表失败')
        // 开发环境使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          this.venueList = [
            {
              id: 1,
              name: '世纪篮球馆',
              type: '篮球馆',
              address: '北京市朝阳区东四环北路88号',
              price: 150.0,
              image:
                'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              description: '专业室内篮球场馆，配备标准比赛场地和先进照明系统。',
              status: 1,
            },
            {
              id: 2,
              name: '羽林羽毛球馆',
              type: '羽毛球馆',
              address: '上海市浦东新区世纪大道123号',
              price: 80.0,
              image:
                'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              description: '专业羽毛球训练基地，拥有20片标准场地。',
              status: 1,
            },
          ]
        }
      } finally {
        this.loading = false
      }
    },

    handleSearch(params) {
      this.searchParams = { ...params }
      this.fetchVenues(true)
    },

    loadMore() {
      if (!this.pagination.hasMore || this.loading) return

      this.pagination.pageNum++
      this.fetchVenues(false)
    },

    handleVenueClick(venue) {
      console.log('点击场馆:', venue)
      // 跳转到场馆详情页
      this.$router.push({
        path: `/venue/detail/${venue.id}`,
        query: { from: 'list' },
      })
    },
  },
}
</script>

<style scoped>
.venue-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 添加与HomePage一致的轮播图样式约束 */
.venue-carousel-section {
  margin-bottom: 40px;
}

/* 深度选择器影响VenueCarousel内部样式 */
:deep(.venue-carousel) {
  border-radius: 20px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}

/* 响应式设计 - 与HeroBanner保持一致 */
@media (max-width: 768px) {
  .venue-carousel-section {
    margin-bottom: 30px;
  }

  :deep(.venue-carousel) {
    border-radius: 16px !important;
  }
}
</style>
