<template>
  <div class="profile-page">
    <HeaderNav />

    <div class="profile-container">
      <!-- 1. 顶部用户信息卡片 -->
      <div class="profile-header">
        <div class="user-card">
          <div class="user-card-left">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userAvatar" :icon="UserFilled" class="user-avatar" />
              <el-button type="text" class="change-avatar-text" @click="handleAvatarClick">
                更换头像
              </el-button>
            </div>

            <div class="user-basic-info">
              <h1 class="user-name">{{ userInfo.nickname || userInfo.username }}</h1>

              <div class="user-tags">
                <el-tag :type="roleTagType" effect="dark" size="large" class="role-tag">
                  <i :class="isAdmin ? 'el-icon-s-custom' : 'el-icon-user'"></i>
                  {{ roleName }}
                </el-tag>

                <!-- 如果接口返回了余额，这里优先显示接口返回的实时余额 -->
                <el-tag
                  v-if="!isAdmin"
                  type="warning"
                  effect="plain"
                  size="large"
                  class="balance-tag"
                >
                  <i class="el-icon-wallet"></i> 余额: ¥{{
                    userStats.balance || userInfo.balance || '0.00'
                  }}
                </el-tag>
              </div>

              <div class="user-meta">
                <span class="meta-item">ID: {{ userInfo.id }}</span>
                <span class="meta-separator">|</span>
                <span class="meta-item">
                  <i class="el-icon-time"></i> 注册于 {{ formatDate(userInfo.createTime) }}
                </span>
              </div>
            </div>
          </div>

          <div class="user-card-right">
            <el-button type="primary" plain round icon="el-icon-edit" @click="showEditDialog">
              编辑资料
            </el-button>
            <el-button type="info" plain round icon="el-icon-lock" @click="showPasswordDialog">
              修改密码
            </el-button>
          </div>
        </div>
      </div>

      <!-- 2. 统计数据区域 (对接真实后端字段) -->
      <div class="stats-section">
        <h2 class="section-title">
          <i class="el-icon-data-analysis"></i>
          {{ isAdmin ? '系统概览' : '我的数据' }}
        </h2>

        <!-- A. 管理员视图 -->
        <div v-if="isAdmin" class="stats-grid admin-stats">
          <div class="stat-card blue">
            <div class="icon-box"><i class="el-icon-user"></i></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.totalUsers -->
              <div class="value">{{ adminStats.totalUsers }}</div>
              <div class="label">注册用户</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="icon-box"><i class="el-icon-location-information"></i></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.totalVenues -->
              <div class="value">{{ adminStats.totalVenues }}</div>
              <div class="label">场馆总数</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="icon-box"><i class="el-icon-s-check"></i></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.pendingApprovals -->
              <div class="value">{{ adminStats.pendingApprovals }}</div>
              <div class="label">待审批事项</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="icon-box"><i class="el-icon-money"></i></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.totalRevenue -->
              <div class="value">¥{{ adminStats.totalRevenue }}</div>
              <div class="label">平台总流水</div>
            </div>
          </div>
        </div>

        <!-- B. 普通用户视图 -->
        <div v-else class="stats-grid user-stats">
          <div class="stat-card orange">
            <div class="icon-box"><i class="el-icon-wallet"></i></div>
            <div class="info">
              <!-- 对应 UserStatsVO.balance -->
              <div class="value">¥{{ userStats.balance }}</div>
              <div class="label">当前余额</div>
            </div>
          </div>
          <div class="stat-card blue">
            <div class="icon-box"><i class="el-icon-date"></i></div>
            <div class="info">
              <!-- 对应 UserStatsVO.bookings -->
              <div class="value">{{ userStats.bookings }}</div>
              <div class="label">我的预订</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="icon-box"><i class="el-icon-basketball"></i></div>
            <div class="info">
              <!-- 对应 UserStatsVO.rentals -->
              <div class="value">{{ userStats.rentals }}</div>
              <div class="label">器材借用</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="icon-box"><i class="el-icon-shopping-cart-full"></i></div>
            <div class="info">
              <!-- 对应 UserStatsVO.totalExpense -->
              <div class="value">¥{{ userStats.totalExpense }}</div>
              <div class="label">累计消费</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 详细信息 -->
      <div class="info-section">
        <h2 class="section-title"><i class="el-icon-document"></i> 详细信息</h2>
        <div class="info-list">
          <div class="info-row">
            <span class="label">登录账号</span>
            <span class="value">{{ userInfo.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">用户昵称</span>
            <span class="value">{{ userInfo.nickname || '未设置' }}</span>
          </div>
          <div class="info-row">
            <span class="label">绑定手机</span>
            <span class="value">{{ userInfo.phone || '未绑定' }}</span>
          </div>
          <div class="info-row">
            <span class="label">绑定邮箱</span>
            <span class="value">{{ userInfo.email || '未绑定' }}</span>
          </div>
          <div class="info-row">
            <span class="label">账号状态</span>
            <span class="value">
              <el-tag size="small" :type="userInfo.status === 1 ? 'success' : 'danger'">
                {{ userInfo.status === 1 ? '正常' : '已禁用' }}
              </el-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="label">上次更新</span>
            <span class="value">{{ formatDate(userInfo.updateTime) || '无' }}</span>
          </div>
        </div>
      </div>
    </div>
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
            >渝ICP备2025076592号-3</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
// 引入 HeaderNav
import HeaderNav from '../Home/components/HeaderNav/HeaderNav.vue'
// 引入新建的 API
import { getAdminStats, getUserStats } from '@/api/user'

export default {
  name: 'ProfilePage',
  components: {
    HeaderNav,
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const userInfo = computed(() => userStore.userInfo || {})
    const userAvatar = computed(() => userStore.avatar)
    const isAdmin = computed(() => userStore.isAdmin)
    const roleName = computed(() => userStore.roleName)

    const roleTagType = computed(() => {
      if (userInfo.value.role === 2) return 'danger'
      if (userInfo.value.role === 1) return 'warning'
      return 'primary'
    })

    // 初始化数据结构，保持与后端 VO 字段一致
    const adminStats = ref({
      totalUsers: 0,
      totalVenues: 0,
      pendingApprovals: 0,
      totalRevenue: 0.0,
    })

    const userStats = ref({
      balance: 0.0,
      bookings: 0,
      rentals: 0,
      totalExpense: 0.0,
    })

    // 获取统计数据 (调用真实接口)
    const fetchStats = async () => {
      try {
        if (isAdmin.value) {
          const res = await getAdminStats()
          if (res.code === 200) {
            adminStats.value = res.data
          }
        } else {
          const res = await getUserStats()
          if (res.code === 200) {
            userStats.value = res.data
            // 如果需要，可以在这里顺便更新 Store 里的余额信息
            // if (res.data.balance !== undefined) {
            //   userInfo.value.balance = res.data.balance
            // }
          }
        }
      } catch (error) {
        console.error('获取统计数据失败', error)
        // ElMessage.error('获取统计数据失败') // 可选：是否提示错误
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/\//g, '-')
    }

    const handleAvatarClick = () => ElMessage.info('头像上传功能开发中')
    const showEditDialog = () => ElMessage.info('编辑资料功能开发中')
    const showPasswordDialog = () => ElMessage.info('修改密码功能开发中')

    onMounted(() => {
      // 页面加载时拉取数据
      fetchStats()
    })

    return {
      userInfo,
      userAvatar,
      isAdmin,
      roleName,
      roleTagType,
      adminStats,
      userStats,
      UserFilled,
      formatDate,
      handleAvatarClick,
      showEditDialog,
      showPasswordDialog,
    }
  },
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.profile-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 1. 顶部用户卡片 */
.user-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

.user-card-left {
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  .change-avatar-text {
    margin-top: 5px;
    font-size: 12px;
  }
}

.user-basic-info {
  .user-name {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 12px 0;
  }

  .user-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .user-meta {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }
}

/* 2. 统计区域 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  i {
    color: #409eff;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 普通用户也是 4 个卡片了 */
  &.user-stats {
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .info {
    .value {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
    }
    .label {
      font-size: 13px;
      color: #909399;
      margin-top: 4px;
    }
  }

  &.blue .icon-box {
    background: #ecf5ff;
    color: #409eff;
  }
  &.purple .icon-box {
    background: #f4f4f5;
    color: #909399;
  }
  &.orange .icon-box {
    background: #fdf6ec;
    color: #e6a23c;
  }
  &.green .icon-box {
    background: #f0f9eb;
    color: #67c23a;
  }
}

/* 3. 详细信息样式 */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  width: 100%;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #606266;
    font-size: 14px;
    flex-shrink: 0;
    font-weight: 500;
  }

  .value {
    color: #303133;
    font-weight: 500;
    font-size: 14px;
    flex: 1;
    text-align: right;
    margin-left: 20px;
    word-break: break-all;
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
