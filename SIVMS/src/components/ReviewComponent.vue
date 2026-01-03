<template>
  <div class="venue-review">
    <!-- 评价统计摘要 -->
    <div v-if="showStats && reviewStats" class="review-summary">
      <div class="summary-left">
        <!-- 平均评分来自 getVenueReviewStats 的 avgRating -->
        <div class="average-score">{{ reviewStats.avgRating || '0.0' }}</div>
        <div class="average-label">平均评分</div>
      </div>
      <div class="summary-right">
        <div class="score-distribution">
          <div v-for="i in 5" :key="i" class="distribution-item">
            <span class="star-text">{{ 6 - i }}星</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: getDistributionPercentage(6 - i) + '%' }"
              ></div>
            </div>
            <!-- 每个星级的数量现在来自本地统计的 ratingDistribution -->
            <span class="count">{{ ratingDistribution[6 - i] || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="review-list">
      <div class="list-header">
        <h3 class="list-title">用户评价 ({{ reviews.length }})</h3>
        <div v-if="reviews.length > 0" class="list-actions">
          <button
            @click="setSort('highest')"
            :class="{ active: sortBy === 'highest' }"
            class="sort-btn"
          >
            评分最高
          </button>
          <button
            @click="setSort('latest')"
            :class="{ active: sortBy === 'latest' }"
            class="sort-btn"
          >
            最新评价
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载评价中...</span>
      </div>

      <div v-else-if="reviews.length > 0" class="review-content">
        <div v-for="review in displayedReviews" :key="review.id" class="review-item">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitial(review.nickname) }}</div>
            <div class="user-details">
              <div class="user-name">{{ review.nickname || '匿名用户' }}</div>
              <div class="review-date">{{ formatDate(review.createTime) }}</div>
            </div>
          </div>

          <div class="review-rating">
            <div class="stars">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: star <= review.rating }"
                >★</span
              >
              <span class="rating-text">{{ review.rating }}分</span>
            </div>
          </div>

          <div class="review-text">{{ review.content }}</div>
        </div>

        <div v-if="reviews.length > initialDisplayCount && !showAllReviews" class="show-more">
          <button @click="showAllReviews = true" class="show-more-btn">
            查看全部{{ reviews.length }}条评价
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">💬</div>
        <p class="empty-text">暂无评价</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getVenueReviews, getVenueReviewStats } from '@/api/review'

const props = defineProps({
  venueId: { type: Number, required: true },
  showStats: { type: Boolean, default: true },
  initialDisplayCount: { type: Number, default: 3 },
  autoLoad: { type: Boolean, default: true },
})

const reviews = ref([]) // getVenueReviews 返回的评价列表（数组）
const reviewStats = ref(null) // getVenueReviewStats 返回 { avgRating, totalReviews, ... }
const loading = ref(false)
const sortBy = ref('latest')
const showAllReviews = ref(false)

// 列表排序 + 展示条数
const displayedReviews = computed(() => {
  let sorted = [...reviews.value]
  if (sortBy.value === 'highest') {
    sorted.sort((a, b) => b.rating - a.rating)
  } else {
    sorted.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  }
  if (!showAllReviews.value && props.initialDisplayCount > 0) {
    return sorted.slice(0, props.initialDisplayCount)
  }
  return sorted
})

// 统计每个星级的数量（来源：reviews.value 中的 rating）
const ratingDistribution = computed(() => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (!Array.isArray(reviews.value)) return dist
  reviews.value.forEach((review) => {
    const r = Number(review.rating)
    if (r >= 1 && r <= 5) {
      dist[r]++
    }
  })
  return dist
})

// 根据当前评价总数和每个星级数量计算进度条百分比
const getDistributionPercentage = (rating) => {
  const total = reviews.value.length
  if (!total) return 0
  const count = ratingDistribution.value[rating] || 0
  return (count / total) * 100
}

const getUserInitial = (name) => (name ? name.charAt(0).toUpperCase() : '匿')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  else if (diffDays === 1) return '昨天'
  else if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

const setSort = (type) => {
  sortBy.value = type
}

const loadReviews = async () => {
  if (!props.venueId) return
  try {
    loading.value = true

    // 这里假设 getVenueReviews 已封装为返回评价列表数组
    // 如果它返回的是 { total, list }，请改为：
    // const { list } = await getVenueReviews(props.venueId)
    // reviews.value = list
    reviews.value = await getVenueReviews(props.venueId)

    if (props.showStats) {
      reviewStats.value = await getVenueReviewStats(props.venueId)
    }
    console.log('Loaded reviews:', reviews.value)
  } catch (error) {
    console.error(error)
    ElMessage.error('加载评价失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.venueId,
  (newVal) => {
    if (newVal) loadReviews()
  },
)

onMounted(() => {
  if (props.autoLoad && props.venueId) {
    loadReviews()
  }
})

defineExpose({ refresh: loadReviews })
</script>

<style scoped>
.venue-review {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 评价统计摘要 */
.review-summary {
  display: flex;
  gap: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
}

.summary-left {
  text-align: center;
  min-width: 100px;
}

.average-score {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 8px;
}

.average-label {
  font-size: 14px;
  opacity: 0.9;
}

.summary-right {
  flex: 1;
}

.score-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-text {
  width: 30px;
  font-size: 12px;
  opacity: 0.9;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.count {
  width: 30px;
  font-size: 12px;
  text-align: right;
  opacity: 0.9;
}

/* 评价列表 */
.review-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.list-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.sort-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 评价内容 */
.review-content {
  padding: 20px 24px;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f8f8f8;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-rating {
  margin-bottom: 12px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars .star {
  font-size: 18px;
  color: #ddd;
  line-height: 1;
}

.stars .star.active {
  color: #ffc107;
}

.rating-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.review-text {
  line-height: 1.6;
  color: #333;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 显示更多按钮 */
.show-more {
  padding: 24px 0 0;
  text-align: center;
}

.show-more-btn {
  padding: 10px 32px;
  background: transparent;
  border: 1px solid #409eff;
  border-radius: 20px;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: #ecf5ff;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-text {
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .review-summary {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .summary-left {
    min-width: auto;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .list-actions {
    align-self: flex-start;
  }

  .review-content {
    padding: 16px;
  }
}
</style>
