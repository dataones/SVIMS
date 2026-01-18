<template>
  <div class="my-reviews-page">
    <HeaderNav />

    <!-- 登录检查 -->
    <div v-if="!isLogin" class="login-required">
      <div class="login-prompt">
        <div class="prompt-icon">
          <el-icon><Star /></el-icon>
        </div>
        <h2>请先登录</h2>
        <p>查看我的评论需要登录账号，请先登录</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="login-btn">
            <el-icon><User /></el-icon>
            立即登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 已登录用户显示内容 -->
    <div v-else class="my-reviews-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="el-icon-star"></i>
            我的评论
          </h1>
          <p class="page-subtitle">查看和管理您发表的所有评论</p>
        </div>
        <div class="header-right">
          <div class="stats-summary">
            <div class="stat-item">
              <div class="stat-value">{{ totalReviews }}</div>
              <div class="stat-label">总评论数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averageRating }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="reviews-section">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="reviews.length === 0" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <el-icon><Star /></el-icon>
            </div>
            <h3>暂无评论</h3>
            <p>您还没有发表任何评论，快去体验场馆后分享您的感受吧！</p>
            <el-button type="primary" @click="goToVenues">
              <i class="el-icon-location"></i>
              浏览场馆
            </el-button>
          </div>
        </div>

        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <!-- 评论头部 -->
            <div class="review-header">
              <div class="venue-info">
                <h3 class="venue-name">{{ review.venueName }}</h3>
                <div class="rating-display">
                  <el-rate
                    v-model="review.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
              </div>
              <div class="review-time">
                {{ formatDate(review.createTime) }}
              </div>
            </div>

            <!-- 评论内容 -->
            <div class="review-content">
              <p class="review-text">{{ review.content }}</p>
            </div>

            <!-- 评论状态 -->
            <div class="review-status">
              <el-tag :type="getStatusType(review.auditStatus)" size="small">
                {{ getStatusText(review.auditStatus) }}
              </el-tag>
            </div>

            <!-- 操作按钮 -->
            <div class="review-actions">
              <el-button type="text" size="small" @click="viewVenue(review.venueId)">
                <i class="el-icon-location"></i>
                查看场馆
              </el-button>
              <el-button
                v-if="review.auditStatus === 1"
                type="text"
                size="small"
                @click="editReview(review)"
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button type="text" size="small" @click="deleteReview(review)" class="delete-btn">
                <i class="el-icon-delete"></i>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="reviews.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, User, Location, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import HeaderNav from '../Home/components/HeaderNav/HeaderNav.vue'
import { getMyReviews, deleteReview as deleteReviewApi } from '@/api/review'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const reviews = ref([])
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 计算属性
const isLogin = computed(() => userStore.isLogin)
const totalReviews = computed(() => pagination.value.total)
const averageRating = computed(() => {
  if (reviews.value.length === 0) return '0.0'
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

// 获取我的评论
const fetchMyReviews = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    }

    const response = await getMyReviews(params)
    if (response.code === 200) {
      reviews.value = response.data.records || []
      pagination.value.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  } finally {
    loading.value = false
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.pageNum = 1
  fetchMyReviews()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.value.pageNum = val
  fetchMyReviews()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待审核',
    1: '已通过',
    2: '已隐藏',
  }
  return texts[status] || '未知'
}

// 查看场馆
const viewVenue = (venueId) => {
  router.push(`/venue/details/${venueId}`)
}

// 编辑评论
const editReview = (review) => {
  ElMessage.info('编辑功能开发中')
}

// 删除评论
const deleteReview = async (review) => {
  try {
    await ElMessageBox.confirm(`确定要删除这条评论吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await deleteReviewApi(review.id)
    if (response.code === 200) {
      ElMessage.success('评论删除成功')
      fetchMyReviews() // 重新获取列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 跳转到登录
const goToLogin = () => {
  router.push('/login')
}

// 跳转到场馆列表
const goToVenues = () => {
  router.push('/venue')
}

// 组件挂载时获取数据
onMounted(() => {
  if (isLogin.value) {
    fetchMyReviews()
  }
})
</script>

<style scoped lang="scss">
.my-reviews-page {
  min-height: 100vh;
  background: #f8fafc;
}

.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;

  .login-prompt {
    text-align: center;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .prompt-icon {
      font-size: 48px;
      color: #409eff;
      margin-bottom: 20px;
    }

    h2 {
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      color: #606266;
      margin-bottom: 30px;
    }

    .login-btn {
      padding: 12px 32px;
      font-size: 16px;
    }
  }
}

.my-reviews-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .header-left {
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        color: #409eff;
      }
    }

    .page-subtitle {
      color: #606266;
      margin: 0;
    }
  }

  .stats-summary {
    display: flex;
    gap: 30px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #409eff;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.reviews-section {
  margin-bottom: 30px;
}

.loading-state {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .empty-content {
    max-width: 400px;
    margin: 0 auto;

    .empty-icon {
      font-size: 64px;
      color: #c0c4cc;
      margin-bottom: 20px;
    }

    h3 {
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      color: #606266;
      margin-bottom: 30px;
    }
  }
}

.reviews-list {
  .review-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .venue-info {
        flex: 1;

        .venue-name {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .rating-display {
          :deep(.el-rate) {
            height: 20px;
          }
        }
      }

      .review-time {
        color: #909399;
        font-size: 14px;
        white-space: nowrap;
      }
    }

    .review-content {
      margin-bottom: 16px;

      .review-text {
        color: #303133;
        line-height: 1.6;
        margin: 0;
      }
    }

    .review-status {
      margin-bottom: 16px;
    }

    .review-actions {
      display: flex;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;

      .el-button {
        color: #409eff;

        &.delete-btn {
          color: #f56c6c;
        }

        &:hover {
          background: #f0f9ff;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;

    .stats-summary {
      justify-content: center;
    }
  }

  .review-card {
    .review-header {
      flex-direction: column;
      gap: 12px;
    }

    .review-actions {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
