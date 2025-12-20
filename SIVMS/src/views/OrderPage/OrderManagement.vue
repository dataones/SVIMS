<template>
  <div class="order-management-page">
    <!-- 导航栏 -->
    <nav-bar />

    <!-- 登录检查 -->
    <div v-if="!isLogin" class="login-required">
      <div class="login-prompt">
        <div class="prompt-icon">
          <i class="el-icon-user"></i>
        </div>
        <h2>请先登录</h2>
        <p>查看订单需要登录账号，请先登录</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToLogin" class="login-btn">
            <i class="el-icon-user"></i>
            立即登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 已登录用户显示内容 -->
    <div v-else class="order-management-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="el-icon-shopping-cart-2"></i>
            {{ orderType === 1 ? '我的器材订单' : '我的场馆订单' }}
          </h1>
          <p class="page-subtitle">
            管理您的所有{{ orderType === 1 ? '器材租赁' : '场馆预订' }}订单
          </p>
        </div>
        <div class="header-right">
          <el-button type="success" size="large" @click="createNewOrder" v-if="orderType === 0">
            <i class="el-icon-plus"></i>
            新建场馆订单
          </el-button>
          <el-button type="success" size="large" @click="createEquipmentOrder" v-else>
            <i class="el-icon-plus"></i>
            新建器材订单
          </el-button>
        </div>
      </div>

      <!-- 订单类型切换 -->
      <div class="order-type-tabs">
        <div class="type-tabs">
          <div class="type-tab" :class="{ active: orderType === 0 }" @click="changeOrderType(0)">
            <i class="el-icon-office-building"></i>
            <span>场馆订单</span>
            <span class="tab-count">{{ typeStats[0] || 0 }}</span>
          </div>
          <div class="type-tab" :class="{ active: orderType === 1 }" @click="changeOrderType(1)">
            <i class="el-icon-box"></i>
            <span>器材订单</span>
            <span class="tab-count">{{ typeStats[1] || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalOrders }}</div>
              <div class="stat-label">
                {{ orderType === 1 ? '器材订单数' : '场馆订单数' }}
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statusCounts[0] || 0 }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statusCounts[1] || 0 }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-finished"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statusCounts[4] || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <div class="search-box">
          <div class="search-input-group">
            <el-input
              v-model="searchKeyword"
              :placeholder="orderType === 1 ? '搜索订单号、器材名称...' : '搜索订单号、场馆名称...'"
              size="large"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
          </div>

          <div class="filter-group">
            <!-- 状态筛选 -->
            <div class="filter-item">
              <span class="filter-label">订单状态：</span>
              <el-select
                v-model="selectedStatus"
                placeholder="全部状态"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value="" />
                <el-option
                  v-for="status in orderStatusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </div>

            <!-- 时间筛选 -->
            <div class="filter-item">
              <span class="filter-label">下单时间：</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="large"
                @change="handleSearch"
                value-format="YYYY-MM-DD"
              />
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
                <el-option label="下单时间（最新）" value="create_time_desc" />
                <el-option label="下单时间（最早）" value="create_time_asc" />
                <el-option label="订单金额（最高）" value="amount_desc" />
                <el-option label="订单金额（最低）" value="amount_asc" />
              </el-select>
            </div>

            <!-- 重置按钮 -->
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

      <!-- 订单列表 -->
      <div class="orders-section">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载订单中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">
            <i :class="orderType === 1 ? 'el-icon-box' : 'el-icon-document'"></i>
          </div>
          <h3>暂无订单记录</h3>
          <p>
            您还没有任何{{ orderType === 1 ? '器材' : '场馆' }}订单，快去{{
              orderType === 1 ? '租赁器材' : '预订场馆'
            }}吧！
          </p>
          <el-button type="primary" @click="goToBooking">
            <i :class="orderType === 1 ? 'el-icon-box' : 'el-icon-shopping-cart-2'"></i>
            {{ orderType === 1 ? '去租赁器材' : '去预订场馆' }}
          </el-button>
        </div>

        <!-- 场馆订单列表 -->
        <div v-else-if="orderType === 0" class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item venue-order">
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <div class="order-number">
                  <span class="label">订单号：</span>
                  <span class="value">{{ order.orderNumber }}</span>
                  <el-tag size="small" :type="getStatusType(order.status)" class="status-tag">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                  <el-tag size="small" type="info" class="type-tag">
                    <i class="el-icon-office-building"></i>
                    场馆订单
                  </el-tag>
                </div>
                <div class="order-time">
                  <span class="label">下单时间：</span>
                  <span class="value">{{ formatDateTime(order.createTime) }}</span>
                </div>
              </div>
              <div class="order-amount">
                <span class="label">订单金额：</span>
                <span class="value">¥{{ order.totalAmount }}</span>
              </div>
            </div>

            <!-- 订单内容 -->
            <div class="order-content">
              <div class="venue-info">
                <div class="venue-image" @click="viewVenueDetail(order.venueId)">
                  <img :src="order.venueImage || defaultImage" :alt="order.venueName" />
                </div>
                <div class="venue-details">
                  <h3 class="venue-name" @click="viewVenueDetail(order.venueId)">
                    {{ order.venueName }}
                  </h3>
                  <div class="venue-meta">
                    <div class="meta-item">
                      <i class="el-icon-location"></i>
                      <span>{{ order.venueAddress }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="el-icon-office-building"></i>
                      <span>{{ order.venueType }}</span>
                    </div>
                  </div>
                  <div class="booking-info">
                    <div class="info-item">
                      <span class="label">预订日期：</span>
                      <span class="value">{{ formatDate(order.bookingDate) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">预订时间：</span>
                      <span class="value">{{ order.timeSlots }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">预订时长：</span>
                      <span class="value">{{ order.totalHours }}小时</span>
                    </div>
                    <div class="info-item">
                      <span class="label">预订人数：</span>
                      <span class="value">{{ order.peopleCount }}人</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 订单操作 -->
              <div class="order-actions">
                <div class="action-buttons">
                  <el-button size="small" @click="viewOrderDetail(order.id)" class="detail-btn">
                    <i class="el-icon-view"></i>
                    查看详情
                  </el-button>

                  <!-- 待审核状态 -->
                  <template v-if="order.status === 0">
                    <el-button
                      type="warning"
                      size="small"
                      @click="handleCancel(order.id)"
                      :loading="cancelingOrderId === order.id"
                    >
                      <i class="el-icon-close"></i>
                      取消订单
                    </el-button>
                  </template>

                  <!-- 已通过状态 -->
                  <template v-else-if="order.status === 1">
                    <el-button
                      type="primary"
                      size="small"
                      @click="handlePayment(order)"
                      v-if="!order.paid"
                      :loading="payingOrderId === order.id"
                    >
                      <i class="el-icon-money"></i>
                      立即支付
                    </el-button>
                    <el-button
                      type="warning"
                      size="small"
                      @click="handleCancel(order.id)"
                      :loading="cancelingOrderId === order.id"
                    >
                      <i class="el-icon-close"></i>
                      取消订单
                    </el-button>
                  </template>

                  <!-- 已完成状态 -->
                  <template v-else-if="order.status === 4">
                    <el-button type="success" size="small" @click="handleReview(order.id)">
                      <i class="el-icon-chat-dot-round"></i>
                      去评价
                    </el-button>
                    <el-button type="info" size="small" @click="handleReOrder(order)">
                      <i class="el-icon-refresh"></i>
                      再次预订
                    </el-button>
                  </template>

                  <!-- 已驳回状态 -->
                  <template v-else-if="order.status === 2">
                    <el-button type="danger" size="small" @click="handleDelete(order.id)">
                      <i class="el-icon-delete"></i>
                      删除订单
                    </el-button>
                  </template>

                  <!-- 已取消状态 -->
                  <template v-else-if="order.status === 3">
                    <el-button type="info" size="small" @click="handleReOrder(order)">
                      <i class="el-icon-refresh"></i>
                      重新预订
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(order.id)">
                      <i class="el-icon-delete"></i>
                      删除订单
                    </el-button>
                  </template>
                </div>

                <!-- 支付状态 -->
                <div v-if="order.status === 1" class="payment-status">
                  <span v-if="order.paid" class="paid">
                    <i class="el-icon-circle-check"></i>
                    已支付
                  </span>
                  <span v-else class="unpaid">
                    <i class="el-icon-warning-outline"></i>
                    待支付
                  </span>
                </div>
              </div>
            </div>

            <!-- 订单底部 -->
            <div class="order-footer">
              <div class="order-notes" v-if="order.notes">
                <span class="label">备注：</span>
                <span class="value">{{ order.notes }}</span>
              </div>
              <div class="order-total">
                <div class="total-details">
                  <div class="detail-item">
                    <span>场地费用：</span>
                    <span>¥{{ order.venuePrice }}</span>
                  </div>
                  <div class="detail-item" v-if="order.equipmentFee > 0">
                    <span>设备费用：</span>
                    <span>¥{{ order.equipmentFee }}</span>
                  </div>
                  <div class="detail-item" v-if="order.discount > 0">
                    <span>优惠减免：</span>
                    <span class="discount">-¥{{ order.discount }}</span>
                  </div>
                  <div class="detail-item">
                    <span>服务费用：</span>
                    <span>¥{{ order.serviceFee }}</span>
                  </div>
                  <div class="detail-item total">
                    <span>实付金额：</span>
                    <span class="amount">¥{{ order.totalAmount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 器材订单列表 -->
        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item equipment-order">
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <div class="order-number">
                  <span class="label">订单号：</span>
                  <span class="value">{{ order.orderNumber }}</span>
                  <el-tag size="small" :type="getStatusType(order.status)" class="status-tag">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                  <el-tag size="small" type="warning" class="type-tag">
                    <i class="el-icon-box"></i>
                    器材订单
                  </el-tag>
                </div>
                <div class="order-time">
                  <span class="label">下单时间：</span>
                  <span class="value">{{ formatDateTime(order.createTime) }}</span>
                </div>
              </div>
              <div class="order-amount">
                <span class="label">订单金额：</span>
                <span class="value">¥{{ order.totalAmount }}</span>
              </div>
            </div>

            <!-- 器材信息 -->
            <div class="equipment-info">
              <div class="equipment-list">
                <div v-for="item in order.equipmentItems" :key="item.id" class="equipment-item">
                  <div class="equipment-image">
                    <img :src="item.image || equipmentDefaultImage" :alt="item.name" />
                  </div>
                  <div class="equipment-details">
                    <div class="equipment-name">{{ item.name }}</div>
                    <div class="equipment-spec">{{ item.spec }}</div>
                    <div class="equipment-meta">
                      <span class="meta-item">
                        <i class="el-icon-price-tag"></i>
                        ¥{{ item.unitPrice }}/天
                      </span>
                      <span class="meta-item">
                        <i class="el-icon-box"></i>
                        数量：{{ item.quantity }}
                      </span>
                      <span class="meta-item">
                        <i class="el-icon-date"></i>
                        租赁：{{ item.rentalDays }}天
                      </span>
                    </div>
                  </div>
                  <div class="equipment-price">
                    <div class="price-item">
                      <span class="label">小计：</span>
                      <span class="value">¥{{ item.totalPrice }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 租赁详情 -->
            <div class="rental-details">
              <div class="details-content">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">租赁日期：</span>
                    <span class="value"
                      >{{ formatDate(order.startDate) }} 至 {{ formatDate(order.endDate) }}</span
                    >
                  </div>
                  <div class="detail-item">
                    <span class="label">总租赁天数：</span>
                    <span class="value">{{ order.totalDays }}天</span>
                  </div>
                </div>
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">收货地址：</span>
                    <span class="value">{{ order.deliveryAddress }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">联系人：</span>
                    <span class="value">{{ order.contactName }} {{ order.contactPhone }}</span>
                  </div>
                </div>
                <div class="detail-row" v-if="order.deliveryMethod">
                  <div class="detail-item">
                    <span class="label">配送方式：</span>
                    <span class="value">{{ order.deliveryMethod }}</span>
                  </div>
                  <div class="detail-item" v-if="order.deliveryFee > 0">
                    <span class="label">配送费用：</span>
                    <span class="value">¥{{ order.deliveryFee }}</span>
                  </div>
                </div>
              </div>

              <!-- 订单操作 -->
              <div class="order-actions">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    @click="viewEquipmentOrderDetail(order.id)"
                    class="detail-btn"
                  >
                    <i class="el-icon-view"></i>
                    查看详情
                  </el-button>

                  <!-- 待审核状态 -->
                  <template v-if="order.status === 0">
                    <el-button
                      type="warning"
                      size="small"
                      @click="handleCancel(order.id)"
                      :loading="cancelingOrderId === order.id"
                    >
                      <i class="el-icon-close"></i>
                      取消订单
                    </el-button>
                  </template>

                  <!-- 已通过状态 -->
                  <template v-else-if="order.status === 1">
                    <el-button
                      type="primary"
                      size="small"
                      @click="handlePayment(order)"
                      v-if="!order.paid"
                      :loading="payingOrderId === order.id"
                    >
                      <i class="el-icon-money"></i>
                      立即支付
                    </el-button>
                    <el-button
                      type="warning"
                      size="small"
                      @click="handleCancel(order.id)"
                      :loading="cancelingOrderId === order.id"
                    >
                      <i class="el-icon-close"></i>
                      取消订单
                    </el-button>
                  </template>

                  <!-- 已完成状态 -->
                  <template v-else-if="order.status === 4">
                    <el-button type="success" size="small" @click="handleEquipmentReview(order.id)">
                      <i class="el-icon-chat-dot-round"></i>
                      去评价
                    </el-button>
                    <el-button type="info" size="small" @click="handleReOrderEquipment(order)">
                      <i class="el-icon-refresh"></i>
                      再次租赁
                    </el-button>
                  </template>

                  <!-- 已驳回状态 -->
                  <template v-else-if="order.status === 2">
                    <el-button type="danger" size="small" @click="handleDelete(order.id)">
                      <i class="el-icon-delete"></i>
                      删除订单
                    </el-button>
                  </template>

                  <!-- 已取消状态 -->
                  <template v-else-if="order.status === 3">
                    <el-button type="info" size="small" @click="handleReOrderEquipment(order)">
                      <i class="el-icon-refresh"></i>
                      重新租赁
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(order.id)">
                      <i class="el-icon-delete"></i>
                      删除订单
                    </el-button>
                  </template>
                </div>

                <!-- 支付状态 -->
                <div v-if="order.status === 1" class="payment-status">
                  <span v-if="order.paid" class="paid">
                    <i class="el-icon-circle-check"></i>
                    已支付
                  </span>
                  <span v-else class="unpaid">
                    <i class="el-icon-warning-outline"></i>
                    待支付
                  </span>
                </div>
              </div>
            </div>

            <!-- 订单底部 -->
            <div class="order-footer">
              <div class="order-notes" v-if="order.notes">
                <span class="label">备注：</span>
                <span class="value">{{ order.notes }}</span>
              </div>
              <div class="order-total">
                <div class="total-details">
                  <div class="detail-item">
                    <span>器材费用：</span>
                    <span>¥{{ order.equipmentAmount }}</span>
                  </div>
                  <div class="detail-item" v-if="order.deliveryFee > 0">
                    <span>配送费用：</span>
                    <span>¥{{ order.deliveryFee }}</span>
                  </div>
                  <div class="detail-item" v-if="order.deposit > 0">
                    <span>押金：</span>
                    <span>¥{{ order.deposit }}</span>
                  </div>
                  <div class="detail-item" v-if="order.discount > 0">
                    <span>优惠减免：</span>
                    <span class="discount">-¥{{ order.discount }}</span>
                  </div>
                  <div class="detail-item total">
                    <span>实付金额：</span>
                    <span class="amount">¥{{ order.totalAmount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="orders.length > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 取消订单对话框 -->
    <el-dialog v-model="showCancelDialog" title="取消订单" width="400px" append-to-body>
      <div class="cancel-dialog">
        <el-form :model="cancelForm" label-width="80px">
          <el-form-item label="取消原因：">
            <el-select v-model="cancelForm.reason" placeholder="请选择取消原因" size="large">
              <el-option label="计划有变" value="计划有变" />
              <el-option label="价格问题" value="价格问题" />
              <el-option label="找到其他选择" value="找到其他选择" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明：" v-if="cancelForm.reason === '其他原因'">
            <el-input
              v-model="cancelForm.remark"
              type="textarea"
              placeholder="请输入详细的取消原因"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCancelDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmCancel" :loading="cancelLoading">
            确 定
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
import { listOrders } from '@/api/order'
export default {
  name: 'OrderManagementPage',

  components: {
    NavBar,
  },

  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 用户相关状态
    const isLogin = computed(() => userStore.isLogin)
    const userName = computed(() => userStore.name)

    // 订单类型：0-场馆订单，1-器材订单
    const orderType = ref(0)

    // 搜索和筛选状态
    const searchKeyword = ref('')
    const selectedStatus = ref('')
    const dateRange = ref([])
    const sortField = ref('create_time_desc')
    const orders = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    // 统计相关
    const totalOrders = ref(0)
    const statusCounts = ref({})
    const typeStats = ref({ 0: 0, 1: 0 })

    // 操作相关
    const cancelingOrderId = ref(null)
    const payingOrderId = ref(null)
    const showCancelDialog = ref(false)
    const cancelLoading = ref(false)
    const cancelForm = ref({
      orderId: null,
      reason: '',
      remark: '',
    })

    // 默认图片
    const defaultImage =
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    const equipmentDefaultImage =
      'https://images.unsplash.com/photo-1599065000019-b8dbf6bc9c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 订单状态选项
    const orderStatusOptions = [
      { value: 0, label: '待审核' },
      { value: 1, label: '已通过' },
      { value: 2, label: '已驳回' },
      { value: 3, label: '已取消' },
      { value: 4, label: '已完成' },
    ]

    // 计算属性
    const hasFilters = computed(() => {
      return searchKeyword.value || selectedStatus.value !== '' || dateRange.value?.length > 0
    })

    // 监听订单类型变化
    watch(orderType, () => {
      currentPage.value = 1
      resetFilters()
      loadOrders()
    })

    // 监听登录状态变化
    watch(isLogin, (newVal) => {
      if (newVal) {
        loadOrders()
        loadOrderStats()
      } else {
        orders.value = []
      }
    })

    // 生命周期
    onMounted(() => {
      if (isLogin.value) {
        loadOrders()
        loadOrderStats()
      }
    })

    // 方法
    const loadOrders = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        // 调用后端API，将前端的0/1映射到后端的1/2
        const response = await listOrders(orderType.value === 0 ? 1 : 2)
        const apiOrders = response.data || []

        // 根据API返回的数据格式处理
        let processedOrders = []

        if (orderType.value === 0) {
          // 场馆订单
          processedOrders = apiOrders.map((item) => {
            const createDate = new Date(item.createTime)

            return {
              id: item.orderNo, // 使用orderNo作为id
              orderType: 0,
              orderNumber: item.orderNo,
              venueId: null, // 后端未提供
              venueName: item.venueName || '未知场馆',
              venueType: '运动场馆', // 后端未提供类型，使用默认值
              venueAddress: '地址未知', // 后端未提供地址
              venueImage: defaultImage,
              venuePrice: item.amount, // 使用amount作为场馆价格
              equipmentFee: 0, // 后端未提供
              serviceFee: 0, // 后端未提供
              discount: 0, // 后端未提供
              totalAmount: item.amount,
              status: item.status, // 直接使用API返回的状态
              createTime: createDate.toLocaleString('zh-CN'),
              bookingDate: item.date ? item.date.split('T')[0] : '', // 格式化日期
              timeSlots:
                item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : '时间段未知',
              totalHours:
                item.startTime && item.endTime
                  ? parseInt(item.endTime.split(':')[0]) - parseInt(item.startTime.split(':')[0])
                  : 0,
              peopleCount: 1, // 默认1人，后端未提供
              notes: '',
              paid: item.status === 4, // 假设状态4已通过表示已支付
            }
          })
        } else {
          // 器材订单
          processedOrders = apiOrders.map((item) => {
            const createDate = new Date(item.createTime)

            return {
              id: item.orderNo,
              orderType: 1,
              orderNumber: item.orderNo,
              // 器材订单不需要venue相关字段
              equipmentItems: [
                {
                  id: item.orderNo,
                  name: item.equipmentName || '未知器材',
                  spec: '标准规格',
                  image: equipmentDefaultImage,
                  unitPrice: item.count ? item.amount / item.count : item.amount,
                  quantity: item.count || 1,
                  rentalDays: 1, // 后端未提供租赁天数，默认1天
                  totalPrice: item.amount,
                },
              ],
              equipmentAmount: item.amount,
              deliveryFee: 0, // 后端未提供
              deposit: 0, // 后端未提供
              discount: 0, // 后端未提供
              totalAmount: item.amount,
              status: item.status,
              createTime: createDate.toLocaleString('zh-CN'),
              startDate: '', // 后端未提供
              endDate: '', // 后端未提供
              totalDays: 1, // 默认1天
              deliveryAddress: '地址未知',
              contactName: '用户',
              contactPhone: '未知',
              deliveryMethod: '自取',
              notes: '',
              paid: item.status === 4,
            }
          })
        }

        // 应用筛选
        let filteredOrders = processedOrders

        // 关键词搜索
        if (searchKeyword.value) {
          const keyword = searchKeyword.value.toLowerCase()
          if (orderType.value === 0) {
            filteredOrders = filteredOrders.filter(
              (order) =>
                order.orderNumber.toLowerCase().includes(keyword) ||
                order.venueName.toLowerCase().includes(keyword),
            )
          } else {
            filteredOrders = filteredOrders.filter(
              (order) =>
                order.orderNumber.toLowerCase().includes(keyword) ||
                order.equipmentItems?.some((item) => item.name.toLowerCase().includes(keyword)),
            )
          }
        }

        // 状态筛选
        if (selectedStatus.value !== '') {
          filteredOrders = filteredOrders.filter(
            (order) => order.status === parseInt(selectedStatus.value),
          )
        }

        // 时间筛选
        if (dateRange.value?.length === 2) {
          const [startDate, endDate] = dateRange.value
          filteredOrders = filteredOrders.filter((order) => {
            const orderDate = order.createTime.split(' ')[0]
            return orderDate >= startDate && orderDate <= endDate
          })
        }

        // 排序
        filteredOrders = sortOrders(filteredOrders, sortField.value)

        // 分页
        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        orders.value = filteredOrders.slice(startIndex, endIndex)
        total.value = filteredOrders.length

        // 更新状态统计
        updateStatusCounts(filteredOrders)
      } catch (error) {
        console.error('加载订单失败:', error)
        ElMessage.error('加载订单列表失败')
        orders.value = []
      } finally {
        loading.value = false
      }
    }
    const loadOrderStats = async () => {
      try {
        // 获取两种类型的订单统计
        const [venueResponse, equipmentResponse] = await Promise.all([
          listOrders(1), // 场馆订单
          listOrders(2), // 器材订单
        ])

        const venueOrders = venueResponse.data || []
        const equipmentOrders = equipmentResponse.data || []

        // 更新类型统计
        typeStats.value = {
          0: venueOrders.length,
          1: equipmentOrders.length,
        }

        // 更新当前类型的统计
        const currentOrders = orderType.value === 0 ? venueOrders : equipmentOrders
        const counts = {}
        currentOrders.forEach((order) => {
          counts[order.status] = (counts[order.status] || 0) + 1
        })
        statusCounts.value = counts
        totalOrders.value = currentOrders.length
      } catch (error) {
        console.error('加载订单统计失败:', error)

        // 失败时使用模拟数据
        const mockVenueOrders = generateMockVenueOrders(25)
        const mockEquipmentOrders = generateMockEquipmentOrders(15)

        typeStats.value = {
          0: mockVenueOrders.length,
          1: mockEquipmentOrders.length,
        }

        const currentOrders = orderType.value === 0 ? mockVenueOrders : mockEquipmentOrders
        updateStatusCounts(currentOrders)
        totalOrders.value = currentOrders.length
      }
    }

    const sortOrders = (orders, sortField) => {
      return [...orders].sort((a, b) => {
        switch (sortField) {
          case 'create_time_desc':
            return new Date(b.createTime) - new Date(a.createTime)
          case 'create_time_asc':
            return new Date(a.createTime) - new Date(b.createTime)
          case 'amount_desc':
            return b.totalAmount - a.totalAmount
          case 'amount_asc':
            return a.totalAmount - b.totalAmount
          default:
            return 0
        }
      })
    }

    const updateStatusCounts = (orders) => {
      const counts = {}
      orders.forEach((order) => {
        counts[order.status] = (counts[order.status] || 0) + 1
      })
      statusCounts.value = counts
      totalOrders.value = orders.length
    }

    const changeOrderType = (type) => {
      orderType.value = type
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadOrders()
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      selectedStatus.value = ''
      dateRange.value = []
      sortField.value = 'create_time_desc'
      currentPage.value = 1
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadOrders()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadOrders()
    }

    const getStatusType = (status) => {
      const types = {
        0: 'warning', // 待审核
        1: 'primary', // 已通过
        2: 'danger', // 已驳回
        3: 'info', // 已取消
        4: 'success', // 已完成
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        0: '待审核',
        1: '已通过',
        2: '已驳回',
        3: '已取消',
        4: '已完成',
      }
      return texts[status] || '未知状态'
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

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[date.getDay()]
      return `${month}月${day}日 星期${weekDay}`
    }

    const viewOrderDetail = (orderId) => {
      router.push(`/order/detail/${orderId}`)
    }

    const viewEquipmentOrderDetail = (orderId) => {
      router.push(`/equipment/order/detail/${orderId}`)
    }

    const viewVenueDetail = (venueId) => {
      router.push(`/venue/detail/${venueId}`)
    }

    const handleCancel = (orderId) => {
      cancelForm.value = {
        orderId: orderId,
        reason: '',
        remark: '',
      }
      showCancelDialog.value = true
    }

    const confirmCancel = async () => {
      if (!cancelForm.value.reason) {
        ElMessage.warning('请选择取消原因')
        return
      }

      cancelLoading.value = true
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 更新订单状态
        const orderIndex = orders.value.findIndex((o) => o.id === cancelForm.value.orderId)
        if (orderIndex > -1) {
          orders.value[orderIndex].status = 3
          orders.value[orderIndex].statusText = '已取消'
        }

        ElMessage.success('订单已取消')
        showCancelDialog.value = false

        // 重新加载数据
        loadOrders()
        loadOrderStats()
      } catch (error) {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请重试')
      } finally {
        cancelLoading.value = false
      }
    }

    const handlePayment = (order) => {
      // 解析时间段
      let startTime = ''
      let endTime = ''
      let totalHours = 0

      if (order.timeSlots && order.timeSlots.includes('-')) {
        const [start, end] = order.timeSlots.split('-')
        startTime = start.trim()
        endTime = end.trim()

        if (startTime && endTime) {
          const startHour = parseInt(startTime.split(':')[0])
          const endHour = parseInt(endTime.split(':')[0])
          totalHours = endHour - startHour
        }
      }

      // 将订单信息存储到 sessionStorage
      const paymentData = {
        orderId: order.id,
        orderNo: order.orderNumber,
        orderType: order.orderType,
        amount: order.totalAmount,
        venueName: order.venueName || order.equipmentItems?.[0]?.name || '',
        date: order.bookingDate,
        startTime: startTime,
        endTime: endTime,
        totalHours: totalHours,
        peopleCount: order.peopleCount || 1,
      }

      // 使用 sessionStorage（会话结束后自动清除）
      sessionStorage.setItem('paymentOrderData', JSON.stringify(paymentData))

      // 只传递订单ID作为查询参数
      router.push({
        path: '/OrderPay',
        query: {
          orderId: order.id, // 只传递订单ID
        },
      })
    }
    // const handleReview = (orderId) => {
    //   ElMessage.info('跳转到场馆评价页面')
    //   // router.push(`/review/create/${orderId}`)
    // }

    // const handleEquipmentReview = (orderId) => {
    //   ElMessage.info('跳转到器材评价页面')
    //   // router.push(`/equipment/review/create/${orderId}`)
    // }

    const handleReOrder = (order) => {
      ElMessage.info('重新预订该场馆')
      router.push({
        path: '/order/create',
        query: { venueId: order.venueId },
      })
    }

    const handleReOrderEquipment = (order) => {
      ElMessage.info('重新租赁器材')
      router.push({
        path: '/equipment/booking',
        query: { items: order.equipmentItems.map((item) => item.id).join(',') },
      })
    }

    const handleDelete = (orderId) => {
      ElMessageBox.confirm('确定要删除这个订单吗？删除后将无法恢复。', '删除订单', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 800))

          // 从列表中移除
          orders.value = orders.value.filter((o) => o.id !== orderId)

          ElMessage.success('订单已删除')

          // 重新加载统计
          loadOrderStats()
        } catch (error) {
          console.error('删除订单失败:', error)
          ElMessage.error('删除订单失败，请重试')
        }
      })
    }

    const createNewOrder = () => {
      router.push('/booking')
    }

    const createEquipmentOrder = () => {
      router.push('/equipment/booking')
    }

    const goToBooking = () => {
      if (orderType.value === 0) {
        router.push('/booking')
      } else {
        router.push('/equipment/booking')
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      // 用户相关
      isLogin,
      userName,

      // 订单类型
      orderType,

      // 搜索和筛选
      searchKeyword,
      selectedStatus,
      dateRange,
      sortField,
      orders,
      loading,
      currentPage,
      pageSize,
      total,

      // 统计相关
      totalOrders,
      statusCounts,
      typeStats,

      // 操作相关
      cancelingOrderId,
      payingOrderId,
      showCancelDialog,
      cancelLoading,
      cancelForm,

      // 常量
      defaultImage,
      equipmentDefaultImage,
      orderStatusOptions,

      // 计算属性
      hasFilters,

      // 方法
      changeOrderType,
      handleSearch,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      getStatusText,
      formatDateTime,
      formatDate,
      viewOrderDetail,
      viewEquipmentOrderDetail,
      viewVenueDetail,
      handleCancel,
      confirmCancel,
      handlePayment,
      // handleReview,
      // handleEquipmentReview,
      handleReOrder,
      handleReOrderEquipment,
      handleDelete,
      createNewOrder,
      createEquipmentOrder,
      goToBooking,
      goToLogin,
    }
  },
}
</script>

<style scoped lang="scss">
.order-management-page {
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
.order-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

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
        color: #667eea;
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

// 订单类型切换
.order-type-tabs {
  margin-bottom: 30px;
  background: white;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);

  .type-tabs {
    display: flex;
    gap: 10px;
    padding: 5px;
    background: #f8fafc;
    border-radius: 12px;

    .type-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      font-weight: 500;
      color: #64748b;

      i {
        font-size: 20px;
      }

      .tab-count {
        background: #e2e8f0;
        color: #64748b;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        min-width: 24px;
        text-align: center;
      }

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;

        .tab-count {
          background: #667eea;
          color: white;
        }
      }

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        i {
          color: white;
        }

        .tab-count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }
  }
}

// 统计卡片
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }

  &.total {
    border-left: 5px solid #667eea;
  }

  &.pending {
    border-left: 5px solid #f59e0b;
  }

  &.approved {
    border-left: 5px solid #10b981;
  }

  &.completed {
    border-left: 5px solid #8b5cf6;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 28px;
      }
    }

    .total .stat-icon {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .pending .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .approved .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .completed .stat-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .stat-info {
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;
        line-height: 1;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #64748b;
      }
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
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
  gap: 20px;
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

    :deep(.el-select),
    :deep(.el-date-editor) {
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

// 订单列表区域
.orders-section {
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

  .empty-state {
    background: white;
    border-radius: 20px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

    .empty-icon {
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

// 订单项通用样式
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &.venue-order {
    border-left: 5px solid #667eea;
  }

  &.equipment-order {
    border-left: 5px solid #f59e0b;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .order-info {
    .order-number {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;

      .label {
        color: #64748b;
        font-size: 14px;
      }

      .value {
        color: #1e293b;
        font-size: 16px;
        font-weight: 600;
      }

      .status-tag {
        font-size: 12px;
        font-weight: 600;
      }

      .type-tag {
        font-size: 12px;
        font-weight: 600;
      }
    }

    .order-time {
      .label {
        color: #64748b;
        font-size: 14px;
      }

      .value {
        color: #1e293b;
        font-size: 14px;
      }
    }
  }

  .order-amount {
    .label {
      color: #64748b;
      font-size: 14px;
      margin-right: 8px;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }
  }
}

// 场馆订单内容
.order-content {
  display: flex;
  padding: 25px;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 20px;
  }

  .venue-info {
    flex: 1;
    display: flex;
    gap: 20px;

    @media (max-width: 576px) {
      flex-direction: column;
    }

    .venue-image {
      flex: 0 0 150px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      @media (max-width: 576px) {
        flex: none;
        width: 100%;
        height: 180px;
      }
    }

    .venue-details {
      flex: 1;

      .venue-name {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 15px 0;
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: #667eea;
        }
      }

      .venue-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;

        @media (max-width: 576px) {
          flex-direction: column;
          gap: 8px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 14px;

          i {
            font-size: 16px;
          }
        }
      }

      .booking-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        @media (max-width: 576px) {
          grid-template-columns: 1fr;
        }

        .info-item {
          .label {
            color: #64748b;
            font-size: 14px;
            margin-right: 6px;
          }

          .value {
            color: #1e293b;
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .order-actions {
    flex: 0 0 250px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;

    @media (max-width: 992px) {
      flex: none;
      flex-direction: row;
      align-items: center;
      width: 100%;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;

      @media (max-width: 992px) {
        flex-direction: row;
        flex-wrap: wrap;
      }

      @media (max-width: 576px) {
        flex-direction: column;
      }

      :deep(.el-button) {
        width: 100%;
        justify-content: center;

        @media (max-width: 992px) {
          flex: 1;
          min-width: 120px;
        }

        @media (max-width: 576px) {
          width: 100%;
        }

        i {
          margin-right: 6px;
        }
      }
    }

    .payment-status {
      text-align: center;
      width: 100%;
      padding: 8px 0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;

      .paid {
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .unpaid {
        color: #f59e0b;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
    }
  }
}

// 器材信息
.equipment-info {
  padding: 25px 25px 0 25px;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.equipment-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .equipment-image {
    flex: 0 0 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (max-width: 768px) {
      width: 100%;
      height: 150px;
    }
  }

  .equipment-details {
    flex: 1;

    .equipment-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 5px;
    }

    .equipment-spec {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 10px;
    }

    .equipment-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #64748b;
        font-size: 13px;

        i {
          font-size: 14px;
          color: #667eea;
        }
      }
    }
  }

  .equipment-price {
    flex: 0 0 120px;
    text-align: right;

    @media (max-width: 768px) {
      width: 100%;
      text-align: left;
    }

    .price-item {
      .label {
        color: #64748b;
        font-size: 14px;
        margin-right: 5px;
      }

      .value {
        font-size: 18px;
        font-weight: 700;
        color: #667eea;
      }
    }
  }
}

// 租赁详情
.rental-details {
  padding: 25px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  .details-content {
    margin-bottom: 20px;

    .detail-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 15px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .detail-item {
        .label {
          color: #64748b;
          font-size: 14px;
          margin-right: 8px;
        }

        .value {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .order-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 576px) {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .action-buttons {
      display: flex;
      gap: 10px;

      @media (max-width: 576px) {
        flex-direction: column;
      }

      :deep(.el-button) {
        i {
          margin-right: 6px;
        }
      }
    }

    .payment-status {
      .paid {
        color: #10b981;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }

      .unpaid {
        color: #f59e0b;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
    }
  }
}

// 订单底部
.order-footer {
  padding: 20px 25px;
  background: #f8fafc;

  .order-notes {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #667eea;

    .label {
      color: #667eea;
      font-weight: 600;
      margin-right: 8px;
    }

    .value {
      color: #1e293b;
      font-size: 14px;
    }
  }

  .order-total {
    .total-details {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px dashed #e2e8f0;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        &.total {
          padding-top: 8px;
          border-top: 2px solid #e2e8f0;

          .amount {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
          }
        }

        span:first-child {
          color: #64748b;
          font-size: 14px;
        }

        span:last-child {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }

        .discount {
          color: #10b981;
          font-weight: 600;
        }
      }
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

// 取消订单对话框
.cancel-dialog {
  padding: 10px;
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
  .order-management-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .login-prompt,
  .order-type-tabs,
  .search-filter-section,
  .order-item,
  .empty-state,
  .pagination-section,
  .stat-card {
    background: #1e293b;
    border: 1px solid #334155;
  }

  .order-type-tabs .type-tabs {
    background: #0f172a;
  }

  .order-header,
  .order-footer,
  .equipment-item,
  .rental-details {
    background: #0f172a;
    border-color: #334155;
  }

  .order-notes,
  .equipment-item {
    background: #1e293b !important;
    border-color: #334155 !important;
  }

  .page-title,
  .stat-value,
  .venue-name,
  .order-time .value,
  .order-amount .value,
  .info-item .value,
  .detail-item .value,
  .equipment-name,
  .detail-item span:last-child:not(.discount) {
    color: #f1f5f9;
  }

  .page-subtitle,
  .stat-label,
  .search-input-group .el-input__wrapper,
  .filter-label,
  .order-number .label,
  .order-time .label,
  .order-amount .label,
  .venue-meta .meta-item,
  .info-item .label,
  .order-notes .value,
  .detail-item span:first-child,
  .payment-status .paid,
  .payment-status .unpaid,
  .equipment-spec,
  .equipment-meta .meta-item,
  .detail-item .label,
  .type-tab {
    color: #94a3b8;
  }

  .order-number .value {
    color: #cbd5e1;
  }

  .search-input-group .el-input__wrapper {
    background: #0f172a;
    border-color: #334155;

    &:hover,
    &.is-focus {
      background: #1e293b;
    }
  }

  .type-tab.active {
    color: white !important;
  }

  .discount {
    color: #10b981 !important;
  }
}
</style>
