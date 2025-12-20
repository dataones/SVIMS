<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <HeaderNav @nav-click="handleNavClick" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 轮播图区域 -->
      <section class="hero-section">
        <HeroBanner :banners="banners" />
      </section>

      <!-- 公告和活动通知 -->
      <section class="announcement-section">
        <div class="section-header">
          <h2><i class="el-icon-message"></i> 最新动态</h2>
          <el-link type="primary" :underline="false" @click="viewAll">
            查看更多 <i class="el-icon-arrow-right"></i>
          </el-link>
        </div>
        <Announcement :notices="notices" />
      </section>

      <!-- 快捷操作 -->
      <section class="quick-actions-section">
        <QuickActions :actions="quickActions" @action-click="handleQuickAction" />
      </section>

      <!-- 场馆展示 -->
      <section class="venues-section">
        <div class="section-header">
          <h2><i class="el-icon-location-information"></i> 推荐场馆</h2>
          <el-button type="primary" plain @click="viewAllVenues">
            <i class="el-icon-view"></i> 查看所有场馆
          </el-button>
        </div>
        <VenueList :venues="featuredVenues" />
      </section>

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
          <a href="https://beian.miit.gov.cn/" target="_blank" style="color: aliceblue;">渝ICP备2025076592号</a>
        </div>

      </footer>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HeaderNav from './components/HeaderNav/HeaderNav.vue'
import HeroBanner from './components/HeroBanner/HeroBanner.vue'
import Announcement from './components/Announcement/Announcement.vue'
import QuickActions from './components/QuickActions/QuickActions.vue'
import VenueList from './components/VenueList/VenueList.vue'

export default {
  name: 'HomePage',
  components: {
    HeaderNav,
    HeroBanner,
    Announcement,
    QuickActions,
    VenueList,
  },
  setup() {
    const router = useRouter()

    // 轮播图数据
    const banners = ref([
      {
        id: 1,
        title: '全新篮球馆正式开放',
        description: '专业级篮球场地，配备最新设施',
        image:
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
        link: '/venues/1',
      },
      {
        id: 2,
        title: '游泳馆暑期特惠',
        description: '清凉一夏，泳池月卡限时优惠',
        image:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
        link: '/venues/2',
      },
      {
        id: 3,
        title: '健身中心全新升级',
        description: '引进国际先进健身设备',
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
        link: '/venues/3',
      },
    ])

    // 公告数据
    const notices = ref([
      {
        type: 'announcement',
        title: '系统维护通知',
        content: '系统将于本周六凌晨2:00-4:00进行维护',
        time: '2024-01-10',
        icon: 'el-icon-message',
      },
      {
        type: 'activity',
        title: '新年特别活动',
        content: '春节期间所有场馆享受8折优惠',
        time: '2024-01-08',
        icon: 'el-icon-star',
      },
      {
        type: 'update',
        title: '系统功能更新',
        content: '新增了场馆评价功能，欢迎体验',
        time: '2024-01-05',
        icon: 'el-icon-refresh',
      },
    ])

    // 快捷操作
    const quickActions = ref([
      {
        id: 'booking',
        title: '场馆预订',
        icon: 'el-icon-date',
        description: '快速预约心仪场馆',
        color: '#4facfe',
        bgColor: 'rgba(79, 172, 254, 0.1)',
      },
      {
        id: 'orders',
        title: '我的订单',
        icon: 'el-icon-document',
        description: '查看订单详情',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
      {
        id: 'payment',
        title: '费用结算',
        icon: 'el-icon-money',
        description: '在线支付订单费用',
        color: '#4facfe',
        bgColor: 'rgba(79, 172, 254, 0.1)',
      },
      {
        id: 'equipment',
        title: '器材借用',
        icon: 'el-icon-basketball',
        description: '申请借用运动器材',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
      {
        id: 'evaluation',
        title: '用户评价',
        icon: 'el-icon-chat-dot-round',
        description: '分享您的体验',
        color: '#4facfe',
        bgColor: 'rgba(79, 172, 254, 0.1)',
      },
      {
        id: 'search',
        title: '场馆搜索',
        icon: 'el-icon-search',
        description: '快速查找场馆',
        color: '#00f2fe',
        bgColor: 'rgba(0, 242, 254, 0.1)',
      },
    ])

    // 推荐场馆
    const featuredVenues = ref([
      {
        id: 1,
        name: '标准篮球馆',
        type: '篮球',
        location: '体育中心A区',
        capacity: '50人',
        price: 200,
        rating: 4.8,
        image:
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        status: 'available',
      },
      {
        id: 2,
        name: '专业游泳馆',
        type: '游泳',
        location: '游泳中心',
        capacity: '100人',
        price: 150,
        rating: 4.9,
        image:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        status: 'available',
      },
      {
        id: 3,
        name: '综合健身中心',
        type: '健身',
        location: '健身大楼',
        capacity: '200人',
        price: 300,
        rating: 4.7,
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        status: 'available',
      },
      {
        id: 4,
        name: '室内网球场',
        type: '网球',
        location: '网球中心',
        capacity: '30人',
        price: 250,
        rating: 4.6,
        image:
          'https://images.unsplash.com/photo-1622279457486-62dcc4a431f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        status: 'maintenance',
      },
    ])

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
        orders: '/orders',
        payment: '/payment',
        equipment: '/equipment/borrow',
        evaluation: '/evaluation',
        search: '/venues/search',
      }

      if (actionRoutes[action.id]) {
        router.push(actionRoutes[action.id])
      }
    }

    // 查看所有
    const viewAll = () => {
      router.push('/notices')
    }

    // 查看所有场馆
    const viewAllVenues = () => {
      router.push('/venues')
    }

    // 生命周期
    onMounted(() => {
      console.log('Home页面加载完成')
    })

    return {
      banners,
      notices,
      quickActions,
      featuredVenues,
      handleNavClick,
      handleQuickAction,
      viewAll,
      viewAllVenues,
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

      i {
        color: #4facfe;
        font-size: 1.6rem;
      }
    }

    .el-link {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;

      i {
        transition: transform 0.3s ease;
      }

      &:hover {
        i {
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
