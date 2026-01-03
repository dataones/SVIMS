<template>
  <div class="venue-card" @click="$emit('click')">
    <!-- 场馆图片 -->
    <div class="card-image" :style="{ backgroundImage: `url(${venue.image || defaultImage})` }">
      <div class="image-overlay"></div>
      <div class="venue-type">{{ venue.type || '未知类型' }}</div>
      <div class="venue-status" :class="getStatusClass(venue.status)">
        {{ getStatusText(venue.status) }}
      </div>
    </div>

    <!-- 场馆信息 -->
    <div class="card-content">
      <div class="venue-header">
        <h3 class="venue-name">{{ venue.name }}</h3>
        <div class="venue-price">
          ¥<span class="price-value">{{ venue.price || 0 }}</span
          >/小时
        </div>
      </div>

      <p class="venue-address">
        <span class="icon">📍</span>
        {{ venue.location || '地址暂未提供' }}
      </p>

      <p class="venue-desc">
        {{ venue.description || '暂无描述' }}
      </p>

      <!-- 附加信息 -->
      <div v-if="venue.facilities || venue.openHours" class="venue-extra">
        <div v-if="venue.facilities" class="facilities">
          <span class="label">设施：</span>
          <span class="value">{{ venue.facilities }}</span>
        </div>
        <div v-if="venue.openHours" class="open-hours">
          <span class="label">开放：</span>
          <span class="value">{{ venue.openHours }}</span>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="venue-actions">
        <button class="btn-detail" @click.stop="handleDetail">查看详情</button>
        <button class="btn-book" @click.stop="handleBook">立即预约</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueCard',

  props: {
    venue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  data() {
    return {
      defaultImage:
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
  },

  methods: {
    getStatusClass(status) {
      switch (status) {
        case 1:
          return 'open'
        case 0:
          return 'closed'
        default:
          return 'unknown'
      }
    },

    getStatusText(status) {
      switch (status) {
        case 1:
          return '营业中'
        case 0:
          return '已关闭'
        default:
          return '状态未知'
      }
    },

    handleDetail() {
      // 先触发事件通知父组件
      this.$emit('VenueDetails', this.venue)

      // 使用 params 方式跳转
      this.$router.push({
        name: 'VenueDetails', // 使用路由名称
        params: {
          venueId: this.venue.id, // 注意参数名要和路由定义的 :venueId 一致
        },
      })
    },

    handleBook() {
      this.$emit('booking', this.venue)
    },
  },
}
</script>

<style src="./VenueCard.css"></style>
