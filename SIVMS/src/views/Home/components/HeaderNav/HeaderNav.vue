<template>
  <header class="header-nav">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo" @click="goToHome">
        <i class="el-icon-s-opportunity"></i>
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
              <i class="el-icon-location-information"></i>
              <span>场馆展示</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/booking">
            <i class="el-icon-date"></i>
            <span>场馆预订</span>
          </el-menu-item>

          <el-menu-item index="/OrderManagement">
            <i class="el-icon-document"></i>
            <span>订单管理</span>
          </el-menu-item>

          <el-menu-item index="equipment">
            <i class="el-icon-basketball"></i>
            <span>器材借用</span>
          </el-menu-item>

          <el-menu-item index="evaluation">
            <i class="el-icon-chat-dot-round"></i>
            <span>用户评价</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- 右侧用户区域 -->
      <div class="nav-user">
        <el-dropdown @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="36" :src="userAvatar" :icon="UserFilled" class="user-avatar" />
            <span class="user-name">{{ userName }}</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <i class="el-icon-setting"></i> 系统设置
              </el-dropdown-item>
              <el-dropdown-item command="messages" divided>
                <i class="el-icon-message"></i> 我的消息
                <el-badge :value="messageCount" v-if="messageCount > 0" />
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'HeaderNav',
  emits: ['nav-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const userStore = useUserStore()
    const activeNav = ref('venues')

    const userName = computed(() => userStore.name)
    const userAvatar = computed(() => userStore.avatar)
    const messageCount = computed(() => userStore.unreadMessages)

    const handleMenuSelect = (index) => {
      activeNav.value = index
      emit('nav-click', { key: index })
    }

    const handleUserCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          router.push('/settings')
          break
        case 'messages':
          router.push('/messages')
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
        router.push('/login')
      } catch (error) {
        ElMessage.error('退出登录失败')
      }
    }

    const goToHome = () => {
      router.push('/')
    }

    return {
      activeNav,
      userAvatar,
      userName,
      messageCount,
      UserFilled,
      handleMenuSelect,
      handleUserCommand,
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
    margin: 0 40px;

    :deep(.custom-menu) {
      border-bottom: none;
      background: transparent;

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
          font-size: 1.2rem;
          margin-right: 6px;
        }
      }

      .el-sub-menu.is-active {
        .el-sub-menu__title {
          color: #4facfe;
        }
      }

      .el-menu-item.is-active {
        color: #4facfe;
        border-bottom: 2px solid #4facfe;
      }
    }
  }

  .nav-user {
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

    .nav-user .user-info .user-name {
      display: none;
    }
  }
}
</style>
