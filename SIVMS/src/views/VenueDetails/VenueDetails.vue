<template>
  <div class="venue-detail-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载场馆详情中...</p>
    </div>

    <!-- 场馆不存在 -->
    <div v-else-if="!venue" class="not-found">
      <div class="not-found-content">
        <div class="not-found-icon">
          <i class="el-icon-office-building"></i>
        </div>
        <h2>场馆不存在</h2>
        <p>抱歉，您访问的场馆不存在或已被删除</p>
        <el-button type="primary" @click="goBack">
          <i class="el-icon-back"></i>
          返回上一页
        </el-button>
      </div>
    </div>

    <!-- 场馆详情内容 -->
    <div v-else class="venue-detail-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/booking' }">场馆预订</el-breadcrumb-item>
          <el-breadcrumb-item>{{ venue.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 场馆图片区域 -->
      <div class="venue-images-section">
        <!-- 主图 -->
        <div class="main-image" @click="showImageGallery">
          <img :src="mainImage" :alt="venue.name" />
          <div class="image-overlay">
            <i class="el-icon-zoom-in"></i>
            <span>点击查看大图</span>
          </div>
        </div>

        <!-- 缩略图列表 -->
        <div class="thumbnail-list">
          <div
            v-for="(img, index) in venueImages"
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentImageIndex === index }"
            @click="changeImage(index)"
          >
            <img :src="img" :alt="`${venue.name}-${index + 1}`" />
          </div>
        </div>

        <!-- 场馆状态标签 -->
        <div class="venue-status-tag">
          <el-tag :type="getStatusType(venue.status)" size="large">
            {{ getStatusText(venue.status) }}
          </el-tag>
        </div>
      </div>

      <!-- 场馆基本信息 -->
      <div class="venue-basic-info">
        <div class="info-left">
          <h1 class="venue-name">{{ venue.name }}</h1>

          <!-- 评分 -->
          <div class="venue-rating">
            <div class="rating-stars">
              <span class="stars">★★★★★</span>
              <span class="rating-value">{{ venue.rating || '4.5' }}</span>
            </div>
            <div class="rating-tags">
              <el-tag type="success" size="small">好评如潮</el-tag>
              <el-tag type="warning" size="small">热门场馆</el-tag>
            </div>
          </div>

          <!-- 场馆地址 -->
          <div class="venue-address">
            <i class="el-icon-location"></i>
            <span>{{ venue.address }}</span>
            <el-button type="text" @click="showMap" class="view-map-btn">
              <i class="el-icon-map-location"></i>
              查看地图
            </el-button>
          </div>

          <!-- 开放时间 -->
          <div class="open-hours">
            <i class="el-icon-time"></i>
            <span>开放时间：{{ venue.openHours || '08:00-22:00' }}</span>
          </div>
        </div>

        <div class="info-right">
          <!-- 价格信息 -->
          <div class="price-card">
            <div class="price-header">
              <h3>预订价格</h3>
              <span class="price-unit">/小时</span>
            </div>
            <div class="price-content">
              <div class="current-price">
                <span class="price-label">¥</span>
                <span class="price-value">{{ venue.price || '150' }}</span>
              </div>
              <div v-if="venue.originalPrice" class="original-price">
                原价：¥{{ venue.originalPrice }}
              </div>
            </div>

            <!-- 预订按钮 -->
            <div class="booking-actions">
              <el-button
                type="primary"
                size="large"
                @click="handleBooking"
                :disabled="venue.status !== 1"
                class="booking-btn"
              >
                <i class="el-icon-shopping-cart-2"></i>
                {{ venue.status === 1 ? '立即预订' : '暂时关闭' }}
              </el-button>
              <el-button type="info" size="large" @click="openRulesDialog" class="rules-btn">
                <i class="el-icon-document"></i>
                预订规则
              </el-button>
            </div>

            <!-- 预订提示 -->
            <div class="booking-tips">
              <div class="tip-item">
                <i class="el-icon-circle-check"></i>
                <span>支持在线预订</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 场馆详细信息 -->
      <div class="venue-details-section">
        <div class="section-header">
          <h3>场馆介绍</h3>
        </div>

        <div class="intro-content">
          <p class="description">
            {{ venue.description || '专业运动场馆，配备先进设施，提供优质服务' }}
          </p>

          <!-- 场馆特色 -->
          <div class="venue-features">
            <h4>场馆特色</h4>
            <div class="features-list">
              <div v-for="(feature, index) in venueFeatures" :key="index" class="feature-item">
                <i class="el-icon-check"></i>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>

          <!-- 设施设备 -->
          <div class="facilities-section">
            <h4>设施设备</h4>
            <div class="facilities-list">
              <div v-for="(facility, index) in venueFacilities" :key="index" class="facility-item">
                <div class="facility-icon">
                  <i :class="getFacilityIcon(facility)"></i>
                </div>
                <div class="facility-name">{{ facility }}</div>
              </div>
            </div>
          </div>

          <!-- 场地规格 -->
          <div class="specifications">
            <h4>场地规格</h4>
            <div class="spec-list">
              <div class="spec-item">
                <span class="spec-label">场地类型：</span>
                <span class="spec-value">{{ venue.type || '综合运动馆' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">容纳人数：</span>
                <span class="spec-value">{{ venue.capacity || '200' }}人</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">场地数量：</span>
                <span class="spec-value">{{ venue.courtCount || '5' }}个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- ============ 引入评价组件 ============ -->
      <div class="review-section">
        <VenueReview :venue-id="reviewVenueId" :show-stats="true" :initial-display-count="5" />
      </div>
      <!-- ============ 结束评价组件 ============ -->

      <!-- 相关推荐 -->
      <div class="related-venues">
        <h3 class="section-title">推荐场馆</h3>
        <div class="related-list">
          <div v-for="relatedVenue in relatedVenues" :key="relatedVenue.id" class="related-item">
            <div class="related-image" @click="goToVenueDetail(relatedVenue.id)">
              <img :src="relatedVenue.image || defaultImage" :alt="relatedVenue.name" />
              <div class="related-status" :class="getStatusClass(relatedVenue.status)">
                {{ getStatusText(relatedVenue.status) }}
              </div>
            </div>
            <div class="related-info">
              <h4 class="related-name" @click="goToVenueDetail(relatedVenue.id)">
                {{ relatedVenue.name }}
              </h4>
              <div class="related-address">
                <i class="el-icon-location"></i>
                <span>{{ relatedVenue.address }}</span>
              </div>
              <div class="related-price">
                <span class="price-label">¥</span>
                <span class="price-value">{{ relatedVenue.price }}</span>
                <span class="price-unit">/小时</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <el-dialog
      v-model="showImageViewer"
      title="场馆图片"
      width="90%"
      top="5vh"
      append-to-body
      :fullscreen="false"
    >
      <div class="image-viewer-content">
        <div class="viewer-main-image">
          <img
            :src="viewerImages[viewerCurrentIndex]"
            :alt="`场馆图片-${viewerCurrentIndex + 1}`"
          />
        </div>
        <div class="viewer-thumbnails">
          <div
            v-for="(img, index) in viewerImages"
            :key="index"
            class="viewer-thumbnail"
            :class="{ active: viewerCurrentIndex === index }"
            @click="viewerCurrentIndex = index"
          >
            <img :src="img" :alt="`缩略图-${index + 1}`" />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="prevImage">
            <i class="el-icon-arrow-left"></i>
            上一张
          </el-button>
          <span class="image-counter"
            >{{ viewerCurrentIndex + 1 }} / {{ viewerImages.length }}</span
          >
          <el-button @click="nextImage">
            下一张
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预订规则对话框 -->
    <el-dialog v-model="showRulesDialog" title="预订规则" width="600px" append-to-body>
      <div class="rules-dialog">
        <div class="rules-section">
          <h4>预订须知</h4>
          <div class="rules-list">
            <div class="rule-item">
              <div class="rule-icon">
                <i class="el-icon-time"></i>
              </div>
              <div class="rule-content">
                <h5>预订时间</h5>
                <p>可提前7天预订，最晚预订时间为使用前2小时</p>
              </div>
            </div>

            <div class="rule-item">
              <div class="rule-icon">
                <i class="el-icon-money"></i>
              </div>
              <div class="rule-content">
                <h5>费用说明</h5>
                <p>费用按小时计算，最低预订时长为1小时</p>
              </div>
            </div>

            <div class="rule-item">
              <div class="rule-icon">
                <i class="el-icon-circle-close"></i>
              </div>
              <div class="rule-content">
                <h5>取消政策</h5>
                <p>请在预订开始时间前2小时操作取消</p>
              </div>
            </div>

            <div class="rule-item">
              <div class="rule-icon">
                <i class="el-icon-user"></i>
              </div>
              <div class="rule-content">
                <h5>使用规定</h5>
                <p>请按时到场，爱护场地设施</p>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <h4>常见问题</h4>
          <el-collapse>
            <el-collapse-item title="如何修改预订时间？" name="1">
              <div>如需修改预订时间，请在预订开始时间前2小时联系客服或通过系统进行修改。</div>
            </el-collapse-item>
            <el-collapse-item title="预订可以几个人使用？" name="2">
              <div>场地预订人数上限为场地容纳人数。</div>
            </el-collapse-item>
            <el-collapse-item title="可以自带器材吗？" name="3">
              <div>可以自带器材，但需符合场馆使用规定。</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showRulesDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 地图对话框 -->
    <el-dialog v-model="showMapDialog" title="场馆位置" width="600px" append-to-body>
      <div class="map-dialog">
        <div class="map-placeholder">
          <div class="map-simulated">
            <div class="map-marker">
              <i class="el-icon-location"></i>
            </div>
            <div class="venue-location-info">
              <h4>{{ venue?.name }}</h4>
              <p>{{ venue?.address }}</p>
              <el-button type="primary" size="small" @click="openNavigation">
                <i class="el-icon-map-location"></i>
                开始导航
              </el-button>
            </div>
          </div>
        </div>
        <div class="map-actions">
          <el-button @click="copyAddress">
            <i class="el-icon-document-copy"></i>
            复制地址
          </el-button>
        </div>
      </div>
    </el-dialog>
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
            >渝ICP备2025076592号-7</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import VenueReview from '@/components/ReviewComponent.vue'
import { fetchVenueDetail } from '@/api/venue'

export default {
  name: 'VenueDetailPage',

  components: {
    NavBar,
    VenueReview,
  },

  // 接收路由/父组件传进来的 id（可选）
  props: {
    venueId: {
      type: [String, Number],
      required: false,
    },
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    // 实际用于查询的场馆 ID：优先用 prop，没有就用路由参数
    const resolvedVenueId = ref(props.venueId || route.params.id)

    // 状态管理
    const loading = ref(true)
    const venue = ref(null)
    const currentImageIndex = ref(0)
    const showImageViewer = ref(false)
    const viewerCurrentIndex = ref(0)
    const showRulesDialog = ref(false)
    const showMapDialog = ref(false)

    // 默认图片
    const defaultImage =
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 计算属性（用户）
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)

    // 图片
    const venueImages = computed(() => {
      if (!venue.value) return [defaultImage]
      const images = venue.value.images || []
      return images.length > 0 ? images : [defaultImage]
    })

    const mainImage = computed(() => venueImages.value[currentImageIndex.value])
    const viewerImages = computed(() => venueImages.value)

    // 特色
    const venueFeatures = computed(() => {
      return (
        venue.value?.features || ['专业级运动场地', '先进照明系统', '舒适更衣室', '专业教练指导']
      )
    })

    // 设施
    const venueFacilities = computed(() => {
      if (!venue.value?.facilities) return ['空调', '淋浴', 'WiFi', '休息区']
      if (typeof venue.value.facilities === 'string') {
        return venue.value.facilities.split(/[、,，]/).slice(0, 6)
      }
      if (Array.isArray(venue.value.facilities)) {
        return venue.value.facilities.slice(0, 6)
      }
      return ['空调', '淋浴', 'WiFi', '休息区']
    })

    // 推荐场馆（仍是前端写死）
    const relatedVenues = computed(() => [
      {
        id: 2,
        name: '朝阳网球中心',
        address: '北京市朝阳区体育中心A座',
        price: 120,
        rating: 4.8,
        status: 1,
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4314c?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        name: '奥林匹克游泳馆',
        address: '北京市朝阳区奥运村',
        price: 80,
        rating: 4.6,
        status: 1,
        image: 'https://images.unsplash.com/photo-1565008887502-4c1bcd2b6d6b?w=400&h=300&fit=crop',
      },
      {
        id: 4,
        name: '国际羽毛球馆',
        address: '北京市海淀区体育公园',
        price: 90,
        rating: 4.7,
        status: 1,
        image: 'https://images.unsplash.com/photo-1595435934247-5d33b7f92c70?w=400&h=300&fit=crop',
      },
    ])

    // 给子组件评价用的 ID（数字类型）
    const reviewVenueId = computed(() =>
      resolvedVenueId.value ? Number(resolvedVenueId.value) : 0,
    )

    // ========= 从后端获取场馆详情 =========
    const loadVenueDetail = async () => {
      if (!resolvedVenueId.value) return
      loading.value = true
      try {
        const res = await fetchVenueDetail(resolvedVenueId.value)
        // 你的 request.js 已经返回 response.data 了，这里的 res 就是 data
        // 如果后端是 { code, data, message } 格式，写成：venue.value = res.data
        venue.value = res
      } catch (error) {
        console.error('加载场馆详情失败:', error)
        ElMessage.error(error?.response?.data?.message || '加载场馆详情失败')
        venue.value = null
      } finally {
        loading.value = false
      }
    }
    // ========= 关键结束 =========

    // 初次加载
    onMounted(loadVenueDetail)

    // prop venueId 变化时，重新加载
    watch(
      () => props.venueId,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          resolvedVenueId.value = newVal
          currentImageIndex.value = 0
          loadVenueDetail()
        }
      },
    )

    // 路由参数变化时（复用同一个详情页组件），重新加载
    watch(
      () => route.params.id,
      (newId, oldId) => {
        // 如果外部通过 prop 显式传了 id，则以 prop 为准，不用路由的
        if (props.venueId) return
        if (newId && newId !== oldId) {
          resolvedVenueId.value = newId
          currentImageIndex.value = 0
          loadVenueDetail()
        }
      },
    )

    const getStatusType = (status) => {
      const types = {
        1: 'success',
        0: 'danger',
        2: 'warning',
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        1: '营业中',
        0: '已关闭',
        2: '维修中',
      }
      return texts[status] || '未知状态'
    }

    const getStatusClass = (status) => {
      const classes = {
        1: 'open',
        0: 'closed',
        2: 'maintenance',
      }
      return classes[status] || 'closed'
    }

    const getFacilityIcon = (facility) => {
      const iconMap = {
        空调: 'el-icon-fan',
        淋浴: 'el-icon-water-cup',
        停车场: 'el-icon-place',
        WiFi: 'el-icon-link',
        更衣室: 'el-icon-user',
        休息区: 'el-icon-coffee-cup',
      }
      return iconMap[facility] || 'el-icon-circle-check'
    }

    const changeImage = (index) => {
      currentImageIndex.value = index
    }

    const showImageGallery = () => {
      viewerCurrentIndex.value = currentImageIndex.value
      showImageViewer.value = true
    }

    const prevImage = () => {
      if (viewerCurrentIndex.value > 0) viewerCurrentIndex.value--
    }

    const nextImage = () => {
      if (viewerCurrentIndex.value < viewerImages.value.length - 1) {
        viewerCurrentIndex.value++
      }
    }

    const handleBooking = () => {
      if (!isLogin.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      router.push({
        path: '/booking/order',
        query: { venueId: venue.value.id },
      })
    }

    const openRulesDialog = () => {
      showRulesDialog.value = true
    }

    const showMap = () => {
      if (!venue.value?.address) {
        ElMessage.warning('暂无地址信息')
        return
      }
      showMapDialog.value = true
    }

    const openNavigation = () => {
      if (!venue.value?.address) return
      window.open(
        `https://uri.amap.com/marker?position=116.397428,39.90923&name=${encodeURIComponent(
          venue.value.name,
        )}&src=mypage&coordinate=gaode&callnative=1`,
      )
    }

    const copyAddress = async () => {
      if (!venue.value?.address) return
      try {
        await navigator.clipboard.writeText(venue.value.address)
        ElMessage.success('地址已复制到剪贴板')
      } catch (err) {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制')
      }
    }

    const goToVenueDetail = (id) => {
      router.push(`/venue/detail/${id}`)
    }

    const goBack = () => {
      router.go(-1)
    }

    return {
      // 状态
      loading,
      venue,
      currentImageIndex,
      showImageViewer,
      viewerCurrentIndex,
      showRulesDialog,
      showMapDialog,

      // 其他数据
      defaultImage,
      // 给模板用的评论组件 id
      reviewVenueId,

      // 计算属性
      isLogin,
      userName,
      venueImages,
      mainImage,
      viewerImages,
      venueFeatures,
      venueFacilities,
      relatedVenues,

      // 方法
      getStatusType,
      getStatusText,
      getStatusClass,
      getFacilityIcon,
      changeImage,
      showImageGallery,
      prevImage,
      nextImage,
      handleBooking,
      openRulesDialog,
      showMap,
      openNavigation,
      copyAddress,
      goToVenueDetail,
      goBack,
    }
  },
}
</script>
<style scoped lang="scss">
.venue-detail-page {
  min-height: 100vh;
  background: #f8fafc;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #e2e8f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  p {
    color: #64748b;
    font-size: 16px;
  }
}

// 场馆不存在
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;

  .not-found-content {
    background: white;
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

    .not-found-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;

      i {
        font-size: 40px;
        color: white;
      }
    }

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 15px;
    }

    p {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 30px;
    }
  }
}

// 场馆详情容器
.venue-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

// 面包屑导航
.breadcrumb {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

// 场馆图片区域
.venue-images-section {
  position: relative;
  margin-bottom: 30px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  .main-image {
    position: relative;
    height: 400px;
    cursor: pointer;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover {
      img {
        transform: scale(1.05);
      }

      .image-overlay {
        opacity: 1;
      }
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;

      i {
        font-size: 40px;
        margin-bottom: 10px;
      }

      span {
        font-size: 16px;
      }
    }
  }

  .thumbnail-list {
    display: flex;
    padding: 15px;
    background: white;
    overflow-x: auto;
    gap: 10px;

    .thumbnail-item {
      flex: 0 0 80px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &.active {
        border-color: #667eea;
      }

      &:hover {
        transform: translateY(-2px);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .venue-status-tag {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }
}

// 场馆基本信息
.venue-basic-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.info-left {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);

  .venue-name {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 20px 0;
  }

  .venue-rating {
    margin-bottom: 25px;

    .rating-stars {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;

      .stars {
        color: #f59e0b;
        font-size: 20px;
      }

      .rating-value {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .rating-tags {
      display: flex;
      gap: 8px;
    }
  }

  .venue-address {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8fafc;
    border-radius: 12px;

    i {
      color: #667eea;
      font-size: 20px;
    }

    span {
      flex: 1;
      color: #1e293b;
      font-size: 16px;
    }

    .view-map-btn {
      color: #667eea;
      font-weight: 500;
    }
  }

  .open-hours {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #64748b;
    font-size: 16px;

    i {
      color: #f59e0b;
      font-size: 18px;
    }
  }
}

.info-right {
  .price-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 100px;

    .price-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }

      .price-unit {
        color: #64748b;
        font-size: 14px;
      }
    }

    .price-content {
      margin-bottom: 25px;

      .current-price {
        display: flex;
        align-items: baseline;
        margin-bottom: 10px;

        .price-label {
          font-size: 20px;
          color: #ef4444;
          font-weight: 600;
          margin-right: 4px;
        }

        .price-value {
          font-size: 36px;
          color: #ef4444;
          font-weight: 700;
          line-height: 1;
        }
      }

      .original-price {
        color: #94a3b8;
        text-decoration: line-through;
        font-size: 16px;
      }
    }

    .booking-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;

      .booking-btn {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;

        &:hover {
          opacity: 0.9;
        }

        &:disabled {
          background: #94a3b8;
        }
      }

      .rules-btn {
        height: 48px;
        font-size: 16px;
      }
    }

    .booking-tips {
      .tip-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #64748b;

        i {
          color: #10b981;
          font-size: 16px;
        }
      }
    }
  }
}

// 场馆详细信息
.venue-details-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);

  .section-header {
    margin-bottom: 25px;

    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
  }

  .description {
    font-size: 16px;
    color: #475569;
    line-height: 1.6;
    margin: 0 0 30px 0;
  }

  .venue-features {
    margin-bottom: 30px;

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 15px 0;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;

        i {
          color: #10b981;
          font-size: 16px;
        }

        span {
          color: #475569;
          font-size: 14px;
        }
      }
    }
  }

  .facilities-section {
    margin-bottom: 30px;

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 15px 0;
    }

    .facilities-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;

      .facility-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        background: #f8fafc;
        border-radius: 12px;
        text-align: center;

        .facility-icon {
          width: 40px;
          height: 40px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;

          i {
            color: white;
            font-size: 18px;
          }
        }

        .facility-name {
          font-size: 14px;
          color: #475569;
        }
      }
    }
  }

  .specifications {
    .spec-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;

      .spec-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          border-bottom: none;
        }

        .spec-label {
          color: #64748b;
          font-size: 14px;
        }

        .spec-value {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
}

// 相关推荐
.related-venues {
  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 20px 0;
  }

  .related-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;

    .related-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
      }

      .related-image {
        position: relative;
        height: 180px;
        cursor: pointer;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .related-status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;

          &.open {
            background: #10b981;
          }

          &.closed {
            background: #ef4444;
          }

          &.maintenance {
            background: #f59e0b;
          }
        }
      }

      .related-info {
        padding: 15px;

        .related-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
          cursor: pointer;

          &:hover {
            color: #667eea;
          }
        }

        .related-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;

          i {
            font-size: 14px;
          }
        }

        .related-price {
          display: flex;
          align-items: baseline;

          .price-label {
            font-size: 12px;
            color: #ef4444;
            font-weight: 600;
            margin-right: 2px;
          }

          .price-value {
            font-size: 20px;
            color: #ef4444;
            font-weight: 700;
            margin-right: 2px;
          }

          .price-unit {
            font-size: 12px;
            color: #94a3b8;
          }
        }
      }
    }
  }
}

// 图片查看器
.image-viewer-content {
  .viewer-main-image {
    text-align: center;
    margin-bottom: 20px;

    img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
    }
  }

  .viewer-thumbnails {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px 0;

    .viewer-thumbnail {
      flex: 0 0 80px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &.active {
        border-color: #667eea;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .image-counter {
      color: #64748b;
      font-size: 14px;
    }
  }
}

// 预订规则对话框
.rules-dialog {
  .rules-section {
    margin-bottom: 30px;

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }

    .rules-list {
      .rule-item {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .rule-icon {
          flex: 0 0 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: 20px;
            color: #667eea;
          }
        }

        .rule-content {
          flex: 1;

          h5 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 8px 0;
          }

          p {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }
  }

  .faq-section {
    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }

    :deep(.el-collapse) {
      .el-collapse-item__header {
        font-size: 16px;
        font-weight: 500;
        color: #1e293b;
        padding: 15px 0;
      }

      .el-collapse-item__content {
        color: #64748b;
        font-size: 14px;
        padding: 15px 0;
        line-height: 1.6;
      }
    }
  }
}

// 地图对话框
.map-dialog {
  .map-placeholder {
    height: 300px;
    margin-bottom: 20px;
    background: #f8fafc;
    border-radius: 12px;
    position: relative;
    overflow: hidden;

    .map-simulated {
      width: 100%;
      height: 100%;
      position: relative;

      .map-marker {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          color: white;
          font-size: 24px;
        }
      }

      .venue-location-info {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        p {
          margin: 0 0 12px 0;
          color: #64748b;
        }
      }
    }
  }

  .map-actions {
    text-align: center;
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 992px) {
  .venue-basic-info {
    grid-template-columns: 1fr;
  }

  .related-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .venue-detail-container {
    padding: 20px;
  }

  .venue-images-section .main-image {
    height: 300px;
  }

  .info-left .venue-name {
    font-size: 28px;
  }

  .features-list,
  .facilities-list {
    grid-template-columns: 1fr;
  }

  .spec-list {
    grid-template-columns: 1fr;
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
