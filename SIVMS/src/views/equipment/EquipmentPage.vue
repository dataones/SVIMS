<template>
  <div class="equipment-rental-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 登录检查 -->
    <div v-if="!isLogin" class="login-required">
      <div class="login-prompt">
        <div class="prompt-icon">
          <i class="el-icon-box"></i>
        </div>
        <h2>请先登录</h2>
        <p>租赁器材需要登录账号，请先登录</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="login-btn">
            <i class="el-icon-user"></i>
            立即登录
          </el-button>
          <el-button type="success" size="large" @click="goToRegister" plain>
            <i class="el-icon-user-plus"></i>
            注册账号
          </el-button>
        </div>
      </div>
    </div>

    <!-- 已登录用户显示内容 -->
    <div v-else class="equipment-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="el-icon-box"></i>
            器材租赁
          </h1>
          <p class="page-subtitle">选择您需要的运动器材，轻松租赁</p>
        </div>
        <div class="header-right">
          <el-button type="info" size="large" @click="viewMyOrders">
            <i class="el-icon-shopping-cart-2"></i>
            我的器材订单
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <div class="search-box">
          <div class="search-input-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索器材名称..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
          </div>

          <div class="filter-group">
            <!-- 器材分类筛选 -->
            <div class="filter-item">
              <span class="filter-label">器材分类：</span>
              <el-select
                v-model="selectedCategory"
                placeholder="所有分类"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option label="所有分类" value="" />
                <el-option
                  v-for="category in equipmentCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>
            </div>

            <!-- 价格筛选 -->
            <div class="filter-item">
              <span class="filter-label">价格区间：</span>
              <el-select
                v-model="selectedPriceRange"
                placeholder="价格区间"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="range in priceRanges"
                  :key="range.value"
                  :label="range.label"
                  :value="range.value"
                />
              </el-select>
            </div>

            <!-- 状态筛选 -->
            <div class="filter-item">
              <span class="filter-label">器材状态：</span>
              <el-select
                v-model="selectedStatus"
                placeholder="全部状态"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value="" />
                <el-option label="可租赁" :value="1" />
                <el-option label="已租出" :value="0" />
                <el-option label="维修中" :value="2" />
              </el-select>
            </div>

            <!-- 排序 -->
            <div class="filter-item">
              <span class="filter-label">排序方式：</span>
              <el-select
                v-model="sortField"
                placeholder="选择排序"
                size="large"
                @change="handleSearch"
              >
                <el-option label="价格从低到高" value="price_asc" />
                <el-option label="价格从高到低" value="price_desc" />
                <el-option label="热门程度" value="popular" />
                <el-option label="新品优先" value="new" />
              </el-select>
            </div>

            <el-button
              type="info"
              size="large"
              @click="resetFilters"
              :disabled="!hasFilters"
              class="reset-btn"
            >
              <i class="el-icon-refresh"></i>
              重置筛选
            </el-button>
          </div>
        </div>
      </div>

      <!-- 租赁流程提示 -->
      <div class="rental-process">
        <div class="process-steps">
          <div class="process-step">
            <div class="step-icon">
              <i class="el-icon-search"></i>
            </div>
            <div class="step-info">
              <div class="step-title">选择器材</div>
              <div class="step-desc">浏览并选择需要的器材</div>
            </div>
          </div>
          <div class="process-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="process-step">
            <div class="step-icon">
              <i class="el-icon-date"></i>
            </div>
            <div class="step-info">
              <div class="step-title">填写租赁信息</div>
              <div class="step-desc">选择租赁时间和数量</div>
            </div>
          </div>
          <div class="process-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="process-step">
            <div class="step-icon">
              <i class="el-icon-money"></i>
            </div>
            <div class="step-info">
              <div class="step-title">支付订单</div>
              <div class="step-desc">在线支付租赁费用</div>
            </div>
          </div>
          <div class="process-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="process-step">
            <div class="step-icon">
              <i class="el-icon-truck"></i>
            </div>
            <div class="step-info">
              <div class="step-title">收货使用</div>
              <div class="step-desc">送货上门或自取使用</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 器材列表区域 -->
      <div class="equipment-section">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载器材中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredEquipment.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="el-icon-box"></i>
          </div>
          <h3>未找到符合条件的器材</h3>
          <p>尝试更换搜索关键词或筛选条件</p>
          <el-button type="primary" @click="resetFilters">显示所有器材</el-button>
        </div>

        <!-- 器材列表 -->
        <div v-else class="equipment-list">
          <div v-for="equipment in filteredEquipment" :key="equipment.id" class="equipment-item">
            <!-- 器材图片 -->
            <div class="equipment-image" @click="viewEquipmentDetail(equipment)">
              <img :src="equipment.image || defaultImage" :alt="equipment.name" />
              <div class="equipment-status" :class="getStatusClass(equipment.status)">
                {{ getStatusText(equipment.status) }}
              </div>
              <div class="equipment-category">{{ equipment.category }}</div>
              <div v-if="equipment.hot" class="hot-badge">
                <i class="el-icon-fire"></i>
                热门
              </div>
              <div v-if="equipment.new" class="new-badge">新品</div>
            </div>

            <!-- 器材信息 -->
            <div class="equipment-info">
              <div class="equipment-header">
                <h3 class="equipment-name" @click="viewEquipmentDetail(equipment)">
                  {{ equipment.name }}
                </h3>
                <div class="equipment-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-value">{{ equipment.rating || '4.5' }}</span>
                  <span class="review-count">({{ equipment.reviewCount || '45' }})</span>
                </div>
              </div>

              <div class="equipment-spec">
                <div class="spec-item">
                  <i class="el-icon-s-grid"></i>
                  <span>规格：{{ equipment.spec || '标准规格' }}</span>
                </div>
                <div class="spec-item">
                  <i class="el-icon-medal"></i>
                  <span>品牌：{{ equipment.brand || '知名品牌' }}</span>
                </div>
                <div class="spec-item">
                  <i class="el-icon-box"></i>
                  <span>库存：{{ equipment.stock || 0 }}件</span>
                </div>
              </div>

              <p class="equipment-description">
                {{ equipment.description || '专业运动器材，质量可靠，使用舒适' }}
              </p>

              <div class="equipment-features">
                <span
                  v-for="(feature, index) in getFeatures(equipment)"
                  :key="index"
                  class="feature-tag"
                >
                  {{ feature }}
                </span>
              </div>
            </div>

            <!-- 租赁区域 -->
            <div class="rental-action">
              <div class="price-info">
                <div class="current-price">
                  <span class="price-label">¥</span>
                  <span class="price-value">{{ equipment.price || '20' }}</span>
                  <span class="price-unit">/天</span>
                </div>
                <div v-if="equipment.originalPrice" class="original-price">
                  ¥{{ equipment.originalPrice }}
                </div>
                <div class="deposit-info" v-if="equipment.deposit > 0">
                  <i class="el-icon-money"></i>
                  押金：¥{{ equipment.deposit }}
                </div>
              </div>

              <!-- 租赁数量选择 -->
              <div class="quantity-selector" v-if="equipment.status === 1">
                <div class="quantity-label">租赁数量：</div>
                <el-input-number
                  v-model="equipment.rentalQuantity"
                  :min="1"
                  :max="equipment.maxRental || equipment.stock || 5"
                  size="large"
                  @change="updateCart"
                />
                <div class="stock-info">最多可租{{ equipment.maxRental || equipment.stock || 5 }}件</div>
              </div>

              <!-- 租赁天数选择 -->
              <div class="days-selector" v-if="equipment.status === 1">
                <div class="days-label">租赁天数：</div>
                <div class="days-options">
                  <span
                    v-for="days in [1, 3, 7, 14]"
                    :key="days"
                    class="days-option"
                    :class="{ active: equipment.rentalDays === days }"
                    @click="selectRentalDays(equipment, days)"
                  >
                    {{ days }}天
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button
                  type="info"
                  size="large"
                  @click="viewEquipmentDetail(equipment)"
                  class="detail-btn"
                >
                  <i class="el-icon-view"></i>
                  查看详情
                </el-button>

                <el-button
                  type="success"
                  size="large"
                  @click="addToCart(equipment)"
                  :disabled="equipment.status !== 1 || equipment.rentalQuantity <= 0"
                  class="cart-btn"
                >
                  <i class="el-icon-shopping-cart-2"></i>
                  加入租赁车
                </el-button>

                <el-button
                  type="primary"
                  size="large"
                  @click="rentNow(equipment)"
                  :disabled="equipment.status !== 1"
                  class="rent-btn"
                >
                  <i class="el-icon-box"></i>
                  立即租赁
                </el-button>
              </div>

              <!-- 快速租赁提示 -->
              <div class="quick-rental-tips" v-if="equipment.status === 1">
                <div class="tips-item">
                  <i class="el-icon-circle-check"></i>
                  <span>支持送货上门</span>
                </div>
                <div class="tips-item">
                  <i class="el-icon-circle-check"></i>
                  <span>免费配送范围5公里内</span>
                </div>
                <div class="tips-item">
                  <i class="el-icon-circle-check"></i>
                  <span>租赁满7天享9折优惠</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredEquipment.length > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 36, 48]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 租赁车侧边栏 -->
      <div class="rental-cart-sidebar" :class="{ open: showCart }">
        <div class="cart-header">
          <h3>
            <i class="el-icon-shopping-cart-2"></i>
            租赁车
            <span class="cart-count">({{ cartItems.length }})</span>
          </h3>
          <el-button type="text" @click="closeCart">
            <i class="el-icon-close"></i>
          </el-button>
        </div>

        <div class="cart-content" v-if="cartItems.length > 0">
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-spec">{{ item.spec }}</div>
                <div class="item-details">
                  <span>¥{{ item.price }}/天 × {{ item.quantity }}件</span>
                  <span>共{{ item.days }}天</span>
                </div>
              </div>
              <div class="item-actions">
                <div class="item-price">¥{{ item.totalPrice }}</div>
                <el-button type="text" @click="removeFromCart(item.id)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-item">
              <span>器材费用：</span>
              <span>¥{{ cartEquipmentTotal }}</span>
            </div>
            <div class="summary-item">
              <span>配送费用：</span>
              <span>¥{{ cartDeliveryFee }}</span>
            </div>
            <div class="summary-item discount" v-if="cartDiscount > 0">
              <span>优惠减免：</span>
              <span>-¥{{ cartDiscount }}</span>
            </div>
            <div class="summary-item total">
              <span>合计：</span>
              <span class="total-amount">¥{{ cartTotal }}</span>
            </div>
          </div>

          <div class="cart-actions">
            <el-button type="info" @click="clearCart" class="clear-btn">
              <i class="el-icon-delete"></i>
              清空租赁车
            </el-button>
            <el-button type="primary" @click="goToCheckout" class="checkout-btn">
              <i class="el-icon-shopping-cart-2"></i>
              去结算
            </el-button>
          </div>
        </div>

        <div class="cart-empty" v-else>
          <div class="empty-icon">
            <i class="el-icon-box"></i>
          </div>
          <p>租赁车为空</p>
          <p class="empty-hint">快去选择心仪的器材吧</p>
        </div>
      </div>

      <!-- 租赁车悬浮按钮 -->
      <div class="cart-float-button" @click="toggleCart">
        <i class="el-icon-shopping-cart-2"></i>
        <span class="cart-badge" v-if="cartItems.length > 0">{{ cartItems.length }}</span>
      </div>
    </div>

    <!-- 立即租赁对话框 -->
    <el-dialog
      v-model="showRentDialog"
      :title="`租赁 - ${selectedEquipment?.name || ''}`"
      width="600px"
      append-to-body
    >
      <div v-if="selectedEquipment" class="rent-dialog">
        <div class="equipment-info-summary">
          <div class="equipment-image">
            <img :src="selectedEquipment.image || defaultImage" :alt="selectedEquipment.name" />
          </div>
          <div class="equipment-details">
            <h3>{{ selectedEquipment.name }}</h3>
            <div class="equipment-spec">{{ selectedEquipment.spec || '标准规格' }}</div>
            <div class="equipment-price">¥{{ selectedEquipment.price }}/天</div>
          </div>
        </div>

        <el-form :model="rentForm" label-width="100px">
          <el-form-item label="租赁数量：">
            <el-input-number
              v-model="rentForm.quantity"
              :min="1"
              :max="selectedEquipment.maxRental || selectedEquipment.stock || 5"
              size="large"
            />
            <span class="form-hint">最多可租{{ selectedEquipment.maxRental || selectedEquipment.stock || 5 }}件</span>
          </el-form-item>

          <el-form-item label="租赁天数：">
            <el-input-number
              v-model="rentForm.days"
              :min="1"
              :max="30"
              size="large"
            />
            <span class="form-hint">最长可租30天</span>
          </el-form-item>

          <el-form-item label="租赁日期：">
            <el-date-picker
              v-model="rentForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="large"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
            />
          </el-form-item>

          <el-form-item label="配送方式：">
            <el-radio-group v-model="rentForm.deliveryMethod">
              <el-radio label="delivery">送货上门 (¥15)</el-radio>
              <el-radio label="pickup">自取</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="收货地址：" v-if="rentForm.deliveryMethod === 'delivery'">
            <el-input
              v-model="rentForm.address"
              placeholder="请输入详细收货地址"
              size="large"
            />
          </el-form-item>

          <el-form-item label="联系人：">
            <el-input
              v-model="rentForm.contactName"
              placeholder="请输入联系人姓名"
              size="large"
              class="contact-input"
            />
          </el-form-item>

          <el-form-item label="联系电话：">
            <el-input
              v-model="rentForm.contactPhone"
              placeholder="请输入联系电话"
              size="large"
              class="contact-input"
            />
          </el-form-item>

          <el-form-item label="备注信息：">
            <el-input
              v-model="rentForm.notes"
              type="textarea"
              placeholder="请输入特殊需求或其他备注"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <div class="rent-summary">
            <div class="summary-header">费用明细</div>
            <div class="summary-content">
              <div class="summary-item">
                <span>器材费用：</span>
                <span>¥{{ calculateEquipmentCost() }}</span>
              </div>
              <div class="summary-item" v-if="rentForm.deliveryMethod === 'delivery'">
                <span>配送费用：</span>
                <span>¥15</span>
              </div>
              <div class="summary-item" v-if="selectedEquipment.deposit > 0">
                <span>押金：</span>
                <span>¥{{ selectedEquipment.deposit * rentForm.quantity }}</span>
              </div>
              <div class="summary-item discount" v-if="rentForm.days >= 7">
                <span>长期租赁优惠：</span>
                <span>-¥{{ calculateDiscount() }}</span>
              </div>
              <div class="summary-item total">
                <span>应付总额：</span>
                <span class="total-amount">¥{{ calculateTotalCost() }}</span>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRentDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmRent" :loading="rentLoading">
            确认租赁
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'

export default {
  name: 'EquipmentRentalPage',

  components: {
    NavBar,
  },

  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 用户相关状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)

    // 搜索和筛选状态
    const searchKeyword = ref('')
    const selectedCategory = ref('')
    const selectedPriceRange = ref('')
    const selectedStatus = ref('')
    const sortField = ref('price_asc')
    const equipmentList = ref([])
    const filteredEquipment = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)

    // 租赁车相关
    const cartItems = ref([])
    const showCart = ref(false)

    // 租赁对话框相关
    const showRentDialog = ref(false)
    const rentLoading = ref(false)
    const selectedEquipment = ref(null)
    const rentForm = ref({
      quantity: 1,
      days: 1,
      dateRange: [],
      deliveryMethod: 'delivery',
      address: '',
      contactName: userStore.name || '',
      contactPhone: '',
      notes: ''
    })

    // 默认图片
    const defaultImage = 'https://images.unsplash.com/photo-1599065000019-b8dbf6bc9c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 器材分类选项
    const equipmentCategories = [
      { value: 'ball', label: '球类器材' },
      { value: 'racket', label: '球拍类' },
      { value: 'fitness', label: '健身器材' },
      { value: 'swimming', label: '游泳装备' },
      { value: 'outdoor', label: '户外装备' },
      { value: 'other', label: '其他器材' }
    ]

    // 价格区间选项
    const priceRanges = [
      { value: '0-20', label: '¥0-20' },
      { value: '20-50', label: '¥20-50' },
      { value: '50-100', label: '¥50-100' },
      { value: '100+', label: '¥100以上' }
    ]

    // 计算属性
    const hasFilters = computed(() => {
      return searchKeyword.value || selectedCategory.value ||
             selectedPriceRange.value || selectedStatus.value !== ''
    })

    // 租赁车相关计算属性
    const cartEquipmentTotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
    })

    const cartDeliveryFee = computed(() => {
      return cartItems.value.some(item => item.deliveryMethod === 'delivery') ? 15 : 0
    })

    const cartDiscount = computed(() => {
      // 计算优惠：租赁满7天享9折
      const eligibleItems = cartItems.value.filter(item => item.days >= 7)
      return eligibleItems.reduce((sum, item) => sum + (item.totalPrice * 0.1), 0)
    })

    const cartTotal = computed(() => {
      return cartEquipmentTotal.value + cartDeliveryFee.value - cartDiscount.value
    })

    // 监听登录状态变化
    watch(isLogin, (newVal) => {
      if (newVal) {
        loadEquipment()
        loadCartFromStorage()
      }
    })

    // 生命周期
    onMounted(() => {
      if (isLogin.value) {
        loadEquipment()
        loadCartFromStorage()
      }
    })

    // 方法
    const loadEquipment = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 生成模拟数据
        const mockEquipment = generateMockEquipment(30)

        // 应用筛选
        let filtered = mockEquipment

        // 关键词搜索
        if (searchKeyword.value) {
          const keyword = searchKeyword.value.toLowerCase()
          filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
          )
        }

        // 分类筛选
        if (selectedCategory.value) {
          filtered = filtered.filter(item => item.category === selectedCategory.value)
        }

        // 价格筛选
        if (selectedPriceRange.value) {
          filtered = filterByPrice(filtered, selectedPriceRange.value)
        }

        // 状态筛选
        if (selectedStatus.value !== '') {
          filtered = filtered.filter(item => item.status === parseInt(selectedStatus.value))
        }

        // 排序
        filtered = sortEquipment(filtered, sortField.value)

        // 初始化租赁数量（确保每个器材都有rentalQuantity属性）
        filtered = filtered.map(item => ({
          ...item,
          rentalQuantity: item.rentalQuantity || 1,
          rentalDays: item.rentalDays || 1
        }))

        // 分页
        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        filteredEquipment.value = filtered.slice(startIndex, endIndex)
        equipmentList.value = filtered
        total.value = filtered.length

      } catch (error) {
        console.error('加载器材失败:', error)
        ElMessage.error('加载器材列表失败')
      } finally {
        loading.value = false
      }
    }

    const generateMockEquipment = (count) => {
      const equipment = []
      const categories = ['ball', 'racket', 'fitness', 'swimming', 'outdoor', 'other']
      const categoryNames = {
        'ball': '球类器材',
        'racket': '球拍类',
        'fitness': '健身器材',
        'swimming': '游泳装备',
        'outdoor': '户外装备',
        'other': '其他器材'
      }

      const brands = ['耐克', '阿迪达斯', '李宁', '威尔胜', '斯伯丁', '尤尼克斯']
      const ballItems = ['篮球', '足球', '排球', '网球', '羽毛球', '乒乓球']
      const racketItems = ['网球拍', '羽毛球拍', '乒乓球拍']
      const fitnessItems = ['瑜伽垫', '哑铃', '跳绳', '拉力器']
      const swimmingItems = ['游泳镜', '游泳帽', '浮板']
      const outdoorItems = ['帐篷', '睡袋', '登山杖']

      for (let i = 1; i <= count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        let name = ''
        let spec = ''

        switch (category) {
          case 'ball':
            name = ballItems[Math.floor(Math.random() * ballItems.length)]
            spec = ['标准7号球', '5号球', '成人标准', '儿童专用'][Math.floor(Math.random() * 4)]
            break
          case 'racket':
            name = racketItems[Math.floor(Math.random() * racketItems.length)]
            spec = ['碳纤维专业级', '铝合金入门级', '全碳素专业版'][Math.floor(Math.random() * 3)]
            break
          case 'fitness':
            name = fitnessItems[Math.floor(Math.random() * fitnessItems.length)]
            spec = ['加厚防滑', '10公斤', '专业级'][Math.floor(Math.random() * 3)]
            break
          case 'swimming':
            name = swimmingItems[Math.floor(Math.random() * swimmingItems.length)]
            spec = ['防雾高清', '硅胶材质', '专业训练'][Math.floor(Math.random() * 3)]
            break
          case 'outdoor':
            name = outdoorItems[Math.floor(Math.random() * outdoorItems.length)]
            spec = ['双人帐篷', '羽绒睡袋', '碳纤维'][Math.floor(Math.random() * 3)]
            break
          default:
            name = '运动器材'
            spec = '标准规格'
        }

        const price = Math.floor(Math.random() * 80) + 10
        const originalPrice = Math.random() > 0.7 ? Math.floor(price * 1.3) : 0
        const stock = Math.floor(Math.random() * 20) + 5
        const status = Math.random() > 0.2 ? 1 : (Math.random() > 0.5 ? 0 : 2)

        equipment.push({
          id: i,
          name: `${brands[Math.floor(Math.random() * brands.length)]} ${name}`,
          category: category,
          categoryName: categoryNames[category],
          spec: spec,
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: price,
          originalPrice: originalPrice,
          deposit: Math.random() > 0.5 ? Math.floor(price * 3) : 0,
          stock: stock,
          maxRental: Math.min(stock, 5),
          status: status,
          image: defaultImage,
          description: `${name}，${spec}，专业运动器材，质量可靠`,
          rating: (4 + Math.random()).toFixed(1),
          reviewCount: Math.floor(Math.random() * 100),
          hot: Math.random() > 0.7,
          new: i <= 5, // 前5个作为新品
          features: ['专业品质', '使用舒适', '耐用性强', '保养方便'].slice(0, Math.floor(Math.random() * 4) + 1)
        })
      }

      return equipment
    }

    const filterByPrice = (equipment, range) => {
      return equipment.filter(item => {
        const price = item.price || 0
        switch (range) {
          case '0-20':
            return price <= 20
          case '20-50':
            return price > 20 && price <= 50
          case '50-100':
            return price > 50 && price <= 100
          case '100+':
            return price > 100
          default:
            return true
        }
      })
    }

    const sortEquipment = (equipment, sortField) => {
      return [...equipment].sort((a, b) => {
        switch (sortField) {
          case 'price_asc':
            return a.price - b.price
          case 'price_desc':
            return b.price - a.price
          case 'popular':
            return (b.rating * b.reviewCount) - (a.rating * a.reviewCount)
          case 'new':
            return b.new - a.new
          default:
            return 0
        }
      })
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadEquipment()
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      selectedCategory.value = ''
      selectedPriceRange.value = ''
      selectedStatus.value = ''
      sortField.value = 'price_asc'
      currentPage.value = 1
      loadEquipment()
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadEquipment()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadEquipment()
    }

    const getStatusClass = (status) => {
      const classes = {
        0: 'rented',     // 已租出
        1: 'available',  // 可租赁
        2: 'maintenance' // 维修中
      }
      return classes[status] || 'available'
    }

    const getStatusText = (status) => {
      const texts = {
        0: '已租出',
        1: '可租赁',
        2: '维修中'
      }
      return texts[status] || '未知状态'
    }

    const getFeatures = (equipment) => {
      return equipment.features || ['专业品质', '使用舒适']
    }

    const selectRentalDays = (equipment, days) => {
      equipment.rentalDays = days
      updateCart()
    }

    const updateCart = () => {
      // 更新租赁车中的器材数量信息
      saveCartToStorage()
    }

    const addToCart = (equipment) => {
      if (equipment.rentalQuantity <= 0) {
        ElMessage.warning('请选择租赁数量')
        return
      }

      const existingItem = cartItems.value.find(item => item.id === equipment.id)
      if (existingItem) {
        // 更新现有项的数量
        existingItem.quantity = equipment.rentalQuantity
        existingItem.days = equipment.rentalDays
        existingItem.totalPrice = existingItem.price * existingItem.quantity * existingItem.days
        ElMessage.success('已更新租赁车中的器材')
      } else {
        // 添加新项
        cartItems.value.push({
          id: equipment.id,
          name: equipment.name,
          spec: equipment.spec,
          image: equipment.image || defaultImage,
          price: equipment.price,
          quantity: equipment.rentalQuantity,
          days: equipment.rentalDays,
          totalPrice: equipment.price * equipment.rentalQuantity * equipment.rentalDays,
          deliveryMethod: 'delivery'
        })
        ElMessage.success('已添加到租赁车')
      }

      saveCartToStorage()
      showCart.value = true
    }

    const removeFromCart = (itemId) => {
      cartItems.value = cartItems.value.filter(item => item.id !== itemId)
      saveCartToStorage()
      ElMessage.success('已从租赁车移除')
    }

    const clearCart = () => {
      ElMessageBox.confirm(
        '确定要清空租赁车吗？',
        '清空租赁车',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        cartItems.value = []
        saveCartToStorage()
        ElMessage.success('租赁车已清空')
      })
    }

    const saveCartToStorage = () => {
      localStorage.setItem('equipmentCart', JSON.stringify(cartItems.value))
    }

    const loadCartFromStorage = () => {
      const savedCart = localStorage.getItem('equipmentCart')
      if (savedCart) {
        cartItems.value = JSON.parse(savedCart)
      }
    }

    const toggleCart = () => {
      showCart.value = !showCart.value
    }

    const closeCart = () => {
      showCart.value = false
    }

    const goToCheckout = () => {
      if (cartItems.value.length === 0) {
        ElMessage.warning('租赁车为空')
        return
      }
      router.push('/equipment/checkout')
    }

    const viewEquipmentDetail = (equipment) => {
      // 跳转到器材详情页
      router.push(`/equipment/detail/${equipment.id}`)
    }

    const rentNow = (equipment) => {
      selectedEquipment.value = equipment
      rentForm.value = {
        quantity: equipment.rentalQuantity || 1,
        days: equipment.rentalDays || 1,
        dateRange: [],
        deliveryMethod: 'delivery',
        address: '',
        contactName: userStore.name || '',
        contactPhone: '',
        notes: ''
      }
      showRentDialog.value = true
    }

    const disabledDate = (time) => {
      // 禁用今天之前的日期
      return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
    }

    const calculateEquipmentCost = () => {
      if (!selectedEquipment.value) return 0
      return selectedEquipment.value.price * rentForm.value.quantity * rentForm.value.days
    }

    const calculateDiscount = () => {
      if (!selectedEquipment.value) return 0
      if (rentForm.value.days >= 7) {
        return calculateEquipmentCost() * 0.1
      }
      return 0
    }

    const calculateTotalCost = () => {
      let total = calculateEquipmentCost()
      if (rentForm.value.deliveryMethod === 'delivery') {
        total += 15
      }
      if (selectedEquipment.value?.deposit) {
        total += selectedEquipment.value.deposit * rentForm.value.quantity
      }
      total -= calculateDiscount()
      return total
    }

    const confirmRent = async () => {
      // 表单验证
      if (rentForm.value.quantity <= 0) {
        ElMessage.warning('请选择租赁数量')
        return
      }
      if (rentForm.value.days <= 0) {
        ElMessage.warning('请选择租赁天数')
        return
      }
      if (!rentForm.value.dateRange || rentForm.value.dateRange.length !== 2) {
        ElMessage.warning('请选择租赁日期')
        return
      }
      if (rentForm.value.deliveryMethod === 'delivery' && !rentForm.value.address) {
        ElMessage.warning('请输入收货地址')
        return
      }
      if (!rentForm.value.contactName) {
        ElMessage.warning('请输入联系人姓名')
        return
      }
      if (!rentForm.value.contactPhone) {
        ElMessage.warning('请输入联系电话')
        return
      }

      rentLoading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 创建订单
        const orderData = {
          equipmentId: selectedEquipment.value.id,
          equipmentName: selectedEquipment.value.name,
          quantity: rentForm.value.quantity,
          days: rentForm.value.days,
          startDate: rentForm.value.dateRange[0],
          endDate: rentForm.value.dateRange[1],
          deliveryMethod: rentForm.value.deliveryMethod,
          address: rentForm.value.address,
          contactName: rentForm.value.contactName,
          contactPhone: rentForm.value.contactPhone,
          notes: rentForm.value.notes,
          totalAmount: calculateTotalCost()
        }

        // 跳转到支付页面
        ElMessage.success('创建订单成功，跳转到支付页面')
        showRentDialog.value = false

        // 这里可以跳转到支付页面
        // router.push({
        //   path: '/equipment/payment',
        //   query: orderData
        // })

      } catch (error) {
        console.error('租赁失败:', error)
        ElMessage.error('租赁失败，请重试')
      } finally {
        rentLoading.value = false
      }
    }

    const viewMyOrders = () => {
      router.push('/order/management')
    }

    const goToLogin = () => {
      router.push('/login')
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      // 用户相关
      isLogin,
      userName,

      // 搜索和筛选
      searchKeyword,
      selectedCategory,
      selectedPriceRange,
      selectedStatus,
      sortField,
      equipmentList,
      filteredEquipment,
      loading,
      currentPage,
      pageSize,
      total,
      defaultImage,
      equipmentCategories,
      priceRanges,

      // 租赁车相关
      cartItems,
      showCart,

      // 租赁对话框相关
      showRentDialog,
      rentLoading,
      selectedEquipment,
      rentForm,

      // 计算属性
      hasFilters,
      cartEquipmentTotal,
      cartDeliveryFee,
      cartDiscount,
      cartTotal,

      // 方法
      handleSearch,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      getStatusClass,
      getStatusText,
      getFeatures,
      selectRentalDays,
      updateCart,
      addToCart,
      removeFromCart,
      clearCart,
      toggleCart,
      closeCart,
      goToCheckout,
      viewEquipmentDetail,
      rentNow,
      disabledDate,
      calculateEquipmentCost,
      calculateDiscount,
      calculateTotalCost,
      confirmRent,
      viewMyOrders,
      goToLogin,
      goToRegister
    }
  }
}
</script>

<style scoped lang="scss">
.equipment-rental-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 登录提示样式 */
.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;

  .login-prompt {
    background: white;
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

    .prompt-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;

      @media (max-width: 480px) {
        flex-direction: column;
      }

      .login-btn {
        padding: 15px 40px;
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;

        i {
          margin-right: 8px;
        }
      }
    }
  }
}

// 已登录用户内容
.equipment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

// 页面标题
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-left {
    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 12px;

      i {
        color: #f59e0b;
      }

      @media (max-width: 768px) {
        font-size: 28px;
      }
    }

    .page-subtitle {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }
  }
}

// 搜索和筛选区域
.search-filter-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 25px;
  }
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.search-input-group {
  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      padding: 8px 15px;
      background: #f8fafc;
      transition: all 0.3s ease;

      &:hover {
        border-color: #cbd5e1;
        background: white;
      }

      &.is-focus {
        border-color: #f59e0b;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        background: white;
      }
    }

    .el-input__prefix {
      display: flex;
      align-items: center;

      .el-icon-search {
        font-size: 18px;
        color: #94a3b8;
      }
    }
  }
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;

      .filter-label {
        width: 100%;
        margin-bottom: 5px;
      }
    }

    .filter-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
      white-space: nowrap;
    }

    :deep(.el-select) {
      flex: 1;
      min-width: 180px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }
  }

  .reset-btn {
    white-space: nowrap;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

// 租赁流程提示
.rental-process {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  .process-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 992px) {
      flex-wrap: wrap;
      gap: 20px;
    }

    @media (max-width: 576px) {
      flex-direction: column;
      gap: 25px;
    }
  }

  .process-step {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    min-width: 0;

    @media (max-width: 576px) {
      width: 100%;
    }

    .step-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 24px;
        color: white;
      }
    }

    .step-info {
      flex: 1;
      min-width: 0;

      .step-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .step-desc {
        font-size: 14px;
        color: #64748b;
      }
    }
  }

  .process-arrow {
    color: #cbd5e1;
    padding: 0 10px;

    i {
      font-size: 20px;
    }

    @media (max-width: 576px) {
      display: none;
    }
  }
}

// 器材列表区域
.equipment-section {
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid #e2e8f0;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    p {
      color: #64748b;
      font-size: 16px;
    }
  }

  .empty-state {
    background: white;
    border-radius: 20px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

    .empty-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 15px 0;
    }

    p {
      color: #64748b;
      font-size: 16px;
      margin: 0 0 30px 0;
    }
  }
}

// 器材列表
.equipment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.equipment-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
}

.equipment-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .equipment-status {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: white;

    &.available {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    &.rented {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    &.maintenance {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    }
  }

  .equipment-category {
    position: absolute;
    bottom: 15px;
    left: 15px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .hot-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .new-badge {
    position: absolute;
    top: 50px;
    right: 15px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }
}

.equipment-info {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;

  .equipment-name {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #f59e0b;
    }
  }

  .equipment-rating {
    display: flex;
    align-items: center;
    gap: 4px;

    .stars {
      color: #f59e0b;
      font-size: 14px;
    }

    .rating-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-left: 4px;
    }

    .review-count {
      font-size: 12px;
      color: #64748b;
    }
  }
}

.equipment-spec {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;

  .spec-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;

    i {
      font-size: 16px;
      color: #f59e0b;
    }
  }
}

.equipment-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.equipment-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .feature-tag {
    background: #f1f5f9;
    color: #475569;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.rental-action {
  padding: 20px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  .current-price {
    display: flex;
    align-items: baseline;

    .price-label {
      font-size: 16px;
      color: #ef4444;
      font-weight: 600;
    }

    .price-value {
      font-size: 24px;
      color: #ef4444;
      font-weight: 700;
      margin: 0 2px;
    }

    .price-unit {
      font-size: 14px;
      color: #94a3b8;
    }
  }

  .original-price {
    font-size: 16px;
    color: #94a3b8;
    text-decoration: line-through;
  }

  .deposit-info {
    margin-left: auto;
    font-size: 14px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.quantity-selector,
.days-selector {
  margin-bottom: 20px;

  .quantity-label,
  .days-label {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .stock-info {
    font-size: 12px;
    color: #64748b;
    margin-top: 6px;
  }
}

:deep(.el-input-number) {
  width: 120px;
}

.days-options {
  display: flex;
  gap: 10px;

  .days-option {
    padding: 8px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #64748b;
    transition: all 0.2s ease;

    &:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    &.active {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-color: transparent;
      color: white;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
  }

  :deep(.el-button) {
    flex: 1;
    justify-content: center;

    i {
      margin-right: 6px;
    }
  }
}

.quick-rental-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;

  .tips-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;

    i {
      color: #10b981;
      font-size: 14px;
    }
  }
}

// 分页
.pagination-section {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

// 租赁车侧边栏
.rental-cart-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &.open {
    right: 0;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .cart-count {
      color: #f59e0b;
      font-weight: 700;
    }
  }
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .item-image {
    flex: 0 0 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .item-info {
    flex: 1;
    min-width: 0;

    .item-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .item-spec {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
    }
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;

    .item-price {
      font-size: 16px;
      font-weight: 700;
      color: #f59e0b;
    }
  }
}

.cart-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    &.total {
      padding-top: 12px;
      border-top: 2px solid #e2e8f0;

      .total-amount {
        font-size: 20px;
        font-weight: 700;
        color: #f59e0b;
      }
    }

    &.discount {
      span:last-child {
        color: #10b981;
        font-weight: 600;
      }
    }
  }
}

.cart-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;

  .clear-btn,
  .checkout-btn {
    flex: 1;
    justify-content: center;

    i {
      margin-right: 6px;
    }
  }
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .empty-icon {
    width: 80px;
    height: 80px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    i {
      font-size: 40px;
      color: #94a3b8;
    }
  }

  p {
    color: #64748b;
    font-size: 16px;
    margin: 0 0 8px 0;

    &.empty-hint {
      font-size: 14px;
    }
  }
}

// 租赁车悬浮按钮
.cart-float-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
  transition: all 0.3s ease;
  z-index: 999;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.6);
  }

  i {
    font-size: 24px;
    color: white;
  }

  .cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 24px;
    height: 24px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// 立即租赁对话框
.rent-dialog {
  .equipment-info-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;

    .equipment-image {
      flex: 0 0 100px;
      height: 100px;
      border-radius: 12px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .equipment-details {
      flex: 1;

      h3 {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px 0;
      }

      .equipment-spec {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 12px;
      }

      .equipment-price {
        font-size: 24px;
        font-weight: 700;
        color: #f59e0b;
      }
    }
  }

  .form-hint {
    margin-left: 10px;
    font-size: 14px;
    color: #64748b;
  }

  .contact-input {
    width: 200px;
  }

  .rent-summary {
    margin-top: 20px;
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;

    .summary-header {
      background: #e2e8f0;
      padding: 15px 20px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .summary-content {
      padding: 20px;

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        &.total {
          padding-top: 15px;
          border-top: 2px solid #e2e8f0;

          .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #f59e0b;
          }
        }

        &.discount {
          span:last-child {
            color: #10b981;
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .equipment-rental-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .login-prompt,
  .search-filter-section,
  .rental-process,
  .equipment-item,
  .empty-state,
  .pagination-section,
  .rental-cart-sidebar {
    background: #1e293b;
    border: 1px solid #334155;
  }

  .cart-header {
    background: #0f172a;
    border-color: #334155;
  }

  .cart-content,
  .cart-summary,
  .cart-item,
  .rent-summary {
    background: #0f172a;
  }

  .equipment-info,
  .rental-action {
    border-color: #334155;
  }

  .page-title,
  .step-title,
  .equipment-name,
  .equipment-rating .rating-value,
  .summary-item span:last-child:not(.discount),
  .item-name,
  .cart-header h3,
  .summary-header,
  .rent-summary .summary-item span:first-child {
    color: #f1f5f9;
  }

  .page-subtitle,
  .step-desc,
  .filter-label,
  .equipment-spec,
  .equipment-description,
  .stock-info,
  .days-option,
  .tips-item,
  .item-spec,
  .item-details,
  .cart-empty p,
  .form-hint,
  .equipment-details .equipment-spec {
    color: #94a3b8;
  }

  .search-input-group .el-input__wrapper {
    background: #0f172a;
    border-color: #334155;

    &:hover,
    &.is-focus {
      background: #1e293b;
    }
  }

  .feature-tag {
    background: #334155;
    color: #cbd5e1;
  }

  .equipment-status.available {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .price-info .current-price,
  .price-info .price-label,
  .price-info .price-value,
  .item-price,
  .total-amount,
  .equipment-price {
    color: #f59e0b !important;
  }
}
</style>
