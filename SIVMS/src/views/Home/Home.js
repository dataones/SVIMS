import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HeaderNav from './components/HeaderNav/HeaderNav.vue'
import HeroBanner from './components/HeroBanner/HeroBanner.vue'
import Announcement from './components/Announcement/Announcement.vue'
import QuickActions from './components/QuickActions/QuickActions.vue'
import VenueList from './components/VenueList/VenueList.vue'
import { getBanners, getNotices, getVenues, getQuickActions } from '@/api/home'

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

    // 响应式数据
    const banners = ref([])
    const notices = ref([])
    const quickActions = ref([])
    const venues = ref([])
    const venuesLoading = ref(false)
    const venueFilter = ref('all')

    // 计算属性
    const filteredVenues = computed(() => {
      if (venueFilter.value === 'all') {
        return venues.value
      }
      return venues.value.filter((venue) => venue.type === venueFilter.value)
    })

    // 方法
    const loadHomeData = async () => {
      try {
        venuesLoading.value = true

        // 并行加载数据
        const [bannersData, noticesData, actionsData, venuesData] = await Promise.all([
          getBanners(),
          getNotices(),
          getQuickActions(),
          getVenues(),
        ])

        banners.value = bannersData
        notices.value = noticesData
        quickActions.value = actionsData
        venues.value = venuesData
      } catch (error) {
        console.error('加载主页数据失败:', error)
        ElMessage.error('数据加载失败，请刷新重试')
      } finally {
        venuesLoading.value = false
      }
    }

    const handleQuickAction = (action) => {
      console.log('快捷操作:', action)
      const actionRoutes = {
        booking: '/booking',
        orders: '/OrderManagement',
        payment: '/payment',
        equipment: '/equipment',
        evaluation: '/evaluation',
        search: '/venues/search',
      }

      if (actionRoutes[action.id]) {
        router.push(actionRoutes[action.id])
      } else {
        ElMessage.info(`功能开发中: ${action.title}`)
      }
    }

    const handleBannerClick = (banner) => {
      console.log('轮播图点击:', banner)
      if (banner.link) {
        router.push(banner.link)
      }
    }

    const handleNoticeClick = (notice) => {
      console.log('公告点击:', notice)
      // 可以跳转到公告详情页
      router.push(`/notice/${notice.id}`)
    }

    const handleVenueClick = (venue) => {
      console.log('场馆点击:', venue)
      router.push(`/venues/${venue.id}`)
    }

    const handleBookingClick = (venue) => {
      console.log('立即预订:', venue)
      router.push({
        path: '/booking',
        query: { venueId: venue.id },
      })
    }

    const viewAllVenues = () => {
      router.push('/venues')
    }

    const viewAllAnnouncements = () => {
      router.push('/notices')
    }

    const filterVenues = () => {
      console.log('筛选场馆类型:', venueFilter.value)
    }

    const goToPage = (page) => {
      const pageRoutes = {
        venues: '/venues',
        booking: '/booking',
        orders: '/OrderManagement',
        equipment: '/equipment',
        help: '/help',
        faq: '/faq',
        contact: '/contact',
        feedback: '/feedback',
        about: '/about',
        terms: '/terms',
        privacy: '/privacy',
        join: '/join',
      }

      if (pageRoutes[page]) {
        router.push(pageRoutes[page])
      }
    }

    // 生命周期
    onMounted(() => {
      loadHomeData()
    })

    return {
      // 数据
      banners,
      notices,
      quickActions,
      venues,
      venuesLoading,
      venueFilter,

      // 计算属性
      filteredVenues,

      // 方法

      handleQuickAction,
      handleBannerClick,
      handleNoticeClick,
      handleVenueClick,
      handleBookingClick,
      viewAllVenues,
      viewAllAnnouncements,
      filterVenues,
      goToPage,
    }
  },
}
