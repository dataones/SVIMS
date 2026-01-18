<template>
  <div class="equipment-rental-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 登录检查 -->
    <div v-if="!isLogin" class="login-required">
      <div class="login-prompt">
        <div class="prompt-icon">
          <el-icon><Box /></el-icon>
        </div>
        <h2>请先登录</h2>
        <p>租赁器材需要登录账号，请先登录</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="login-btn">
            <el-icon><User /></el-icon>
            立即登录
          </el-button>
          <el-button type="success" size="large" @click="goToRegister" plain>
            <el-icon><UserFilled /></el-icon>
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
            <el-icon><Box /></el-icon>
            器材租赁
          </h1>
          <p class="page-subtitle">选择您需要的运动器材，轻松租赁</p>
        </div>
        <div class="header-right">
          <el-button type="info" size="large" @click="viewMyRentals">
            <el-icon><ShoppingCart /></el-icon>
            我的借用记录
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
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="filter-group">
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

            <!-- 状态筛选（按库存状态） -->
            <div class="filter-item">
              <span class="filter-label">库存状态：</span>
              <el-select
                v-model="selectedStockStatus"
                placeholder="库存状态"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="有库存" :value="1" />
                <el-option label="无库存" :value="0" />
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
                <el-option label="库存从多到少" value="stock_desc" />
                <el-option label="最新添加" value="new" />
              </el-select>
            </div>

            <el-button
              type="info"
              size="large"
              @click="resetFilters"
              :disabled="!hasFilters"
              class="reset-btn"
            >
              <el-icon><Refresh /></el-icon>
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
              <el-icon><Search /></el-icon>
            </div>
            <div class="step-info">
              <div class="step-title">选择器材</div>
              <div class="step-desc">浏览并选择需要的器材</div>
            </div>
          </div>
          <div class="process-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="process-step">
            <div class="step-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="step-info">
              <div class="step-title">提交申请</div>
              <div class="step-desc">填写数量提交借用申请</div>
            </div>
          </div>
          <div class="process-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="process-step">
            <div class="step-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="step-info">
              <div class="step-title">等待审核</div>
              <div class="step-desc">管理员审核通过后使用</div>
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
            <el-icon><Box /></el-icon>
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
              <div class="equipment-status" :class="getStatusClass(equipment)">
                {{ getStatusText(equipment) }}
              </div>
              <div class="available-stock">可用：{{ getAvailableStock(equipment) }}件</div>
            </div>

            <!-- 器材信息 -->
            <div class="equipment-info">
              <div class="equipment-header">
                <h3 class="equipment-name" @click="viewEquipmentDetail(equipment)">
                  {{ equipment.name }}
                </h3>
                <div class="equipment-price-tag">
                  <span class="price-value">¥{{ equipment.price }}</span>
                  <span class="price-unit">/个</span>
                </div>
              </div>

              <div class="equipment-spec">
                <div class="spec-item" v-if="equipment.specification">
                  <el-icon><Grid /></el-icon>
                  <span>规格：{{ equipment.specification }}</span>
                </div>
                <div class="spec-item" v-if="equipment.brand">
                  <el-icon><Medal /></el-icon>
                  <span>品牌：{{ equipment.brand }}</span>
                </div>
                <div class="spec-item">
                  <el-icon><Box /></el-icon>
                  <span>总库存：{{ equipment.totalStock }}件</span>
                </div>
                <div class="spec-item">
                  <el-icon><ShoppingCart /></el-icon>
                  <span>已租出：{{ equipment.rentedStock }}件</span>
                </div>
              </div>

              <p class="equipment-update-time">
                <el-icon><Clock /></el-icon>
                更新时间：{{ formatDateTime(equipment.updateTime) }}
              </p>
            </div>

            <!-- 租赁区域 -->
            <div class="rental-action">
              <!-- 租赁数量选择 -->
              <div class="quantity-selector" v-if="getAvailableStock(equipment) > 0">
                <div class="quantity-label">借用数量：</div>
                <el-input-number
                  v-model="equipment.rentalQuantity"
                  :min="1"
                  :max="getAvailableStock(equipment)"
                  size="large"
                />
                <div class="stock-info">最多可借{{ getAvailableStock(equipment) }}件</div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  @click="rentNow(equipment)"
                  :disabled="getAvailableStock(equipment) === 0"
                  class="rent-btn"
                  :loading="rentingEquipmentId === equipment.id"
                >
                  <el-icon><Box /></el-icon>
                  {{ getAvailableStock(equipment) > 0 ? '立即借用' : '暂无库存' }}
                </el-button>
              </div>

              <!-- 快速租赁提示 -->
              <div class="quick-rental-tips" v-if="getAvailableStock(equipment) > 0">
                <div class="tips-item">
                  <el-icon><CircleCheck /></el-icon>
                  <span>支持自取使用</span>
                </div>
                <div class="tips-item">
                  <el-icon><CircleCheck /></el-icon>
                  <span>申请后等待管理员审核</span>
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

      <!-- 借用确认对话框 -->
      <el-dialog
        v-model="showRentDialog"
        :title="`借用确认 - ${selectedEquipment?.name || ''}`"
        width="500px"
        append-to-body
      >
        <div v-if="selectedEquipment" class="rent-dialog">
          <div class="equipment-info-summary">
            <div class="equipment-image">
              <img :src="selectedEquipment.image || defaultImage" :alt="selectedEquipment.name" />
            </div>
            <div class="equipment-details">
              <h3>{{ selectedEquipment.name }}</h3>
              <div class="equipment-spec" v-if="selectedEquipment.specification">
                {{ selectedEquipment.specification }}
              </div>
              <div class="equipment-brand" v-if="selectedEquipment.brand">
                {{ selectedEquipment.brand }}
              </div>
              <div class="equipment-price">¥{{ selectedEquipment.price }}/个</div>
            </div>
          </div>

          <div class="rent-info">
            <div class="info-item">
              <span class="label">借用数量：</span>
              <span class="value">{{ rentForm.quantity }}件</span>
            </div>
            <div class="info-item">
              <span class="label">可用库存：</span>
              <span class="value">{{ getAvailableStock(selectedEquipment) }}件</span>
            </div>
            <div class="info-item">
              <span class="label">预计费用：</span>
              <span class="value">¥{{ calculateTotalCost() }}</span>
            </div>
          </div>

          <div class="rent-notice">
            <div class="notice-header">
              <el-icon><Warning /></el-icon>
              <span>借用须知</span>
            </div>
            <div class="notice-content">
              <p>1. 借用申请需要管理员审核通过后才能使用</p>
              <p>2. 请妥善保管借用器材，如有损坏需照价赔偿</p>
              <p>3. 使用完毕后请及时归还，方便其他用户使用</p>
              <p>4. 具体使用规则请遵守场馆管理规定</p>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showRentDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmRent" :loading="rentLoading">
              确认借用
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
  <div>
    <!-- 底部信息 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>
            <el-icon><Star /></el-icon> 体育场馆综合管理系统
          </h3>
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
            >渝ICP备2025076592号-5</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Box,
  User,
  UserFilled,
  Search,
  Refresh,
  Document,
  CircleCheck,
  ArrowRight,
  Grid,
  Medal,
  ShoppingCart,
  Clock,
  Warning,
  Star,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { fetchEquipments, applyRental } from '@/api/equipment'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'

export default {
  name: 'EquipmentRentalPage',

  components: {
    NavBar,
    Box,
    User,
    UserFilled,
    Search,
    Refresh,
    Document,
    CircleCheck,
    ArrowRight,
    Grid,
    Medal,
    ShoppingCart,
    Clock,
    Warning,
    Star,
  },

  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 用户相关状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)

    // 搜索和筛选状态
    const searchKeyword = ref('')
    const selectedPriceRange = ref('')
    const selectedStockStatus = ref('')
    const sortField = ref('price_asc')
    const equipmentList = ref([])
    const filteredEquipment = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)

    // 借用相关
    const showRentDialog = ref(false)
    const rentLoading = ref(false)
    const rentingEquipmentId = ref(null)
    const selectedEquipment = ref(null)
    const rentForm = ref({
      quantity: 1,
    })

    // 默认图片
    const defaultImage =
      'https://images.unsplash.com/photo-1599065000019-b8dbf6bc9c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 价格区间选项
    const priceRanges = [
      { value: '0-10', label: '¥0-10' },
      { value: '10-20', label: '¥10-20' },
      { value: '20-50', label: '¥20-50' },
      { value: '50+', label: '¥50以上' },
    ]

    // 计算属性
    const hasFilters = computed(() => {
      return searchKeyword.value || selectedPriceRange.value || selectedStockStatus.value !== ''
    })

    // 监听登录状态变化
    watch(isLogin, (newVal) => {
      if (newVal) {
        loadEquipment()
      }
    })

    // 生命周期
    onMounted(() => {
      if (isLogin.value) {
        loadEquipment()
      }
    })

    // 方法
    const loadEquipment = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        // 调用后端API获取器材列表
        // 建议传入参数，例如 { pageNum: 1, pageSize: 100 } 以获取足够多的数据
        // 如果不传，默认只返回第一页的10条
        const response = await fetchEquipments({ pageNum: 1, pageSize: 100 })

        if (response.code === 200) {
          // =========== 修改开始 ===========
          // 之前是: const apiData = response.data || []
          // 修改为: 取 response.data.records
          const apiData = response.data.records || []
          // =========== 修改结束 ===========

          // 初始化租赁数量为1，并添加可用库存计算
          const processedData = apiData.map((equipment) => ({
            ...equipment,
            rentalQuantity: 1,
            availableStock: equipment.totalStock - equipment.rentedStock,
          }))

          equipmentList.value = processedData

          // 应用筛选和排序
          applyFiltersAndSorting()
        } else {
          ElMessage.error(response.msg || '加载器材列表失败')
          equipmentList.value = []
        }
      } catch (error) {
        console.error('加载器材失败:', error)
        ElMessage.error('加载器材列表失败')
        equipmentList.value = []
      } finally {
        loading.value = false
      }
    }

    const applyFiltersAndSorting = () => {
      let filtered = [...equipmentList.value]

      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter((item) => item.name.toLowerCase().includes(keyword))
      }

      // 价格筛选
      if (selectedPriceRange.value) {
        filtered = filterByPrice(filtered, selectedPriceRange.value)
      }

      // 库存状态筛选
      if (selectedStockStatus.value !== '') {
        if (selectedStockStatus.value === 1) {
          // 有库存
          filtered = filtered.filter((item) => item.availableStock > 0)
        } else {
          // 无库存
          filtered = filtered.filter((item) => item.availableStock === 0)
        }
      }

      // 排序
      filtered = sortEquipment(filtered, sortField.value)

      // 更新总数
      total.value = filtered.length

      // 分页
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      filteredEquipment.value = filtered.slice(startIndex, endIndex)
    }

    const filterByPrice = (equipment, range) => {
      return equipment.filter((item) => {
        const price = item.price || 0
        switch (range) {
          case '0-10':
            return price <= 10
          case '10-20':
            return price > 10 && price <= 20
          case '20-50':
            return price > 20 && price <= 50
          case '50+':
            return price > 50
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
          case 'stock_desc':
            return b.availableStock - a.availableStock
          case 'new':
            return new Date(b.createTime) - new Date(a.createTime)
          default:
            return 0
        }
      })
    }

    const handleSearch = () => {
      currentPage.value = 1
      applyFiltersAndSorting()
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      selectedPriceRange.value = ''
      selectedStockStatus.value = ''
      sortField.value = 'price_asc'
      currentPage.value = 1
      applyFiltersAndSorting()
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      applyFiltersAndSorting()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      applyFiltersAndSorting()
    }

    const getAvailableStock = (equipment) => {
      return equipment.totalStock - equipment.rentedStock
    }

    const getStatusClass = (equipment) => {
      const availableStock = getAvailableStock(equipment)
      return availableStock > 0 ? 'available' : 'unavailable'
    }

    const getStatusText = (equipment) => {
      const availableStock = getAvailableStock(equipment)
      return availableStock > 0 ? '可借用' : '已借完'
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const viewEquipmentDetail = (equipment) => {
      // 这里可以跳转到器材详情页，暂时先显示一个信息框
      ElMessageBox.alert(
        `<div style="padding: 10px;">
          <h3 style="margin-bottom: 10px;">${equipment.name}</h3>
          <p><strong>价格：</strong>¥${equipment.price}/个</p>
          <p><strong>总库存：</strong>${equipment.totalStock}件</p>
          <p><strong>已租出：</strong>${equipment.rentedStock}件</p>
          <p><strong>可用数量：</strong>${getAvailableStock(equipment)}件</p>
          ${equipment.specification ? `<p><strong>规格：</strong>${equipment.specification}</p>` : ''}
          ${equipment.brand ? `<p><strong>品牌：</strong>${equipment.brand}</p>` : ''}
          <p><strong>更新时间：</strong>${formatDateTime(equipment.updateTime)}</p>
        </div>`,
        '器材详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
        },
      )
    }

    const rentNow = (equipment) => {
      if (getAvailableStock(equipment) === 0) {
        ElMessage.warning('该器材暂无库存')
        return
      }

      selectedEquipment.value = equipment
      rentForm.value = {
        quantity: equipment.rentalQuantity || 1,
      }
      showRentDialog.value = true
    }

    const calculateTotalCost = () => {
      if (!selectedEquipment.value) return 0
      return selectedEquipment.value.price * rentForm.value.quantity
    }

    const confirmRent = async () => {
      if (!selectedEquipment.value) return

      // 验证借用数量
      if (rentForm.value.quantity <= 0) {
        ElMessage.warning('请选择借用数量')
        return
      }

      const availableStock = getAvailableStock(selectedEquipment.value)
      if (rentForm.value.quantity > availableStock) {
        ElMessage.warning(`借用数量不能超过可用库存（${availableStock}件）`)
        return
      }

      rentLoading.value = true
      rentingEquipmentId.value = selectedEquipment.value.id

      try {
        // 调用后端API提交借用申请
        const response = await applyRental(selectedEquipment.value.id, rentForm.value.quantity)

        if (response.code === 200) {
          ElMessage.success('借用申请已提交，请等待管理员审核')
          showRentDialog.value = false

          // 重新加载器材列表，更新库存信息
          loadEquipment()
        } else {
          ElMessage.error(response.msg || '提交借用申请失败')
        }
      } catch (error) {
        console.error('借用失败:', error)
        ElMessage.error('提交失败，请重试')
      } finally {
        rentLoading.value = false
        rentingEquipmentId.value = null
      }
    }

    const viewMyRentals = () => {
      router.push('/equipment/rentals/my')
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
      selectedPriceRange,
      selectedStockStatus,
      sortField,
      equipmentList,
      filteredEquipment,
      loading,
      currentPage,
      pageSize,
      total,
      defaultImage,
      priceRanges,

      // 借用相关
      showRentDialog,
      rentLoading,
      rentingEquipmentId,
      selectedEquipment,
      rentForm,

      // 计算属性
      hasFilters,

      // 方法
      handleSearch,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      getAvailableStock,
      getStatusClass,
      getStatusText,
      formatDateTime,
      viewEquipmentDetail,
      rentNow,
      calculateTotalCost,
      confirmRent,
      viewMyRentals,
      goToLogin,
      goToRegister,
    }
  },
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

// 修复：搜索框首次加载缩小问题
.search-input-group {
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;

  :deep(.el-input) {
    width: 100%;

    .el-input__wrapper {
      width: 100%;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      padding: 8px 15px;
      background: #f8fafc;
      box-sizing: border-box;
      transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease,
        background-color 0.3s ease;

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

// 修复：选择框居中
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
    min-width: 240px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      min-width: unset;

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
      flex-shrink: 0;
    }

    :deep(.el-select) {
      flex: 1;
      min-width: 150px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }
  }

  .reset-btn {
    white-space: nowrap;
    flex-shrink: 0;

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

    &.unavailable {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
  }

  .available-stock {
    position: absolute;
    bottom: 15px;
    right: 15px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
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

  .equipment-price-tag {
    text-align: right;

    .price-value {
      font-size: 24px;
      font-weight: 700;
      color: #f59e0b;
    }

    .price-unit {
      font-size: 14px;
      color: #94a3b8;
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

.equipment-update-time {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    font-size: 14px;
  }
}

.rental-action {
  padding: 20px;
}

.quantity-selector {
  margin-bottom: 20px;

  .quantity-label {
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

.action-buttons {
  margin-bottom: 15px;

  :deep(.el-button) {
    width: 100%;
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

// 借用确认对话框
.rent-dialog {
  .equipment-info-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;

    .equipment-image {
      flex: 0 0 80px;
      height: 80px;
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
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px 0;
      }

      .equipment-spec,
      .equipment-brand {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 4px;
      }

      .equipment-price {
        font-size: 20px;
        font-weight: 700;
        color: #f59e0b;
      }
    }
  }

  .rent-info {
    margin-bottom: 20px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 8px 0;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 14px;
        color: #64748b;
      }

      .value {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;

        &:last-child {
          color: #f59e0b;
        }
      }
    }
  }

  .rent-notice {
    background: #f8fafc;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e2e8f0;

    .notice-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #f59e0b;

      i {
        font-size: 16px;
      }
    }

    .notice-content {
      p {
        font-size: 13px;
        color: #64748b;
        margin: 0 0 8px 0;
        line-height: 1.4;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
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
  .pagination-section {
    background: #1e293b;
    border: 1px solid #334155;
  }

  .equipment-info,
  .rental-action {
    border-color: #334155;
  }

  .page-title,
  .step-title,
  .equipment-name,
  .info-item .value:not(:last-child),
  .notice-header,
  h3 {
    color: #f1f5f9;
  }

  .page-subtitle,
  .step-desc,
  .filter-label,
  .equipment-spec,
  .equipment-update-time,
  .stock-info,
  .tips-item,
  .form-hint,
  .equipment-details .equipment-spec,
  .equipment-details .equipment-brand,
  .info-item .label,
  .notice-content p {
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

  .equipment-price-tag .price-value,
  .equipment-price,
  .info-item .value:last-child {
    color: #f59e0b !important;
  }

  .equipment-status.available {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .equipment-status.unavailable {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .quick-rental-tips,
  .rent-notice {
    background: #0f172a;
    border-color: #334155;
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
