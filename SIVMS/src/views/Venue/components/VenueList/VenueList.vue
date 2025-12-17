<template>
  <div class="venue-list">
    <div class="list-container">
      <!-- 加载状态 -->
      <div v-if="loading && venues.length === 0" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="venues.length === 0" class="empty">
        <div class="empty-icon">🏟️</div>
        <h3>暂无场馆</h3>
        <p>没有找到符合条件的场馆，请尝试其他搜索条件</p>
        <button class="reset-btn" @click="$emit('refresh')">重新加载</button>
      </div>

      <!-- 场馆列表 -->
      <div v-else class="venues-grid">
        <venue-card
          v-for="venue in venues"
          :key="venue.id"
          :venue="venue"
          @click="$emit('venue-click', venue)"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="venues.length > 0 && pagination.hasMore" class="load-more">
        <button
          class="load-more-btn"
          @click="$emit('load-more')"
          :disabled="loading"
        >
          <span v-if="!loading">加载更多</span>
          <span v-else>加载中...</span>
        </button>
      </div>

      <!-- 分页信息 -->
      <div v-if="venues.length > 0" class="pagination-info">
        <p>
          共 {{ pagination.total }} 个场馆，
          显示 {{ venues.length }} 个
          <span v-if="pagination.pageNum > 1">
            （第 {{ pagination.pageNum }} 页）
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import VenueCard from '../VenueCard/VenueCard.vue'

export default {
  name: 'VenueList',

  components: {
    VenueCard
  },

  props: {
    venues: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        pageNum: 1,
        pageSize: 10,
        total: 0,
        hasMore: true
      })
    }
  }
}
</script>

<style src="./VenueList.css"></style>
