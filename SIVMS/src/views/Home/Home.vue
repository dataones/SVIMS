<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <HeaderNav @nav-click="handleNavClick" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 轮播图区域 -->
      <section class="hero-section">
        <HeroBanner :banners="banners" :loading="bannersLoading" />
      </section>

      <!-- 公告和活动通知 -->
      <section class="announcement-section">
        <div class="section-header">
          <h2>
            <el-icon><Message /></el-icon> 最新动态
          </h2>
          
        </div>
        <Announcement :notices="notices" :loading="noticesLoading" />
      </section>

      <!-- 快捷操作 -->
      <section class="quick-actions-section">
        <QuickActions :actions="quickActions" @action-click="handleQuickAction" />
      </section>

      <!-- 场馆展示 -->
      <section class="venues-section">
        <div class="section-header">
          <h2>
            <el-icon><Location /></el-icon> 推荐场馆
          </h2>
          <el-button type="primary" plain @click="viewAllVenues">
            <el-icon><View /></el-icon> 查看所有场馆
          </el-button>
        </div>
        <RecommendedVenues @venue-click="goToVenueDetail" @booking-click="handleBooking" />
      </section>

      <div>
        <!-- 底部信息 -->
        <footer class="home-footer">
          <div class="footer-content">
            <div class="footer-section">
              <h3>
                <el-icon><Star /></el-icon> 体育场馆综合管理系统
              </h3>
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
            2025 体育场馆综合管理系统. All rights reserved.
            <div>
              <img
                src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
                alt="渝公网安备"
                style="width: 20px; height: 20px; margin-right: 5px; vertical-align: middle"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"
              />
              <span
                style="
                  display: none;
                  width: 20px;
                  height: 20px;
                  background: #1e40af;
                  border-radius: 3px;
                  margin-right: 5px;
                  vertical-align: middle;
                "
              ></span>
              <a
                href="https://beian.mps.gov.cn/#/query/webSearch"
                target="_blank"
                style="color: aliceblue; text-decoration: none"
              >
                渝公网安备50024002000227号</a
              ><span> · </span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                style="color: aliceblue; text-decoration: none"
                >渝ICP备2025076592号-1</a
              >
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, ArrowRight, Location, View, Star } from '@element-plus/icons-vue'
import { getActiveBanners } from '@/api/banner'
import { getLatestNotices } from '@/api/notice'
import HeaderNav from './components/HeaderNav/HeaderNav.vue'
import HeroBanner from './components/HeroBanner/HeroBanner.vue'
import Announcement from './components/Announcement/Announcement.vue'
import QuickActions from './components/QuickActions/QuickActions.vue'
import RecommendedVenues from '@/components/RecommendedVenues/RecommendedVenues.vue'

export default {
  name: 'HomePage',
  components: {
    HeaderNav,
    HeroBanner,
    Announcement,
    QuickActions,
    RecommendedVenues,
  },
  setup() {
    const router = useRouter()

    // 公告数据
    const notices = ref([])
    const noticesLoading = ref(false)

    // 获取公告数据
    const fetchNotices = async () => {
      try {
        noticesLoading.value = true
        // 使用专门的接口获取最新4个公告
        const response = await getLatestNotices(4)
        if (response.code === 200 && response.data) {
          // 转换数据格式
          notices.value = response.data.map((notice) => ({
            ...notice,
            time: formatDate(notice.publishTime || notice.createTime),
            icon: getIconByType(notice.title),
          }))
        } else {
          ElMessage.error(response.message || '获取公告失败')
          notices.value = []
        }
      } catch (error) {
        console.error('获取公告失败:', error)
        ElMessage.error('获取公告失败')
        notices.value = []
      } finally {
        noticesLoading.value = false
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    }

    // 根据标题获取图标
    const getIconByType = (title) => {
      if (title.includes('维护') || title.includes('系统')) return 'Message'
      if (title.includes('活动') || title.includes('优惠')) return 'Star'
      if (title.includes('更新') || title.includes('功能')) return 'Refresh'
      if (title.includes('升级') || title.includes('设施')) return 'Tools'
      if (title.includes('会员') || title.includes('权益')) return 'User'
      return 'Message'
    }

    // 快捷操作
    const quickActions = ref([
      {
        id: 'booking',
        title: '场馆预订',
        icon: 'Calendar',
        description: '快速预约心仪场馆',
        color: '#4facfe',
        bgColor: 'rgba(79, 172, 254, 0.1)',
      },
      {
        id: 'orders',
        title: '我的订单',
        icon: 'Document',
        description: '查看订单详情',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
      {
        id: 'equipment',
        title: '器材借用',
        icon: 'Star',
        description: '申请借用运动器材',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
      {
        id: 'search',
        title: '场馆搜索',
        icon: 'Search',
        description: '快速查找场馆',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
    ])

    // 轮播图数据
    const banners = ref([])
    const bannersLoading = ref(false)

    // 获取轮播图数据
    const fetchBanners = async () => {
      try {
        bannersLoading.value = true
        const response = await getActiveBanners()
        if (response.code === 200) {
          banners.value = response.data || []
        } else {
          ElMessage.error(response.message || '获取轮播图失败')
          banners.value = []
        }
      } catch (error) {
        console.error('获取轮播图失败:', error)
        ElMessage.error('获取轮播图失败')
        banners.value = []
      } finally {
        bannersLoading.value = false
      }
    }

    // 处理导航点击
    const handleNavClick = (navItem) => {
      console.log('导航点击:', navItem)
      switch (navItem.key) {
        case 'venues':
          router.push('/venues')
          break
        case 'booking':
          router.push('/booking')
          break
        case 'equipment':
          router.push('/equipment')
          break
      }
    }

    // 处理快捷操作点击
    const handleQuickAction = (action) => {
      console.log('快捷操作:', action)
      const actionRoutes = {
        booking: '/booking',
        orders: '/OrderManagement',
        equipment: '/equipment',
        search: '/venue',
      }

      if (actionRoutes[action.id]) {
        router.push(actionRoutes[action.id])
      }
    }

    // 查看所有
    const viewAll = () => {
      router.push('/resourceManage')
    }

    // 查看所有场馆
    const viewAllVenues = () => {
      router.push('/venues')
    }

    // 跳转到场馆详情
    const goToVenueDetail = (venue) => {
      // 修复地址错误，确保传递正确的venue.id
      if (venue && venue.id) {
        router.push(`/venue/details/${venue.id}`)
      } else {
        console.error('场馆信息无效:', venue)
        ElMessage.error('场馆信息无效')
      }
    }

    // 立即预订功能
    const handleBooking = (venue) => {
      if (venue && venue.id) {
        router.push({
          path: '/Order',
          query: { venueId: venue.id },
        })
      } else {
        console.error('场馆信息无效:', venue)
        ElMessage.error('场馆信息无效')
      }
    }

    // 生命周期
    onMounted(() => {
      fetchBanners()
      fetchNotices()
      // 组件内部会自动加载数据
    })

    return {
      banners,
      bannersLoading,
      notices,
      noticesLoading,
      quickActions,
      handleNavClick,
      handleQuickAction,
      viewAll,
      viewAllVenues,
      goToVenueDetail,
      handleBooking,
    }
  },
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  position: relative;

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  // 各个区域样式
  .hero-section {
    margin-bottom: 40px;

    &:deep(.hero-banner) {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(79, 172, 254, 0.2);

    h2 {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;

      .el-icon {
        color: #4facfe;
        font-size: 1.6rem;
      }
    }

    .el-link {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;

      .el-icon {
        transition: transform 0.3s ease;
      }

      &:hover {
        .el-icon {
          transform: translateX(3px);
        }
      }
    }
  }

  .announcement-section,
  .quick-actions-section,
  .venues-section {
    margin-bottom: 60px;
  }

  // 底部样式
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

          .el-icon {
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
}

// 响应式设计
@media (max-width: 768px) {
  .home-container {
    .main-content {
      padding: 15px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .home-footer {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 30px;
        text-align: center;

        .footer-section {
          h3 {
            justify-content: center;
          }

          h4::after {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .home-container {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);

    .section-header {
      h2 {
        color: #e2e8f0;
      }
    }

    .home-footer {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
  }
}
</style>
