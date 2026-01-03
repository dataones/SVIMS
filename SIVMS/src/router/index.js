// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    //登录
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/UserLogin.vue'),
  },
  {
    //注册
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register/Register.vue'),
  },
  {
    //默认访问
    path: '/',
    redirect: '/Home',
  },
  {
    //首页
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home/Home.vue'),
    //meta: { requiresAuth: true },
  },
  // 场馆列表
  {
    path: '/VenueList',
    name: 'VenueList',
    component: () => import('../views/Venue/components/VenueList/VenueList.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //场馆
    path: '/venue',
    name: 'Venue',
    component: () => import('../views/Venue/Venue.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //场馆轮播图
    path: '/VenueCarousel',
    name: 'VenueCarousel',
    component: () => import('../views/Venue/components/VenueCarousel/VenueCarousel.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //场馆卡片
    path: '/VenueCard',
    name: 'VenueCard',
    component: () => import('../views/Venue/components/VenueCard/VenueCard.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //场馆搜索
    path: '/VenueSearch',
    name: 'VenueSearch',
    component: () => import('../views/Venue/components/VenueSearch/VenueSearch.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //首页导航栏
    path: '/HeaderNav',
    name: 'HeaderNav',
    component: () => import('../views/Home/components/HeaderNav/HeaderNav.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //首页banner
    path: '/HeroBanner',
    name: 'HeroBanner',
    component: () => import('../views/Home/components/HeroBanner/HeroBanner.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //首页快速操作
    path: '/QuickActions',
    name: 'QuickActions',
    component: () => import('../views/Home/components/QuickActions/QuickActions.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //首页公告
    path: '/Announcement',
    name: 'Announcement',
    component: () => import('../views/Home/components/Announcement/Announcement.vue'),
    props: true,
    //meta: { requiresAuth: true },
  },
  {
    //预订页面
    path: '/Booking',
    name: 'Booking',
    component: () => import('../views/booking/BookingPage.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    //订单页面
    path: '/Order',
    name: 'Order',
    component: () => import('../views/OrderPage/OrderPage.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    //订单管理页面
    path: '/OrderManagement',
    name: 'OrderManagement',
    component: () => import('../views/OrderPage/OrderManagement.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    //订单支付
    path: '/OrderPay',
    name: 'OrderPay',
    component: () => import('../views/OrderPage/OrderPay.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  //器材
  {
    path: '/equipment',
    name: 'Equipment',
    component: () => import('../views/equipment/EquipmentPage.vue'),
    //meta: { requiresAuth: true },
  },
  {
    path: '/reviews',
    name: 'VenueReviews',
    component: () => import('../views/enueReviews/enueReviews.vue'),
    meta: { title: '场馆评价' },
  },
  // router/index.js
  {
    path: '/order/review/:orderId',
    name: 'OrderReview',
    component: () => import('@/views/orderReview/OrderReview.vue'),
  },
  {
    path: '/venue/details/:venueId',
    name: 'VenueDetails',
    component: () => import('../views/VenueDetails/VenueDetails.vue'),
    props: (route) => ({
      venueId: Number(route.params.venueId),
    }),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile/Profile.vue'),
    meta: { requiresAuth: true },
  },
  // 审批页面
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('../views/Approval/Approval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/equipmentManage',
    name: 'EquipmentManage',
    component: () => import('../views/admin/EquipmentManage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/venueManage',
    name: 'VenueManage',
    component: () => import('../views/admin/VenueManage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/resourceManage',
    name: 'ResourceManage',
    component: () => import('../views/admin/ResourceManage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reviewComponents',
    name: 'ReviewComponents',
    component: () => import('../components/ReviewComponent.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局路由守卫：登录保护
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
