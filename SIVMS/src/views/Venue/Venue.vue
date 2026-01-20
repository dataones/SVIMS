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
            >渝ICP备2025076592号-2</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import VenueCarousel from './components/VenueCarousel/VenueCarousel.vue'
import VenueSearch from './components/VenueSearch/VenueSearch.vue'
import VenueList from './components/VenueList/VenueList.vue'
import { fetchVenues, mockVenueTypes } from '@/api/venue'
import { devtools } from 'globals'

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
      // 跳转到场馆详情页（移除 query 参数）
      this.$router.push({
        path: `/venue/details/${venue.id}`,
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
