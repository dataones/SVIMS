<template>
  <header class="header-nav">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo" @click="goToHome">
        <el-icon><Star /></el-icon>
        <span class="logo-text">体育场馆管理系统</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <el-menu
          mode="horizontal"
          :default-active="activeNav"
          @select="handleMenuSelect"
          class="custom-menu"
          router
        >
          <el-menu-item index="/venue">
            <template #title>
              <el-icon><LocationInformation /></el-icon>
              <span>场馆展示</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/booking">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>场馆预订</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/OrderManagement">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/equipment">
            <template #title>
              <el-icon><Star /></el-icon>
              <span>器材借用</span>
            </template>
          </el-menu-item>

          <!-- 故障申报 - 根据用户角色显示不同页面 -->
          <el-menu-item v-if="!isAdmin" index="/fault/report">
            <template #title>
              <el-icon><Warning /></el-icon>
              <span>故障申报</span>
            </template>
          </el-menu-item>

          <el-menu-item v-if="isAdmin" index="/fault/management">
            <template #title>
              <el-icon><Warning /></el-icon>
              <span>故障管理</span>
            </template>
          </el-menu-item>

          <!-- 管理员专属：审批管理 -->
          <el-menu-item v-if="isAdmin" index="/approval">
            <template #title>
              <el-icon><Check /></el-icon>
              <span>审批管理</span>
            </template>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- 右侧用户区域 -->
      <div class="nav-user">
        <!-- 管理员标识 -->
        <el-tag v-if="isAdmin" type="danger" size="small" class="admin-tag">
          <template #default>
            <el-icon><UserFilled /></el-icon>
            <span class="admin-text">管理员</span>
          </template>
        </el-tag>

        <!-- 未登录状态：显示登录和注册链接 -->
        <div v-if="!isLogin" class="auth-links">
          <el-button type="primary" size="small" @click="handleLogin">
            <el-icon><User /></el-icon>
            登录
          </el-button>
          <el-button type="success" size="small" @click="handleRegister">
            <el-icon><Plus /></el-icon>
            注册
          </el-button>
        </div>

        <!-- 已登录状态：显示用户下拉菜单 -->
        <el-dropdown v-else @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="36" :src="userAvatar" :icon="UserFilled" class="user-avatar" />
            <span class="user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="myReviews">
                <el-icon><Star /></el-icon> 我的评论
              </el-dropdown-item>
              <!-- 管理员专属菜单 -->
              <el-dropdown-item v-if="isAdmin" command="noticeManage" divided>
                <el-icon><Bell /></el-icon> 通知管理
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="userManage">
                <el-icon><UserFilled /></el-icon> 用户管理
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="adminPanel" divided>
                <el-icon><Tools /></el-icon> 管理后台
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Star,
  LocationInformation,
  Calendar,
  Document,
  Warning,
  Check,
  UserFilled,
  User,
  ArrowDown,
  Setting,
  Message,
  Tools,
  SwitchButton,
  Bell,
  Plus,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'HeaderNav',
  components: {
    Star,
    LocationInformation,
    Calendar,
    Document,
    Warning,
    Check,
    UserFilled,
    User,
    ArrowDown,
    Setting,
    Message,
    Tools,
    SwitchButton,
    Bell,
    Plus,
  },
  emits: ['nav-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()

    // 根据当前路由设置激活的导航项
    const activeNav = computed(() => {
      const path = route.path

      // 路径映射到导航项
      const pathToNavMap = {
        '/venue': '/venue',
        '/booking': '/booking',
        '/OrderManagement': '/OrderManagement',
        '/equipment': '/equipment',
        '/fault/report': '/fault/report',
        '/fault/management': '/fault/management',
        '/approval': '/approval',
      }

      return pathToNavMap[path] || ''
    })

    const userName = computed(() => userStore.name || '用户')
    const userAvatar = computed(() => userStore.avatar)
    const messageCount = computed(() => userStore.unreadMessages || 0)

    // 判断是否登录
    const isLogin = computed(() => userStore.isLogin)

    // 判断是否为管理员
    const isAdmin = computed(() => {
      // 根据数据库角色定义：0-普通用户, 1-会员, 2-管理员
      return userStore.role === 2 || userStore.userType === 2 || userStore.isAdmin
    })

    const handleMenuSelect = (index) => {
      emit('nav-click', { key: index })
    }

    const handleLogin = () => {
      router.push('/login')
    }

    const handleRegister = () => {
      router.push('/register')
    }

    const handleUserCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'myReviews':
          // 我的评论在新页面打开
          window.open('/my-reviews', '_blank')
          break
        case 'noticeManage':
          // 通知管理在新页面打开
          window.open('/notice-manage', '_blank')
          break
        case 'userManage':
          // 用户管理在新页面打开
          window.open('/user-manage', '_blank')
          break
        case 'adminPanel':
          router.push('/resourceManage')
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = async () => {
      try {
        await userStore.logout()
        ElMessage.success('已退出登录')
        // 退出后留在主页，不跳转到登录页
        router.push('/')
      } catch (error) {
        ElMessage.error('退出登录失败')
      }
    }

    const goToHome = () => {
      router.push('/')
    }

    return {
      activeNav,
      isLogin,
      userAvatar,
      userName,
      messageCount,
      isAdmin,
      UserFilled,
      handleMenuSelect,
      handleUserCommand,
      handleLogin,
      handleRegister,
      goToHome,
    }
  },
}
</script>

<style lang="scss" scoped>
.header-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(79, 172, 254, 0.1);
  box-shadow: 0 2px 12px rgba(79, 172, 254, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
    }

    i {
      font-size: 2rem;
      color: transparent;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .logo-text {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      letter-spacing: 0.5px;
    }
  }

  .nav-menu {
    flex: 1;
    margin: 0 20px;

    :deep(.custom-menu) {
      border-bottom: none;
      background: transparent;

      .el-menu-item {
        padding: 0 12px;
        min-width: fit-content;
      }

      .el-sub-menu,
      .el-menu-item {
        height: 62px;
        line-height: 62px;
        font-weight: 500;
        color: #5a6c7d;

        &:hover {
          color: #4facfe;
          background: rgba(79, 172, 254, 0.05);

          i {
            color: #4facfe;
          }
        }

        i {
          font-size: 1.1rem;
          margin-right: 6px;
        }
      }

      .el-sub-menu.is-active {
        .el-sub-menu__title {
          color: #4facfe;
          background: rgba(79, 172, 254, 0.05);

          &:hover {
            background: rgba(79, 172, 254, 0.08);
          }
        }
      }

      .el-menu-item.is-active {
        color: #4facfe;
        border-bottom: 2px solid #4facfe;
        background: rgba(79, 172, 254, 0.05);

        &:hover {
          background: rgba(79, 172, 254, 0.08);
        }
      }
    }
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 15px;

    .admin-tag {
      background: linear-gradient(135deg, #00f2fe 100%) !important;
      border: none !important;
      color: white !important;
      font-weight: 500 !important;
      padding: 6px 10px !important;
      font-size: 0.75rem !important;
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      min-width: fit-content !important;
      height: auto !important;
      line-height: 1 !important;
      border-radius: 4px !important;

      .el-icon {
        font-size: 0.8rem !important;
        flex-shrink: 0 !important;
        margin-right: 2px !important;
        display: inline-block !important;
        vertical-align: middle !important;
      }

      .admin-text {
        display: inline-block !important;
        white-space: nowrap !important;
        vertical-align: middle !important;
      }
    }

    .auth-links {
      display: flex;
      align-items: center;
      gap: 10px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.85rem;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.15);
        }

        .el-icon {
          font-size: 0.9rem;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(79, 172, 254, 0.1);
      }

      .user-avatar {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .user-name {
        font-weight: 500;
        color: #2c3e50;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-icon-arrow-down {
        color: #9ca3af;
        font-size: 0.8rem;
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  .header-nav {
    background: rgba(30, 41, 59, 0.95);
    border-bottom-color: rgba(79, 172, 254, 0.2);

    .nav-logo .logo-text {
      color: #e2e8f0;
    }

    .nav-user .user-info .user-name {
      color: #e2e8f0;
    }
  }
}

@media (max-width: 992px) {
  .header-nav {
    .nav-container {
      padding: 0 15px;
    }

    .nav-logo .logo-text {
      display: none;
    }

    .nav-menu {
      margin: 0 20px;

      :deep(.custom-menu) {
        .el-sub-menu__title,
        .el-menu-item {
          span {
            display: none;
          }

          i {
            margin-right: 0;
          }
        }
      }
    }

    .nav-user {
      gap: 10px;

      .admin-tag {
        padding: 3px 6px;
        font-size: 0.7rem;

        span {
          display: inline;
        }

        .el-icon {
          font-size: 0.7rem;
        }
      }

      .user-info .user-name {
        display: none;
      }
    }
  }
}
</style>
