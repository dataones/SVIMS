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
              <div class="stat-value">
                {{ orderType === 1 ? statusCounts[1] || 0 : statusCounts[0] || 0 }}
              </div>
              <div class="stat-label">{{ orderType === 1 ? '申请中' : '待审核' }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ orderType === 1 ? statusCounts[2] || 0 : statusCounts[1] || 0 }}
              </div>
              <div class="stat-label">{{ orderType === 1 ? '使用中' : '已通过' }}</div>
            </div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-finished"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ orderType === 1 ? statusCounts[3] || 0 : statusCounts[4] || 0 }}
              </div>
              <div class="stat-label">{{ orderType === 1 ? '已归还' : '已完成' }}</div>
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
                :placeholder="orderType === 1 ? '全部状态' : '全部状态'"
                size="large"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value="" />
                <el-option
                  v-for="status in orderType === 1 ? equipmentStatusOptions : orderStatusOptions"
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
                <el-option label="更新时间（最新）" value="update_time_desc" />
                <el-option label="更新时间（最早）" value="update_time_asc" />
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
                <span class="value">¥{{ formatMoney(order.totalAmount) }}</span>
              </div>
              <!-- 倒计时显示（仅未支付订单显示） -->
              <div v-if="!order.paid && order.status == 1" class="order-countdown">
                <span class="countdown-text">{{ getCountdownText(order.createTime) }}</span>
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

              <!-- 订单详情 -->
              <div class="order-details">
                <div class="details-content">
                  <div class="detail-row">
                    <div class="detail-item">
                      <span class="label">订单状态：</span>
                      <span class="value status-value" :class="getStatusClass(order.status)">
                        {{ getStatusText(order.status) }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">预订时长：</span>
                      <span class="value">{{ order.totalHours }}小时</span>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-item">
                      <span class="label">场馆地址：</span>
                      <span class="value">{{ order.venueAddress }}</span>
                    </div>
                  </div>
                </div>

                <!-- 订单操作 -->
                <div class="order-actions">
                  <div class="action-buttons">
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
                      <el-button type="warning" size="small" @click="handleRefundRequest(order)">
                        <i class="el-icon-money"></i>
                        申请退款
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
                      <el-button type="info" size="small" @click="handleReOrder(order)">
                        <i class="el-icon-refresh"></i>
                        重新预订
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
                    <span>¥{{ formatMoney(order.venuePrice) }}</span>
                  </div>
                  <div class="detail-item" v-if="order.equipmentFee > 0">
                    <span>设备费用：</span>
                    <span>¥{{ formatMoney(order.equipmentFee) }}</span>
                  </div>
                  <div class="detail-item" v-if="order.discount > 0">
                    <span>优惠减免：</span>
                    <span class="discount">-¥{{ order.discount }}</span>
                  </div>

                  <div class="detail-item total">
                    <span>实付金额：</span>
                    <span class="amount">¥{{ order.payAmount ?? order.totalAmount }}</span>
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
                  <el-tag
                    size="small"
                    :type="getEquipmentStatusType(order.status)"
                    class="status-tag"
                  >
                    {{ getEquipmentStatusText(order.status) }}
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
                <span class="value">¥{{ formatMoney(order.totalAmount) }}</span>
              </div>
              <!-- 倒计时显示（仅未支付订单显示） -->
              <div
                v-if="!order.paid && order.status !== 3 && order.status !== 2"
                class="order-countdown"
              >
                <span class="countdown-text">{{ getCountdownText(order.createTime) }}</span>
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
                        单价：¥{{ formatMoney(item.unitPrice) }}
                      </span>
                      <span class="meta-item">
                        <i class="el-icon-box"></i>
                        数量：{{ item.quantity }}
                      </span>
                    </div>
                  </div>
                  <div class="equipment-price">
                    <div class="price-item">
                      <span class="label">小计：</span>
                      <span class="value">¥{{ formatMoney(item.totalPrice) }}</span>
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
                    <span class="label">订单状态：</span>
                    <span class="value status-value" :class="getEquipmentStatusClass(order.status)">
                      {{ getEquipmentStatusText(order.status) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">租赁天数：</span>
                    <span class="value">{{ order.rentalDays || 1 }}天</span>
                  </div>
                </div>
                <div class="detail-row" v-if="order.deliveryAddress">
                  <div class="detail-item">
                    <span class="label">收货地址：</span>
                    <span class="value">{{ order.deliveryAddress }}</span>
                  </div>
                </div>
              </div>

              <!-- 订单操作 -->
              <div class="order-actions">
                <div class="action-buttons">
                  <!-- 申请中状态 -->
                  <template v-if="order.status === 1">
                    <el-button
                      type="warning"
                      size="small"
                      @click="handleCancel(order.id)"
                      :loading="cancelingOrderId === order.id"
                    >
                      <i class="el-icon-close"></i>
                      取消申请
                    </el-button>
                  </template>

                  <!-- 使用中状态 -->
                  <template v-else-if="order.status === 2">
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleEquipmentReturn(order.id)"
                      :loading="returningOrderId === order.id"
                    >
                      <i class="el-icon-refresh"></i>
                      申请归还
                    </el-button>
                    <el-button type="info" size="small" @click="handleExtendRental(order.id)">
                      <i class="el-icon-time"></i>
                      续租
                    </el-button>
                  </template>

                  <!-- 已归还状态 -->
                  <template v-else-if="order.status === 3">
                    <el-button type="success" size="small" @click="handleEquipmentReview(order.id)">
                      <i class="el-icon-chat-dot-round"></i>
                      去评价
                    </el-button>
                    <el-button type="warning" size="small" @click="handleRefundRequest(order)">
                      <i class="el-icon-money"></i>
                      申请退款
                    </el-button>
                    <el-button type="info" size="small" @click="handleReOrderEquipment(order)">
                      <i class="el-icon-refresh"></i>
                      再次租赁
                    </el-button>
                  </template>

                  <!-- 已驳回状态 -->
                  <template v-else-if="order.status === 4">
                    <el-button type="danger" size="small" @click="handleDelete(order.id)">
                      <i class="el-icon-delete"></i>
                      删除订单
                    </el-button>
                    <el-button type="info" size="small" @click="handleReOrderEquipment(order)">
                      <i class="el-icon-refresh"></i>
                      重新申请
                    </el-button>
                  </template>
                </div>

                <!-- 支付状态 -->
                <div class="payment-status" v-if="order.status === 1 || order.status === 2">
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
                    <span>¥{{ formatMoney(order.equipmentAmount) }}</span>
                  </div>
                  <div class="detail-item" v-if="order.deliveryFee > 0">
                    <span>配送费用：</span>
                    <span>¥{{ formatMoney(order.deliveryFee) }}</span>
                  </div>
                  <div class="detail-item" v-if="order.deposit > 0">
                    <span>押金：</span>
                    <span>¥{{ formatMoney(order.deposit) }}</span>
                  </div>
                  <div class="detail-item" v-if="order.discount > 0">
                    <span>优惠减免：</span>
                    <span class="discount">-¥{{ order.discount }}</span>
                  </div>
                  <div class="detail-item total">
                    <span>实付金额：</span>
                    <span class="amount">¥{{ order.payAmount ?? order.totalAmount }}</span>
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

    <!-- 退款申请对话框 -->
    <el-dialog v-model="showRefundDialog" title="申请退款" width="500px" append-to-body>
      <div class="refund-dialog">
        <div class="order-info" v-if="refundForm.order">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ refundForm.order.orderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单金额：</span>
            <span class="value amount">¥{{ formatMoney(refundForm.order.totalAmount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">可退金额：</span>
            <span class="value refundable"
              >¥{{ formatMoney(refundForm.order.payAmount ?? refundForm.order.totalAmount) }}</span
            >
          </div>
        </div>

        <el-form :model="refundForm" label-width="100px" :rules="refundRules" ref="refundFormRef">
          <el-form-item label="退款原因：" prop="reason">
            <el-select
              v-model="refundForm.reason"
              placeholder="请选择退款原因"
              size="large"
              style="width: 100%"
            >
              <el-option label="服务不满意" value="服务不满意" />
              <el-option label="计划有变" value="计划有变" />
              <el-option label="重复下单" value="重复下单" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="退款金额：" prop="amount">
            <el-input-number
              v-model="refundForm.amount"
              :min="0.01"
              :max="(refundForm.order?.payAmount ?? refundForm.order?.totalAmount) || 0"
              :precision="2"
              :step="0.01"
              style="width: 100%"
              size="large"
            />
          </el-form-item>
          <el-form-item label="详细说明：" prop="remark" v-if="refundForm.reason === '其他原因'">
            <el-input
              v-model="refundForm.remark"
              type="textarea"
              placeholder="请输入详细的退款原因"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRefundDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmRefundRequest" :loading="refundLoading">
            提交申请
          </el-button>
        </span>
      </template>
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
            >渝ICP备2025076592号-4</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import { listOrders } from '@/api/order'
import { returnEquipment } from '@/api/equipment' // 新增这一行
import { cancelBooking } from '@/api/booking' // 新增取消预约API
import { deleteOrder } from '@/api/order' // 新增删除订单API
import request from '@/api/request' // 新增导入request

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

    const getRoleDiscountRate = () => {
      const role = userStore.userInfo?.role
      if (role === 1) return 0.88
      if (role === 2) return 0.6
      return 1
    }

    const calcPayAmount = (amount, paid) => {
      const n = Number(amount || 0)
      if (!Number.isFinite(n)) return 0
      // 统一按角色折扣计算，不管是否已支付
      const finalAmount = n * getRoleDiscountRate()
      return Math.round(finalAmount * 100) / 100
    }

    // 订单类型：0-场馆订单，1-器材订单
    const orderType = ref(0)
    const handleReview = (orderId) => {
      router.push(`/order/review/${orderId}`)
    }

    const handleEquipmentReview = (orderId) => {
      router.push(`/order/review/${orderId}`)
    }

    // 搜索和筛选状态
    const searchKeyword = ref('')
    const selectedStatus = ref('')
    const dateRange = ref([])
    const sortField = ref('update_time_desc')
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
    const returningOrderId = ref(null)
    const showCancelDialog = ref(false)
    const cancelLoading = ref(false)
    const cancelForm = ref({
      orderId: null,
      reason: '',
      remark: '',
    })

    // 退款相关
    const showRefundDialog = ref(false)
    const refundLoading = ref(false)
    const refundFormRef = ref(null)
    const refundForm = ref({
      order: null,
      reason: '',
      amount: 0,
      remark: '',
    })

    // 退款表单验证规则
    const refundRules = {
      reason: [{ required: true, message: '请选择退款原因', trigger: 'change' }],
      amount: [
        { required: true, message: '请输入退款金额', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '退款金额必须大于0', trigger: 'blur' },
      ],
      remark: [{ required: true, message: '请输入详细说明', trigger: 'blur' }],
    }

    // 默认图片
    const defaultImage =
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    const equipmentDefaultImage =
      'https://images.unsplash.com/photo-1599065000019-b8dbf6bc9c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'

    // 订单状态选项 - 场馆订单
    const orderStatusOptions = [
      { value: 0, label: '待审核' },
      { value: 1, label: '已通过' },
      { value: 2, label: '已驳回' },
      { value: 3, label: '已取消' },
      { value: 4, label: '已完成' },
    ]

    // 器材订单状态选项
    const equipmentStatusOptions = [
      { value: 1, label: '申请中' },
      { value: 2, label: '使用中' },
      { value: 3, label: '已归还' },
      { value: 4, label: '已驳回' },
    ]

    // 订单自动取消倒计时相关
    const AUTO_CANCEL_MINUTES = 30 // 自动取消时间（分钟）
    const countdownTimers = ref(new Map()) // 存储倒计时定时器

    // 计算剩余时间（分钟）
    const getRemainingMinutes = (createTime) => {
      if (!createTime) return 0
      const created = new Date(createTime)
      const now = new Date()
      const elapsed = (now - created) / (1000 * 60) // 已过分钟数
      const remaining = AUTO_CANCEL_MINUTES - elapsed
      return Math.max(0, Math.floor(remaining))
    }

    // 格式化倒计时显示
    const formatCountdown = (minutes) => {
      if (minutes <= 0) return '已过期'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${mins}分钟`
    }

    // 获取倒计时文本
    const getCountdownText = (createTime) => {
      const remaining = getRemainingMinutes(createTime)
      if (remaining <= 0) return '订单已自动取消'
      return `剩余支付时间：${formatCountdown(remaining)}`
    }

    // 金额格式化函数 - 确保显示2位小数
    const formatMoney = (value) => {
      const n = Number(value || 0)
      return Number.isFinite(n) ? n.toFixed(2) : '0.00'
    }

    // 计算属性
    const hasFilters = computed(() => {
      return searchKeyword.value || selectedStatus.value !== '' || dateRange.value?.length > 0
    })

    // 监听订单类型变化
    watch(orderType, () => {
      currentPage.value = 1
      resetFilters()
      clearAllCountdownTimers() // 清除倒计时定时器
      loadOrders()
      loadOrderStats()
    })

    // 清除所有倒计时定时器
    const clearAllCountdownTimers = () => {
      countdownTimers.value.forEach((timer) => clearInterval(timer))
      countdownTimers.value.clear()
    }

    // 启动倒计时定时器
    const startCountdownTimer = (orderId, createTime) => {
      // 清除该订单的旧定时器
      if (countdownTimers.value.has(orderId)) {
        clearInterval(countdownTimers.value.get(orderId))
      }

      // 如果订单已过期或已支付，不启动定时器
      const remaining = getRemainingMinutes(createTime)
      if (remaining <= 0) return

      // 启动新的定时器，每分钟更新一次
      const timer = setInterval(() => {
        const currentRemaining = getRemainingMinutes(createTime)
        if (currentRemaining <= 0) {
          clearInterval(timer)
          countdownTimers.value.delete(orderId)
          // 可以在这里刷新订单列表或显示提示
          ElMessage.warning('订单已自动取消')
          loadOrders() // 刷新订单列表
        }
      }, 60000) // 每分钟检查一次

      countdownTimers.value.set(orderId, timer)
    }

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

    // 组件卸载时清除所有定时器
    onUnmounted(() => {
      clearAllCountdownTimers()
    })

    // 方法
    const loadOrders = async () => {
      if (!isLogin.value) return

      loading.value = true
      try {
        // 调用后端API，将前端的0/1映射到后端的1/2
        const response = await listOrders(orderType.value === 0 ? 1 : 2)

        // 处理分页数据结构
        const apiOrders = response.data?.records || response.data || []
        const apiTotal = response.data?.total || 0

        // 清除旧的倒计时定时器
        clearAllCountdownTimers()

        // 根据API返回的数据格式处理
        let processedOrders = []

        if (orderType.value === 0) {
          // 场馆订单
          processedOrders = apiOrders.map((item) => {
            const createDate = new Date(item.createTime)

            return {
              id: item.orderNo,
              orderType: 0,
              orderNumber: item.orderNo,
              venueId: null,
              venueName: item.venueName || '未知场馆',
              venueType: '运动场馆',
              venueAddress: item.venueAddress || '地址未知', // 使用后端返回的地址
              venueImage: item.venueImage || defaultImage, // 使用API返回的图片，如果没有则用默认图片
              venuePrice: item.amount,
              equipmentFee: 0,
              serviceFee: 0,
              discount: 0,
              totalAmount: item.amount,
              payAmount: calcPayAmount(item.amount),
              status: item.status,
              createTime: createDate.toLocaleString('zh-CN'),
              bookingDate: item.date ? item.date.split('T')[0] : '',
              timeSlots:
                item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : '时间段未知',
              totalHours:
                item.startTime && item.endTime
                  ? parseInt(item.endTime.split(':')[0]) - parseInt(item.startTime.split(':')[0])
                  : 0,
              peopleCount: 1,
              notes: '',
              paid: item.status === 4,
            }
          })
        } else {
          // 器材订单
          processedOrders = apiOrders.map((item) => {
            const createDate = new Date(item.createTime)
            const unitPrice = item.count ? item.amount / item.count : item.amount

            return {
              id: item.orderNo,
              orderType: 1,
              orderNumber: item.orderNo,
              equipmentItems: [
                {
                  id: item.orderNo,
                  name: item.equipmentName || '未知器材',
                  spec: '标准规格',
                  image: equipmentDefaultImage,
                  unitPrice: unitPrice,
                  quantity: item.count || 1,
                  totalPrice: item.amount,
                },
              ],
              equipmentAmount: item.amount,
              deliveryFee: 0,
              deposit: 0,
              discount: 0,
              totalAmount: item.amount,
              payAmount: calcPayAmount(item.amount),
              status: item.status,
              createTime: createDate.toLocaleString('zh-CN'),
              rentalDays: 1,
              deliveryAddress: '待补充',
              contactName: '用户',
              contactPhone: '未知',
              notes: '',
              paid: item.status !== 1,
            }
          })
        }

        // 应用筛选
        let filteredOrders = processedOrders

        // 为审核通过的场馆订单启动倒计时定时器
        processedOrders.forEach((order) => {
          // 只有场馆订单（orderType === 0）且状态为已通过（status === 1）且未支付才启动倒计时
          const shouldStartCountdown = !order.paid && order.orderType === 0 && order.status === 1

          if (shouldStartCountdown) {
            startCountdownTimer(order.id, order.createTime)
          }
        })

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
        total.value = apiTotal // 使用后端返回的总数

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
        const [venueResponse, equipmentResponse] = await Promise.all([listOrders(1), listOrders(2)])

        // 处理分页数据结构
        const venueOrders = venueResponse.data?.records || venueResponse.data || []
        const equipmentOrders = equipmentResponse.data?.records || equipmentResponse.data || []

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
        const counts = {}
        orders.value.forEach((order) => {
          counts[order.status] = (counts[order.status] || 0) + 1
        })
        statusCounts.value = counts
        totalOrders.value = orders.value.length
      }
    }

    const sortOrders = (orders, sortField) => {
      return [...orders].sort((a, b) => {
        switch (sortField) {
          case 'create_time_desc':
            return new Date(b.createTime) - new Date(a.createTime)
          case 'create_time_asc':
            return new Date(a.createTime) - new Date(b.createTime)
          case 'update_time_desc':
            return new Date(b.updateTime || b.createTime) - new Date(a.updateTime || a.createTime)
          case 'update_time_asc':
            return new Date(a.updateTime || a.createTime) - new Date(b.updateTime || b.createTime)
          case 'amount_desc':
            return Number(b.totalAmount || 0) - Number(a.totalAmount || 0)
          case 'amount_asc':
            return Number(a.totalAmount || 0) - Number(b.totalAmount || 0)
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

    // 场馆订单状态处理方法
    const getStatusType = (status) => {
      const types = {
        0: 'warning',
        1: 'primary',
        2: 'danger',
        3: 'info',
        4: 'success',
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

    const getStatusClass = (status) => {
      const classes = {
        0: 'status-pending',
        1: 'status-approved',
        2: 'status-rejected',
        3: 'status-cancelled',
        4: 'status-completed',
      }
      return classes[status] || ''
    }

    // 器材订单专用状态处理方法
    const getEquipmentStatusText = (status) => {
      const texts = {
        1: '申请中',
        2: '使用中',
        3: '已归还',
        4: '已驳回',
      }
      return texts[status] || '未知状态'
    }

    const getEquipmentStatusType = (status) => {
      const types = {
        1: 'warning',
        2: 'primary',
        3: 'success',
        4: 'danger',
      }
      return types[status] || 'info'
    }

    const getEquipmentStatusClass = (status) => {
      const classes = {
        1: 'status-apply',
        2: 'status-using',
        3: 'status-returned',
        4: 'status-rejected',
      }
      return classes[status] || ''
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
      sortField.value = 'update_time_desc'
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
      cancelingOrderId.value = cancelForm.value.orderId
      try {
        // 调用真实的取消预约API
        const response = await cancelBooking(cancelForm.value.orderId)

        if (response.code === 200) {
          ElMessage.success('预约已取消')
          showCancelDialog.value = false

          // 重新加载订单列表和统计
          await loadOrders()
          await loadOrderStats()
        } else {
          ElMessage.error(response.msg || '取消预约失败')
        }
      } catch (error) {
        console.error('取消预约失败:', error)
        ElMessage.error(error.response?.data?.msg || '取消预约失败，请重试')
      } finally {
        cancelLoading.value = false
        cancelingOrderId.value = null
      }
    }

    const handlePayment = (order) => {
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

      sessionStorage.setItem('paymentOrderData', JSON.stringify(paymentData))

      router.push({
        path: '/OrderPay',
        query: {
          orderId: order.id,
        },
      })
    }

    const handleEquipmentReturn = (orderId) => {
      ElMessageBox.confirm('确定要归还器材吗？', '归还确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
        .then(async () => {
          returningOrderId.value = orderId
          console.log('归还器材，订单ID：', orderId)
          try {
            // 调用后端归还接口：PUT /api/equipment-rentals/{id}/return
            const res = await returnEquipment(orderId)

            if (res.code === 200) {
              ElMessage.success('器材归还成功')

              // 重新加载当前列表和统计数据，状态会从“使用中(2)”变为“已归还(3)”
              await loadOrders()
              await loadOrderStats()
            } else {
              ElMessage.error(res.msg || '归还失败，请重试')
            }
          } catch (error) {
            console.error('归还失败:', error)
            ElMessage.error('归还失败，请检查网络或稍后再试')
          } finally {
            returningOrderId.value = null
          }
        })
        .catch(() => {
          // 用户点击了取消，不做任何处理
        })
    }

    const handleExtendRental = (orderId) => {
      ElMessage.info('续租功能开发中')
    }

    // 退款申请处理
    const handleRefundRequest = (order) => {
      refundForm.value = {
        order: order,
        reason: '',
        amount: order.payAmount ?? order.totalAmount,
        remark: '',
      }
      showRefundDialog.value = true
    }

    const confirmRefundRequest = async () => {
      if (!refundFormRef.value) return

      try {
        await refundFormRef.value.validate()
      } catch (error) {
        return
      }

      refundLoading.value = true
      try {
        // 调用退款申请接口
        const response = await request({
          url: '/api/refund/request',
          method: 'post',
          data: {
            orderNo: refundForm.value.order.orderNumber,
            refundAmount: refundForm.value.amount,
            reason: refundForm.value.reason,
            remark: refundForm.value.remark,
          },
        })

        if (response.code === 200) {
          ElMessage.success('退款申请已提交，请等待审核')
          showRefundDialog.value = false

          // 重新加载订单列表和统计
          await loadOrders()
          await loadOrderStats()
        } else {
          ElMessage.error(response.msg || '退款申请失败')
        }
      } catch (error) {
        console.error('退款申请失败:', error)
        ElMessage.error('退款申请失败，请重试')
      } finally {
        refundLoading.value = false
      }
    }

    const handleReOrder = (order) => {
      ElMessage.info('重新预订该场馆')
      router.push({
        path: '/booking',
        query: { venueId: order.venueId },
      })
    }

    const handleReOrderEquipment = (order) => {
      ElMessage.info('重新租赁器材')
      router.push({
        path: '/equipment',
        query: { items: order.equipmentItems.map((item) => item.id).join(',') },
      })
    }

    const handleDelete = (orderId) => {
      ElMessageBox.confirm('确定要删除这个订单吗？删除后将无法恢复。', '删除订单', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            // 调用真实的删除订单API
            const response = await deleteOrder(orderId)

            if (response.code === 200) {
              ElMessage.success('订单已删除')

              // 重新加载订单列表和统计
              await loadOrders()
              await loadOrderStats()
            } else {
              ElMessage.error(response.msg || '删除订单失败')
            }
          } catch (error) {
            console.error('删除订单失败:', error)
            ElMessage.error(error.response?.data?.msg || '删除订单失败，请重试')
          }
        })
        .catch(() => {
          // 用户取消删除操作
        })
    }

    const createNewOrder = () => {
      router.push('/booking')
    }

    const createEquipmentOrder = () => {
      router.push('/equipment')
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
      isLogin,
      userName,
      orderType,
      searchKeyword,
      selectedStatus,
      dateRange,
      sortField,
      orders,
      loading,
      currentPage,
      pageSize,
      total,
      totalOrders,
      statusCounts,
      typeStats,
      cancelingOrderId,
      payingOrderId,
      returningOrderId,
      showCancelDialog,
      cancelLoading,
      cancelForm,
      showRefundDialog,
      refundLoading,
      refundFormRef,
      refundForm,
      refundRules,
      defaultImage,
      equipmentDefaultImage,
      orderStatusOptions,
      equipmentStatusOptions,
      hasFilters,
      handleReview,
      handleEquipmentReview,
      changeOrderType,
      handleSearch,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      getStatusText,
      getStatusClass,
      getEquipmentStatusText,
      getEquipmentStatusType,
      getEquipmentStatusClass,
      formatDateTime,
      formatDate,
      viewVenueDetail,
      handleCancel,
      confirmCancel,
      handlePayment,
      handleEquipmentReturn,
      handleExtendRental,
      handleRefundRequest,
      confirmRefundRequest,
      handleReOrder,
      handleReOrderEquipment,
      handleDelete,
      createNewOrder,
      createEquipmentOrder,
      goToBooking,
      goToLogin,
      // 倒计时相关函数
      getCountdownText,
      getRemainingMinutes,
      formatCountdown,
      // 金额格式化函数
      formatMoney,
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
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
      transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease,
        background-color 0.3s ease;
      box-sizing: border-box;

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

// 修复：选择框居中
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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

    :deep(.el-select),
    :deep(.el-date-editor) {
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
    border-left: 5px solid #5ed6f4;
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
      color: #e38f19;
    }
  }

  .order-countdown {
    margin-top: 8px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(238, 90, 36, 0.3);

    .countdown-text {
      color: white;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      display: block;
      animation: pulse 2s infinite;

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }
    }
  }
}

// 场馆订单内容
.order-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;

  .venue-info {
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

  // 场馆订单详情部分 - 与器材订单保持一致
  .order-details {
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    padding: 25px 0;

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

            &.status-value {
              font-weight: 600;

              &.status-pending {
                color: #f59e0b;
              }

              &.status-approved {
                color: #10b981;
              }

              &.status-rejected {
                color: #ef4444;
              }

              &.status-cancelled {
                color: #94a3b8;
              }

              &.status-completed {
                color: #27ee6a;
              }
            }
          }
        }
      }
    }

    // 场馆订单操作部分 - 与器材订单保持一致
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

          &.status-value {
            font-weight: 600;

            &.status-apply {
              color: #f59e0b;
            }

            &.status-using {
              color: #3b82f6;
            }

            &.status-returned {
              color: #10b981;
            }

            &.status-rejected {
              color: #ef4444;
            }
          }
        }
      }
    }
  }

  // 器材订单操作部分
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
            color: #e38f19;
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
  .rental-details,
  .order-details {
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

  .status-pending,
  .status-apply {
    color: #fbbf24 !important;
  }

  .status-approved,
  .status-using {
    color: #60a5fa !important;
  }

  .status-completed,
  .status-returned {
    color: #34d399 !important;
  }

  .status-rejected {
    color: #f87171 !important;
  }

  .status-cancelled {
    color: #94a3b8 !important;
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

// 退款对话框样式
.refund-dialog {
  .order-info {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
      }

      .value {
        color: #1e293b;
        font-size: 14px;
        font-weight: 600;

        &.amount {
          color: #f59e0b;
        }

        &.refundable {
          color: #10b981;
        }
      }
    }
  }
}
</style>
