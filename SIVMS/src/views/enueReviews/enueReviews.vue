<template>
  <div class="page-wrapper">
    <!-- 导航栏（和器材租赁页完全一致） -->
    <nav-bar />
  </div>
  <div class="review-page">
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
        <el-button type="primary" @click="showWriteDialog"> 写评价 </el-button>
      </div>
    </el-card>

    <!-- 排序 -->
    <div class="sort-bar">
      <el-radio-group v-model="sortOption">
        <el-radio-button label="latest">最新</el-radio-button>
        <el-radio-button label="highest">最高评分</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 评价列表 -->
    <el-skeleton :loading="loading" animated>
      <template #default>
        <el-empty v-if="sortedReviews.length === 0" description="暂无评价" />

        <el-card v-for="review in sortedReviews" :key="review.id" class="review-card">
          <div class="review-header">
            <el-avatar :size="40">
              {{ review.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <div class="user-info">
              <div class="nickname">
                {{ review.nickname || '匿名用户' }}
              </div>
              <div class="time">
                {{ formatTime(review.createTime) }}
              </div>
            </div>
            <el-rate v-model="review.rating" disabled show-score score-template="{value} 分" />
          </div>

          <div class="review-content">
            {{ review.content }}
          </div>
        </el-card>
      </template>
    </el-skeleton>

    <!-- 写评价弹窗 -->
    <el-dialog title="发表评价" v-model="writeDialogVisible" width="500px">
      <el-form :model="reviewForm" :rules="rules" ref="formRef">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" />
        </el-form-item>

        <el-form-item label="评价内容" prop="content">
          <el-input
            type="textarea"
            v-model="reviewForm.content"
            :rows="4"
            placeholder="请输入不少于10个字的评价"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="writeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReview"> 提交 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import NavBar from '../../components/NavBar.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVenueReviews, getVenueReviewStats, submitReview as submitReviewApi } from '@/api/review'

const route = useRoute()
const router = useRouter()
const venueId = Number(route.params.venueId)

// ===== 数据 =====
const venueStats = ref({
  avgRating: '0.0',
  totalReviews: 0,
})

const reviews = ref([])
const loading = ref(false)
const sortOption = ref('latest')

const writeDialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const reviewForm = ref({
  venueId: venueId,
  content: '',
  rating: 5,
})

// ===== 校验 =====
const rules = {
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, message: '至少输入10个字符', trigger: 'blur' },
  ],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
}

// ===== 排序后的评价 =====
const sortedReviews = computed(() => {
  const list = [...reviews.value]
  if (sortOption.value === 'highest') {
    return list.sort((a, b) => b.rating - a.rating)
  }
  return list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

// ===== 接口 =====
const fetchReviews = async () => {
  loading.value = true
  try {
    const res = await getVenueReviews(venueId)
    if (res.code === 200) {
      reviews.value = res.data.list || []
    }
  } catch (e) {
    ElMessage.error('获取评价失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await getVenueReviewStats(venueId)
    if (res.code === 200) {
      venueStats.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

// ===== 工具 =====
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// ===== 写评价 =====
const showWriteDialog = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  writeDialogVisible.value = true
}

const submitReview = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    const res = await submitReviewApi({
      venueId: reviewForm.value.venueId,
      content: reviewForm.value.content,
      rating: reviewForm.value.rating,
    })
    if (res.code === 200) {
      ElMessage.success('评价提交成功')
      writeDialogVisible.value = false
      reviewForm.value.content = ''
      reviewForm.value.rating = 5
      fetchReviews()
      fetchStats()
    }
  } catch (e) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// ===== 生命周期 =====
onMounted(() => {
  fetchReviews()
  fetchStats()
})

watch(sortOption, () => {})
</script>

<style scoped>
.review-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.sort-bar {
  margin-bottom: 20px;
  text-align: right;
}

.review-card {
  margin-bottom: 16px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
}

.nickname {
  font-weight: bold;
}

.time {
  font-size: 12px;
  color: #999;
}

.review-content {
  margin-top: 10px;
  line-height: 1.6;
}
</style>
