<template>
  <div class="profile-page">
    <HeaderNav />

    <div class="profile-container">
      <!-- 1. 顶部用户信息卡片 -->
      <div class="profile-header">
        <div class="user-card">
          <div class="user-card-left">
            <div class="avatar-section">
              <el-avatar
                :size="120"
                :src="userInfo.avatar || '/default-avatar.png'"
                :icon="UserFilled"
                class="user-avatar"
              />
              <el-button type="text" class="change-avatar-text" @click="handleAvatarClick">
                更换头像
              </el-button>
            </div>

            <div class="user-basic-info">
              <h1 class="user-name">{{ userInfo.nickname || userInfo.username }}</h1>

              <div class="user-tags">
                <el-tag :type="roleTagType" effect="dark" size="large" class="role-tag">
                  <User class="icon-base" v-if="isAdmin" />
                  <User class="icon-base" v-else />
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
                  <Money class="icon-base" /> 余额: ¥{{
                    userStats.balance || userInfo.balance || '0.00'
                  }}
                </el-tag>
              </div>

              <div class="user-meta">
                <span class="meta-item">ID: {{ userInfo.id }}</span>
                <span class="meta-separator">|</span>
                <span class="meta-item">
                  <Clock class="icon-base" /> 注册于 {{ formatDate(userInfo.createTime) }}
                </span>
              </div>
            </div>
          </div>

          <div class="user-card-right">
            <el-button type="primary" plain round @click="showEditDialog">
              <Edit class="el-icon-edit" />
              编辑资料
            </el-button>
            <el-button type="info" plain round @click="showPasswordDialog">
              <Lock class="el-icon-lock" />
              修改密码
            </el-button>
          </div>
        </div>
      </div>

      <!-- 2. 统计数据区域 (对接真实后端字段) -->
      <div class="stats-section">
        <h2 class="section-title">
          <DataAnalysis class="icon-base" />
          {{ isAdmin ? '系统概览' : '我的数据' }}
        </h2>

        <!-- A. 管理员视图 -->
        <div v-if="isAdmin" class="stats-grid admin-stats">
          <div class="stat-card blue">
            <div class="icon-box"><User class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.totalUsers -->
              <div class="value">{{ adminStats.totalUsers }}</div>
              <div class="label">注册用户</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="icon-box"><OfficeBuilding class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.totalVenues -->
              <div class="value">{{ adminStats.totalVenues }}</div>
              <div class="label">场馆总数</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="icon-box"><Document class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 AdminStatsVO.pendingApprovals -->
              <div class="value">{{ adminStats.pendingApprovals }}</div>
              <div class="label">待审批事项</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="icon-box"><Money class="icon-stat" /></div>
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
            <div class="icon-box"><Money class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 UserStatsVO.balance -->
              <div class="value">¥{{ userStats.balance }}</div>
              <div class="label">当前余额</div>
            </div>
          </div>
          <div class="stat-card blue">
            <div class="icon-box"><Calendar class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 UserStatsVO.bookings -->
              <div class="value">{{ userStats.bookings }}</div>
              <div class="label">我的预订</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="icon-box"><Box class="icon-stat" /></div>
            <div class="info">
              <!-- 对应 UserStatsVO.rentals -->
              <div class="value">{{ userStats.rentals }}</div>
              <div class="label">器材借用</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="icon-box"><ShoppingCart class="icon-stat" /></div>
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
        <h2 class="section-title"><User class="icon-base" /> 详细信息</h2>
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
          <h3><Trophy class="icon-base" /> 体育场馆综合管理系统</h3>
          <p>智慧管理 · 便捷预约 · 高效运营</p>
          <p>为您提供最优质的体育场馆服务体验</p>
        </div>
        <div class="footer-section">
          <h4>服务支持</h4>
          <ul>
            <li>
              <el-link :underline="false"><Question class="icon-base" /> 使用帮助 </el-link>
            </li>
            <li>
              <el-link :underline="false"><ChatLineSquare class="icon-base" /> 常见问题</el-link>
            </li>
            <li>
              <el-link :underline="false"><Message class="icon-base" /> 联系我们</el-link>
            </li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li>
              <el-link :underline="false"><InfoFilled class="icon-base" /> 平台介绍</el-link>
            </li>
            <li>
              <el-link :underline="false"><Document class="icon-base" /> 服务条款</el-link>
            </li>
            <li>
              <el-link :underline="false"><Lock class="icon-base" /> 隐私政策</el-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        2025 体育场馆综合管理系统. All rights reserved.
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

  <!-- 编辑资料对话框 -->
  <el-dialog
    v-model="editDialogVisible"
    title="编辑个人资料"
    width="500px"
    :before-close="handleEditDialogClose"
  >
    <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="editForm.nickname"
          placeholder="请输入昵称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="editForm.phone" placeholder="请输入手机号码" maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="editForm.email" placeholder="请输入邮箱地址" type="email" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editLoading">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 修改密码对话框 -->
  <el-dialog
    v-model="passwordDialogVisible"
    title="修改密码"
    width="450px"
    :before-close="handlePasswordDialogClose"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordFormRules"
      label-width="80px"
    >
      <el-form-item label="当前密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码（6-20位）"
          show-password
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          maxlength="20"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit" :loading="passwordLoading">
          修改
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 头像上传对话框 -->
  <el-dialog
    v-model="avatarDialogVisible"
    title="更换头像"
    width="400px"
    :before-close="handleAvatarDialogClose"
  >
    <div class="avatar-upload-container">
      <OssUpload v-model="avatarForm.avatar" :loading="avatarLoading" />
      <div class="avatar-tips">
        <el-alert title="提示" type="info" :closable="false" show-icon>
          <template #default>
            <p>• 支持 JPG、PNG 格式图片</p>
            <p>• 图片大小不超过 2MB</p>
            <p>• 建议使用正方形图片以获得最佳效果</p>
          </template>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAvatarSubmit" :loading="avatarLoading">
          确认上传
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Edit, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
// 引入 HeaderNav
import HeaderNav from '../Home/components/HeaderNav/HeaderNav.vue'
// 引入 OSS 上传组件
import OssUpload from '@/components/OssUpload.vue'
// 引入新建的 API
import { getAdminStats, getUserStats } from '@/api/user'
import { updateUserProfile, changePassword } from '@/api/auth'
// 引入 OSS 上传 API
import { uploadImage } from '@/api/oss'

export default {
  name: 'ProfilePage',
  components: {
    HeaderNav,
    Edit,
    Lock,
    OssUpload,
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

    // 编辑资料相关状态
    const editDialogVisible = ref(false)
    const editLoading = ref(false)
    const editFormRef = ref(null)
    const editForm = ref({
      nickname: '',
      phone: '',
      email: '',
    })

    // 修改密码相关状态
    const passwordDialogVisible = ref(false)
    const passwordLoading = ref(false)
    const passwordFormRef = ref(null)
    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    // 头像上传相关状态
    const avatarDialogVisible = ref(false)
    const avatarLoading = ref(false)
    const avatarForm = ref({
      avatar: '',
    })

    // 编辑资料表单验证规则
    const editFormRules = {
      nickname: [
        { required: false, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
      ],
      phone: [
        { required: false, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
      ],
      email: [
        { required: false, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
      ],
    }

    // 修改密码表单验证规则
    const passwordFormRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.value.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
    }

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

    const handleAvatarClick = () => {
      avatarForm.value.avatar = userInfo.value.avatar || ''
      avatarDialogVisible.value = true
    }

    // 关闭头像上传对话框
    const handleAvatarDialogClose = () => {
      avatarDialogVisible.value = false
      avatarForm.value.avatar = ''
    }

    // 提交头像上传
    const handleAvatarSubmit = async () => {
      if (!avatarForm.value.avatar) {
        ElMessage.warning('请先选择头像')
        return
      }

      try {
        avatarLoading.value = true

        let avatarUrl = avatarForm.value.avatar

        // 如果是本地图片（blob:开头），需要上传到OSS
        if (avatarUrl.startsWith('blob:')) {
          // 从blob创建File对象
          const fileToUpload = await fetch(avatarUrl)
            .then((res) => res.blob())
            .then((blob) => {
              // 使用动态时间戳命名
              const now = new Date()
              const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
              const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
              const extension = 'png' // 默认使用png扩展名
              const fileName = `avatar_${dateStr}_${timeStr}.${extension}`

              return new File([blob], fileName, { type: `image/${extension}` })
            })

          avatarUrl = await uploadImage(fileToUpload)
          // 把上传返回的远程地址赋回到表单，触发子组件状态更新
          avatarForm.value.avatar = avatarUrl
          ElMessage.success('头像上传成功')
        }

        // 调用API更新用户头像
        const res = await updateUserProfile({ avatar: avatarUrl })

        if (res.code === 200) {
          ElMessage.success('头像更新成功')
          avatarDialogVisible.value = false

          // 更新本地用户信息
          await userStore.initUser()
        } else {
          ElMessage.error(res.msg || '头像更新失败')
        }
      } catch (error) {
        console.error('头像更新失败:', error)
        ElMessage.error('头像更新失败，请稍后重试')
      } finally {
        avatarLoading.value = false
      }
    }

    // 显示编辑资料对话框
    const showEditDialog = () => {
      // 初始化表单数据
      editForm.value = {
        nickname: userInfo.value.nickname || '',
        phone: userInfo.value.phone || '',
        email: userInfo.value.email || '',
      }
      editDialogVisible.value = true
    }

    // 关闭编辑资料对话框
    const handleEditDialogClose = () => {
      editDialogVisible.value = false
      editFormRef.value?.resetFields()
    }

    // 提交编辑资料
    const handleEditSubmit = async () => {
      if (!editFormRef.value) return

      try {
        await editFormRef.value.validate()
        editLoading.value = true

        const updateData = {}
        // 只包含有值的字段
        if (editForm.value.nickname && editForm.value.nickname !== userInfo.value.nickname) {
          updateData.nickname = editForm.value.nickname
        }
        if (editForm.value.phone && editForm.value.phone !== userInfo.value.phone) {
          updateData.phone = editForm.value.phone
        }
        if (editForm.value.email && editForm.value.email !== userInfo.value.email) {
          updateData.email = editForm.value.email
        }

        if (Object.keys(updateData).length === 0) {
          ElMessage.warning('没有需要更新的信息')
          return
        }

        // 调用API更新用户信息
        const res = await updateUserProfile(updateData)
        if (res.code === 200) {
          ElMessage.success('资料更新成功')
          editDialogVisible.value = false

          // 更新本地用户信息
          await userStore.initUser()
        } else {
          ElMessage.error(res.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新资料失败:', error)
        ElMessage.error('更新失败，请稍后重试')
      } finally {
        editLoading.value = false
      }
    }

    // 显示修改密码对话框
    const showPasswordDialog = () => {
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      passwordDialogVisible.value = true
    }

    // 关闭修改密码对话框
    const handlePasswordDialogClose = () => {
      passwordDialogVisible.value = false
      passwordFormRef.value?.resetFields()
    }

    // 提交修改密码
    const handlePasswordSubmit = async () => {
      if (!passwordFormRef.value) return

      try {
        await passwordFormRef.value.validate()
        passwordLoading.value = true

        const res = await changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        })

        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          passwordDialogVisible.value = false

          // 清除本地登录状态，跳转到登录页
          userStore.logout()
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('密码修改失败，请检查当前密码是否正确')
      } finally {
        passwordLoading.value = false
      }
    }

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
      // 编辑资料相关
      editDialogVisible,
      editLoading,
      editFormRef,
      editForm,
      editFormRules,
      handleEditDialogClose,
      handleEditSubmit,
      // 修改密码相关
      passwordDialogVisible,
      passwordLoading,
      passwordFormRef,
      passwordForm,
      passwordFormRules,
      handlePasswordDialogClose,
      handlePasswordSubmit,
      // 头像上传相关
      avatarDialogVisible,
      avatarLoading,
      avatarForm,
      handleAvatarDialogClose,
      handleAvatarSubmit,
    }
  },
}
</script>
<style scoped lang="scss">
/* 统一的图标样式类 */
.icon-base {
  width: 1em;
  height: 1em;
  font-size: 1em !important;
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

.icon-stat {
  width: 1.25em;
  height: 1.25em;
  font-size: 1.25em !important;
  display: block;
  line-height: 1;
}

/* 头像上传对话框样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avatar-tips {
  margin-top: 16px;

  .el-alert {
    p {
      margin: 4px 0;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

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
    flex-wrap: wrap;
    align-items: center;

    .role-tag,
    .balance-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      .icon-base {
        font-size: 14px !important;
      }
    }
  }

  @media (max-width: 768px) {
    .user-tags {
      justify-content: center;
    }
  }

  .user-meta {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .icon-base {
      font-size: 14px !important;
    }

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

  .icon-base {
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
    flex-shrink: 0;

    .icon-stat {
      width: 1.25em;
      height: 1.25em;
      font-size: 1.25em !important;
    }
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

        .icon-base {
          font-size: 1.2em;
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
            display: flex;
            align-items: center;
            gap: 8px;

            .icon-base {
              font-size: 0.9em;
              opacity: 0.8;
              flex-shrink: 0;
            }

            &:hover {
              color: #4facfe;
              padding-left: 5px;

              .icon-base {
                opacity: 1;
              }
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
