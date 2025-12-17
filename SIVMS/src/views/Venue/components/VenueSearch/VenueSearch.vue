<template>
  <div class="venue-search">
    <div class="search-container">
      <div class="search-box">

        <!-- 搜索框 -->
        <div class="search-input-group">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            v-model.trim="searchForm.name"
            type="text"
            class="search-input"
            placeholder="搜索场馆名称..."
            @input="onInputChange"
          />
        </div>

        <!-- 筛选条件 -->
        <div class="filter-group">
          <select
            v-model="searchForm.type"
            class="filter-select"
            @change="emitSearch"
          >
            <option value="">所有类型</option>
            <option v-for="type in venueTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <button v-if="hasFilters" class="clear-btn" @click="resetSearch">
            清空筛选
          </button>
        </div>

        <button class="search-btn" @click="emitSearch">
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueSearch',

  props: {
    venueTypes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchForm: {
        name: '',
        type: ''
      },
      debounceTimer: null
    }
  },

  computed: {
    // 是否存在筛选条件
    hasFilters() {
      return !!(this.searchForm.name || this.searchForm.type)
    },

    // ⭐ 统一构建 GET 请求的 params（关键）
    queryParams() {
      const params = {}
      if (this.searchForm.name) params.name = this.searchForm.name
      if (this.searchForm.type) params.type = this.searchForm.type
      return params
    }
  },

  methods: {
    // ⭐ 唯一对外的搜索触发方法
    emitSearch() {
      this.$emit('search', { ...this.queryParams })
    },

    // 输入框防抖
    onInputChange() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.emitSearch()
      }, 500)
    },

    // 重置
    resetSearch() {
      this.searchForm.name = ''
      this.searchForm.type = ''
      this.emitSearch()
    }
  },

  beforeUnmount() {
    clearTimeout(this.debounceTimer)
  }
}
</script>

<style src="./VenueSearch.css"></style>
