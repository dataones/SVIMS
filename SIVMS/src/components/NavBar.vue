<template>
  <div class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <h2>体育场馆管理系统</h2>
        </router-link>
      </div>

      <div class="navbar-menu">
        <el-menu mode="horizontal" :default-active="activeIndex" router class="main-menu">
          <el-menu-item index="/home">首页</el-menu-item>
          <el-menu-item index="/venue">场馆</el-menu-item>
          <el-menu-item index="/equipment">器材</el-menu-item>
          <el-menu-item index="/reviews">评价</el-menu-item>
        </el-menu>
      </div>

      <div class="navbar-user">
        <template v-if="isLogin">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar">
                {{ userInfo.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item command="reviews" v-if="userInfo.role === 2"
                  >评价管理</el-dropdown-item
                >
                <el-dropdown-item command="reviewManage" v-if="userInfo.role === 2"
                  >评价审核</el-dropdown-item
                >
                <el-dropdown-item command="refundManage" v-if="userInfo.role === 2"
                  >退款管理</el-dropdown-item
                >
                <el-dropdown-item command="admin" v-if="userInfo.role === 2"
                  >管理后台</el-dropdown-item
                >
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="goToLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'NavBar',
  components: {
    ArrowDown,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    // 响应式数据
    const activeIndex = computed(() => route.path)

    // 计算属性
    const isLogin = computed(() => userStore.isLogin)
    const userInfo = computed(() => userStore.userInfo)

    // 监听路由变化
    watch(
      () => route.path,
      (newPath) => {
        // 更新激活的菜单项
        if (newPath === '/') {
          activeIndex.value = '/home'
        }
      },
    )

    // 生命周期
    onMounted(() => {
      // 检查登录状态
      userStore.checkLogin()
    })

    // 方法
    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'orders':
          router.push('/OrderManagement')
          break
        case 'reviews':
          router.push('/reviews')
          break
        case 'reviewManage':
          router.push('/reviewManage')
          break
        case 'refundManage':
          router.push('/refundManage')
          break
        case 'admin':
          router.push('/venueManage')
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        userStore.logout()
        ElMessage.success('退出登录成功')
        router.push('/login')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出登录失败:', error)
        }
      }
    }

    const goToLogin = () => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath },
      })
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      activeIndex,
      isLogin,
      userInfo,
      handleCommand,
      goToLogin,
      goToRegister,
    }
  },
}
</script>

<style scoped lang="scss">
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.navbar-brand {
  .brand-link {
    text-decoration: none;
    color: #409eff;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }
}

.navbar-menu {
  flex: 1;
  display: flex;
  justify-content: center;

  .main-menu {
    border-bottom: none;

    :deep(.el-menu-item) {
      border-bottom: 2px solid transparent;

      &:hover {
        background-color: #ecf5ff;
      }

      &.is-active {
        border-bottom-color: #409eff;
        background-color: #ecf5ff;
        color: #409eff;
      }
    }
  }
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .username {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }

  .navbar-brand h2 {
    font-size: 16px;
  }

  .navbar-menu {
    display: none;
  }

  .navbar-user {
    .username {
      display: none;
    }
  }
}
</style>
