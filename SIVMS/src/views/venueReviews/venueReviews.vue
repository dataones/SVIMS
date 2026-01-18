<template>
  <div class="review-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 统计信息 -->
    <el-card class="stats-card">
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ venueStats.avgRating }}</div>
          <div class="stat-label">平均评分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ venueStats.totalReviews }}</div>
          <div class="stat-label">评价总数</div>
        </div>
        <el-button type="primary" @click="showWriteDialog" v-if="isLogin">
          <el-icon><Edit /></el-icon> 写评价
        </el-button>
        <el-button type="primary" @click="goToLogin" v-else>
          <el-icon><User /></el-icon> 登录写评价
        </el-button>
      </div>
    </el-card>

    <!-- 排序和筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="sortOption" @change="handleSortChange">
        <el-radio-button label="latest">最新</el-radio-button>
        <el-radio-button label="highest">最高评分</el-radio-button>
        <el-radio-button label="lowest">最低评分</el-radio-button>
      </el-radio-group>

      <el-select
        v-model="ratingFilter"
        placeholder="评分筛选"
        clearable
        @change="handleFilterChange"
      >
        <el-option label="5星" :value="5" />
        <el-option label="4星" :value="4" />
        <el-option label="3星" :value="3" />
        <el-option label="2星" :value="2" />
        <el-option label="1星" :value="1" />
      </el-select>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-container">
      <el-skeleton :loading="loading" animated :count="3" v-if="loading">
        <template #template>
          <el-skeleton-item variant="image" style="width: 60px; height: 60px" />
          <el-skeleton-item variant="h3" style="width: 50%" />
          <el-skeleton-item variant="text" style="width: 70%" />
          <el-skeleton-item variant="text" style="width: 60%" />
        </template>
      </el-skeleton>

      <div v-else>
        <el-card
          v-for="(review, index) in filteredReviews"
          :key="index"
          class="review-card"
          shadow="hover"
        >
          <div class="review-header">
            <div class="user-info">
              <el-avatar :src="review.userAvatar" :size="40">
                {{ review.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ review.nickname }}</div>
                <div class="review-date">{{ formatTime(review.createTime) }}</div>
              </div>
            </div>
            <div class="rating">
              <el-rate
                v-model="review.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </div>

          <div class="review-content">
            <p>{{ review.content }}</p>
          </div>

          <div class="review-images" v-if="review.images && review.images.length">
            <el-image
              v-for="(image, index) in review.images"
              :key="index"
              :src="image"
              :preview-src-list="review.images"
              fit="cover"
              class="review-image"
            />
          </div>

          <div class="review-actions" v-if="review.userId === currentUserId">
            <el-button type="text" @click="editReview(review)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="text" @click="deleteReview(review)" style="color: #f56c6c">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </el-card>

        <!-- 空状态 -->
        <el-empty v-if="!loading && filteredReviews.length === 0" description="暂无评价">
          <el-button type="primary" @click="showWriteDialog" v-if="isLogin">
            写第一条评价
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 写评价对话框 -->
    <el-dialog
      v-model="writeDialogVisible"
      title="写评价"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" show-text />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="请分享您的使用体验..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            v-model:file-list="reviewForm.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="writeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting">
            发表评价
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'
import {
  getVenueReviews,
  getVenueReviewStats,
  createReview,
  deleteReview as deleteReviewApi,
} from '@/api/review'

export default {
  name: 'VenueReviews',
  components: {
    NavBar,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    // 响应式数据
    const loading = ref(false)
    const submitting = ref(false)
    const reviews = ref([])
    const venueStats = ref({
      avgRating: 0,
      totalReviews: 0,
      ratingDistribution: {},
    })
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const sortOption = ref('latest')
    const ratingFilter = ref(null)
    const writeDialogVisible = ref(false)

    // 用户相关
    const isLogin = computed(() => userStore.isLogin)
    const currentUserId = computed(() => userStore.userId)

    // 表单数据
    const reviewForm = reactive({
      venueId: null,
      rating: 5,
      content: '',
      images: [],
    })

    const reviewFormRef = ref(null)

    // 表单验证规则
    const reviewRules = {
      rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
      content: [
        { required: true, message: '请输入评价内容', trigger: 'blur' },
        { min: 10, message: '评价内容至少10个字符', trigger: 'blur' },
      ],
    }

    // 计算属性
    const filteredReviews = computed(() => {
      let result = [...reviews.value]

      // 评分筛选
      if (ratingFilter.value !== null) {
        result = result.filter((review) => review.rating === ratingFilter.value)
      }

      return result
    })

    // 监听路由参数变化
    watch(
      () => route.params.venueId,
      (newVenueId) => {
        if (newVenueId) {
          reviewForm.venueId = parseInt(newVenueId)
          loadReviews()
          loadStats()
        }
      },
      { immediate: true },
    )

    // 生命周期
    onMounted(() => {
      const venueId = route.params.venueId
      if (venueId) {
        reviewForm.venueId = parseInt(venueId)
        loadReviews()
        loadStats()
      }
    })

    // 方法
    const loadReviews = async () => {
      if (!reviewForm.venueId) return

      loading.value = true
      try {
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          sortBy: sortOption.value,
        }

        const response = await getVenueReviews(reviewForm.venueId, params)
        if (response.code === 200) {
          reviews.value = response.data.records || []
          total.value = response.data.total || 0
        }
      } catch (error) {
        console.error('加载评价失败:', error)
        ElMessage.error('加载评价失败')
      } finally {
        loading.value = false
      }
    }

    const loadStats = async () => {
      if (!reviewForm.venueId) return

      try {
        const response = await getVenueReviewStats(reviewForm.venueId)
        if (response.code === 200) {
          venueStats.value = response.data
        }
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    }

    const handleSortChange = () => {
      currentPage.value = 1
      loadReviews()
    }

    const handleFilterChange = () => {
      currentPage.value = 1
      loadReviews()
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadReviews()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadReviews()
    }

    const showWriteDialog = () => {
      if (!isLogin.value) {
        goToLogin()
        return
      }

      // 重置表单
      Object.assign(reviewForm, {
        venueId: parseInt(route.params.venueId),
        rating: 5,
        content: '',
        images: [],
      })

      writeDialogVisible.value = true
    }

    const submitReview = async () => {
      if (!reviewFormRef.value) return

      try {
        await reviewFormRef.value.validate()

        submitting.value = true

        const reviewData = {
          venueId: reviewForm.venueId,
          rating: reviewForm.rating,
          content: reviewForm.content,
          images: reviewForm.images?.map((img) => img.url) || [],
        }

        const response = await createReview(reviewData)
        if (response.code === 200) {
          ElMessage.success('评价发表成功')
          writeDialogVisible.value = false
          loadReviews()
          loadStats()
        }
      } catch (error) {
        console.error('发表评价失败:', error)
        ElMessage.error('发表评价失败')
      } finally {
        submitting.value = false
      }
    }

    const deleteReview = async (review) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        const response = await deleteReviewApi(review.id)
        if (response.code === 200) {
          ElMessage.success('删除成功')
          loadReviews()
          loadStats()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除评价失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const goToLogin = () => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath },
      })
    }

    return {
      loading,
      submitting,
      reviews,
      filteredReviews,
      venueStats,
      currentPage,
      pageSize,
      total,
      sortOption,
      ratingFilter,
      writeDialogVisible,
      reviewForm,
      reviewFormRef,
      reviewRules,
      isLogin,
      currentUserId,

      handleSortChange,
      handleFilterChange,
      handleSizeChange,
      handleCurrentChange,
      showWriteDialog,
      submitReview,
      deleteReview,
      formatTime,
      goToLogin,
    }
  },
}
</script>

<style scoped lang="scss">
.review-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;

  .stats {
    display: flex;
    align-items: center;
    gap: 40px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.reviews-container {
  .review-card {
    margin-bottom: 16px;

    .review-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .review-info {
        flex: 1;

        .review-user {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .review-content {
      margin-bottom: 16px;

      p {
        line-height: 1.6;
        color: #303133;
        margin: 0;
      }
    }

    .review-images {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      .review-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .review-actions {
      display: flex;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .review-page {
    padding: 10px;
  }

  .stats-card .stats {
    flex-direction: column;
    gap: 20px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .review-card .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
