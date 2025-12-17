// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/UserLogin.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register/Register.vue'),
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home/Home.vue'),
    meta: { requiresAuth: true },
  },
  // 场馆详情
  {
    path: '/VenueList',
    name: 'VenueList',
    component: () => import('../views/Venue/components/VenueList/VenueList.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/venue',
    name: 'Venue',
    component: () => import('../views/Venue/Venue.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/VenueCarousel',
    name: 'VenueCarousel',
    component: () => import('../views/Venue/components/VenueCarousel/VenueCarousel.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/VenueCard',
    name: 'VenueCard',
    component: () => import('../views/Venue/components/VenueCard/VenueCard.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/VenueSearch',
    name: 'VenueSearch',
    component: () => import('../views/Venue/components/VenueSearch/VenueSearch.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/HeaderNav',
    name: 'HeaderNav',
    component: () => import('../views/Home/components/HeaderNav/HeaderNav.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/HeroBanner',
    name: 'HeroBanner',
    component: () => import('../views/Home/components/HeroBanner/HeroBanner.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/QuickActions',
    name: 'QuickActions',
    component: () => import('../views/Home/components/QuickActions/QuickActions.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/Announcement',
    name: 'Announcement',
    component: () => import('../views/Home/components/Announcement/Announcement.vue'),
    props: true,
    meta: { requiresAuth: true },
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
