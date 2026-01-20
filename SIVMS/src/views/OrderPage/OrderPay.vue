<template>
  <div class="payment-page">
    <!-- 导航栏 -->
    <nav-bar />

    <div class="payment-container">
      <!-- 支付状态进度 -->
      <div class="payment-progress">
        <el-steps :active="paymentStep" finish-status="success" align-center>
          <el-step title="订单确认" description="确认支付金额" />
          <el-step title="支付成功" description="支付完成" />
        </el-steps>
      </div>

      <div class="payment-content">
        <!-- 步骤1: 订单确认和支付 -->
        <div v-if="paymentStep === 1" class="payment-step">
          <div class="step-header">
            <h2><i class="el-icon-document-checked"></i> 确认订单信息</h2>
            <p class="step-desc">请确认您的订单信息及支付金额</p>
          </div>

          <div class="order-summary">
            <div class="summary-card">
              <div class="card-header">
                <h3><i class="el-icon-shopping-cart-full"></i> 订单详情</h3>
                <el-tag type="warning" size="small">待支付</el-tag>
              </div>

              <div class="card-content">
                <div class="order-info">
                  <div class="info-item">
                    <span class="label">订单编号：</span>
                    <span class="value">{{ orderInfo.orderNo }}</span>
                    <el-button type="text" size="small" @click="copyOrderNo"> 复制 </el-button>
                  </div>

                  <div class="info-item">
                    <span class="label">场馆名称：</span>
                    <span class="value">{{ orderInfo.venueName }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">预订时间：</span>
                    <span class="value">{{ orderInfo.fullBookingTime }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">预订时长：</span>
                    <span class="value">{{ orderInfo.totalHours }}小时</span>
                  </div>

                  <div class="info-item" v-if="orderInfo.peopleCount">
                    <span class="label">预订人数：</span>
                    <span class="value">{{ orderInfo.peopleCount }}人</span>
                  </div>

                  <div class="info-item">
                    <span class="label">订单金额：</span>
                    <span class="value amount">¥{{ formatMoney(orderInfo.totalPrice) }}</span>
                  </div>

                  <div class="info-item" v-if="discountRate < 1">
                    <span class="label">折扣优惠：</span>
                    <span class="value">{{ discountText }}</span>
                  </div>

                  <div class="info-item" v-if="discountRate < 1">
                    <span class="label">应付金额：</span>
                    <span class="value amount">¥{{ formatMoney(payAmount) }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">下单时间：</span>
                    <span class="value">{{ formatDateTime(orderInfo.createTime) }}</span>
                  </div>

                  <div class="info-item">
                    <span class="label">支付期限：</span>
                    <span class="value expire-time">
                      {{ formatTime(orderInfo.expireTime) }}
                      <el-tag type="danger" size="mini" v-if="isExpiringSoon"> 即将过期 </el-tag>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button @click="cancelPayment">取消</el-button>
            <el-button
              type="primary"
              @click="handlePayment"
              :loading="isPaying"
              :disabled="isPaying"
            >
              <i class="el-icon-money"></i>
              确认支付 ¥{{ formatMoney(payAmount) }}
            </el-button>
          </div>
        </div>

        <!-- 步骤2: 支付成功 -->
        <div v-else-if="paymentStep === 2" class="payment-step">
          <div class="success-page">
            <div class="success-icon">
              <i class="el-icon-circle-check"></i>
            </div>

            <div class="success-content">
              <h2>支付成功！</h2>
              <p class="success-desc">您的订单已支付成功，场馆预订已完成</p>

              <div class="success-info">
                <div class="info-item">
                  <span>订单编号：</span>
                  <strong>{{ orderInfo.orderNo }}</strong>
                </div>
                <div class="info-item">
                  <span>支付金额：</span>
                  <strong class="amount">¥{{ formatMoney(payAmount) }}</strong>
                </div>
                <div class="info-item" v-if="discountRate < 1">
                  <span>折扣优惠：</span>
                  <strong>{{ discountText }}</strong>
                </div>
                <div class="info-item">
                  <span>支付时间：</span>
                  <span>{{ formatDateTime(new Date()) }}</span>
                </div>
                <div class="info-item">
                  <span>场馆名称：</span>
                  <span>{{ orderInfo.venueName }}</span>
                </div>
                <div class="info-item">
                  <span>预订时间：</span>
                  <span>{{ orderInfo.fullBookingTime }}</span>
                </div>
              </div>

              <div class="success-tips">
                <el-alert type="success" :closable="false">
                  <template #title>
                    <p><i class="el-icon-info"></i> 温馨提示：</p>
                    <ul>
                      <li>请按时到达场馆，出示订单信息进行核销</li>
                      <li>如需修改或取消，请在开始前2小时操作</li>
                      <li>支付凭证已发送至您的手机/邮箱</li>
                    </ul>
                  </template>
                </el-alert>
              </div>

              <div class="success-actions">
                <el-button @click="viewOrderDetail"> 查看订单详情 </el-button>
                <el-button type="primary" @click="goHome"> 返回首页 </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import NavBar from '../Home/components/HeaderNav/HeaderNav.vue'
import { payOrder } from '@/api/order'
import { useUserStore } from '@/stores/user'

export default {
  name: 'PaymentPage',

  components: {
    NavBar,
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()

    // 支付步骤
    const paymentStep = ref(1)

    // 订单信息
    const orderInfo = ref({
      orderNo: '',
      venueName: '',
      date: '',
      startTime: '',
      endTime: '',
      fullBookingTime: '',
      totalHours: 0,
      peopleCount: 0,
      totalPrice: 0,
      createTime: new Date(),
      expireTime: new Date(Date.now() + 30 * 60 * 1000),
    })

    // 支付状态
    const isPaying = ref(false)

    const discountRate = computed(() => {
      const role = userStore.userInfo?.role
      if (role === 1) return 0.88
      if (role === 2) return 0.6
      return 1
    })

    const discountText = computed(() => {
      const role = userStore.userInfo?.role
      if (role === 1) return '会员用户 88折'
      if (role === 2) return '管理员用户 6折'
      return ''
    })

    const payAmount = computed(() => {
      const original = Number(orderInfo.value.totalPrice || 0)
      const finalAmount = original * discountRate.value
      return Math.round(finalAmount * 100) / 100
    })

    const formatMoney = (value) => {
      const n = Number(value || 0)
      return Number.isFinite(n) ? n.toFixed(2) : '0.00'
    }

    // 支付页面 setup 中
    onMounted(async () => {
      if (userStore.token && userStore.userInfo?.role == null) {
        try {
          await userStore.getUserInfoAction()
        } catch (e) {
          // ignore
        }
      }

      loadOrderInfo()
      const orderId = route.query.orderId || ''

      if (!orderId) {
        ElMessage.error('订单信息不完整')
        router.push('/order/list')
        return
      }

      // 从 sessionStorage 获取订单信息
      const paymentDataStr = sessionStorage.getItem('paymentOrderData')
      if (paymentDataStr) {
        try {
          const paymentData = JSON.parse(paymentDataStr)

          // 验证订单ID是否匹配
          if (paymentData.orderId !== orderId) {
            ElMessage.error('订单信息不匹配')
            router.push('/order/list')
            return
          }

          orderInfo.value = {
            orderNo: paymentData.orderNo,
            venueName: paymentData.venueName,
            date: paymentData.date,
            startTime: paymentData.startTime,
            endTime: paymentData.endTime,
            fullBookingTime: paymentData.date
              ? `${formatDate(paymentData.date)} ${paymentData.startTime} - ${paymentData.endTime}`
              : '',
            totalHours: paymentData.totalHours,
            peopleCount: paymentData.peopleCount,
            totalPrice: paymentData.amount,
            createTime: new Date(),
            expireTime: new Date(Date.now() + 30 * 60 * 1000),
          }
        } catch (error) {
          console.error('解析订单数据失败:', error)
          ElMessage.error('订单数据错误')
          router.push('/order/list')
        }
      } else {
        ElMessage.error('订单信息已过期')
        router.push('/order/list')
      }
    })

    // 加载订单信息
    // 加载订单信息
    const loadOrderInfo = () => {
      const orderId = route.query.orderId || ''

      if (!orderId) {
        ElMessage.error('订单信息不完整')
        router.push('/order/list')
        return
      }

      // 从 sessionStorage 获取订单信息
      const paymentDataStr = sessionStorage.getItem('paymentOrderData')
      if (paymentDataStr) {
        try {
          const paymentData = JSON.parse(paymentDataStr)

          // 验证订单ID是否匹配
          if (paymentData.orderId !== orderId) {
            ElMessage.error('订单信息不匹配')
            router.push('/order/list')
            return
          }

          // 计算完整的预订时间字符串
          let fullBookingTime = ''
          if (paymentData.date && paymentData.startTime && paymentData.endTime) {
            fullBookingTime = `${formatDate(paymentData.date)} ${paymentData.startTime} - ${paymentData.endTime}`
          }

          orderInfo.value = {
            orderNo: paymentData.orderNo,
            venueName: paymentData.venueName,
            date: paymentData.date,
            startTime: paymentData.startTime,
            endTime: paymentData.endTime,
            fullBookingTime: fullBookingTime,
            totalHours: paymentData.totalHours || 0,
            peopleCount: paymentData.peopleCount || 1,
            totalPrice: paymentData.amount || 0,
            createTime: new Date(),
            expireTime: new Date(Date.now() + 30 * 60 * 1000),
          }
        } catch (error) {
          console.error('解析订单数据失败:', error)
          ElMessage.error('订单数据错误')
          router.push('/order/list')
        }
      } else {
        ElMessage.error('订单信息已过期，请重新选择订单')
        router.push('/order/list')
      }
    }

    // 处理支付
    const handlePayment = async () => {
      isPaying.value = true
      try {
        // 调用后端支付接口
        const res = await payOrder(orderInfo.value.orderNo)

        if (res.code === 200) {
          ElMessage.success('支付成功！')
          paymentStep.value = 2
        } else {
          ElMessage.error(res.msg || '支付失败')
        }
      } catch (error) {
        console.error('支付失败:', error)
        ElMessage.error('支付失败，请重试')
      } finally {
        isPaying.value = false
      }
    }

    // 取消支付
    const cancelPayment = () => {
      ElMessageBox.confirm('确定要取消支付吗？订单将在30分钟后自动取消', '取消支付', {
        confirmButtonText: '确定',
        cancelButtonText: '继续支付',
        type: 'warning',
      }).then(() => {
        router.push('/OrderManagement')
      })
    }

    // 查看订单详情
    const viewOrderDetail = () => {
      router.push('/OrderManagement')
    }

    // 返回首页
    const goHome = () => {
      router.push('/')
    }

    // 复制订单号
    const copyOrderNo = () => {
      navigator.clipboard
        .writeText(orderInfo.value.orderNo)
        .then(() => {
          ElMessage.success('订单号已复制')
        })
        .catch(() => {
          ElMessage.error('复制失败')
        })
    }

    // 格式化时间
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[date.getDay()]
      return `${month}月${day}日 星期${weekDay}`
    }

    const formatDateTime = (date) => {
      const d = new Date(date)
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatTime = (date) => {
      const d = new Date(date)
      return d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    // 计算属性
    const isExpiringSoon = computed(() => {
      const now = new Date()
      const expireTime = new Date(orderInfo.value.expireTime)
      const diffMinutes = (expireTime - now) / (1000 * 60)
      return diffMinutes < 15 // 15分钟内过期
    })

    return {
      // 状态
      paymentStep,
      orderInfo,
      isPaying,

      // 计算属性
      isExpiringSoon,
      discountRate,
      discountText,
      payAmount,

      // 方法
      handlePayment,
      cancelPayment,
      viewOrderDetail,
      goHome,
      copyOrderNo,
      formatMoney,
      formatDate,
      formatDateTime,
      formatTime,
    }
  },
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.payment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.payment-progress {
  margin-bottom: 40px;
  background: white;
  padding: 30px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.payment-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.step-header {
  text-align: center;
  margin-bottom: 40px;
}

.step-header h2 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 24px;
}

.step-header .step-desc {
  color: #909399;
  font-size: 14px;
}

.order-summary,
.payment-methods {
  max-width: 800px;
  margin: 0 auto;
}

.summary-card,
.methods-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.card-content {
  padding: 20px;
}

.order-info {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #606266;
  width: 100px;
  flex-shrink: 0;
}

.info-item .value {
  flex: 1;
  color: #303133;
}

.info-item .amount {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.info-item .expire-time {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-breakdown {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.price-breakdown h4 {
  margin-bottom: 15px;
  color: #303133;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #606266;
}

.price-item.discount {
  color: #67c23a;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  margin-top: 15px;
  border-top: 2px solid #ebeef5;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.total-amount {
  color: #f56c6c;
  font-size: 24px;
}

.payment-options {
  width: 100%;
}

.payment-option {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.payment-option.is-checked {
  border-color: #409eff;
  background: #ecf5ff;
}

.option-content {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.wechat-pay .option-icon {
  background: #07c160;
}

.alipay .option-icon {
  background: #1677ff;
}

.balance-pay .option-icon {
  background: #e6a23c;
}

.bank-card .option-icon {
  background: #909399;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 14px;
  color: #909399;
}

.option-desc .insufficient {
  color: #f56c6c;
}

.option-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 18px;
}

.payment-amount {
  margin-top: 30px;
}

.amount-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.amount-header {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.amount-header h4 {
  margin: 0;
  font-size: 16px;
}

.amount-content {
  padding: 20px;
}

.amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.amount-display .label {
  font-size: 16px;
  color: #606266;
}

.amount-display .value {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.expire-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6a23c;
  font-size: 14px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #ebeef5;
}

.success-page {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
}

.success-content h2 {
  color: #67c23a;
  margin-bottom: 15px;
  font-size: 28px;
}

.success-desc {
  color: #909399;
  font-size: 16px;
  margin-bottom: 40px;
}

.success-info {
  max-width: 500px;
  margin: 0 auto 40px;
  padding: 25px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: left;
}

.success-info .info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e4e7ed;
}

.success-info .info-item:last-child {
  border-bottom: none;
}

.success-info .amount {
  color: #f56c6c;
  font-size: 20px;
}

.success-tips {
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: left;
}

.success-tips ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.success-tips li {
  margin-bottom: 5px;
  color: #606266;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.qr-code-dialog {
  text-align: center;
}

.qr-code-content {
  padding: 20px;
}

.qr-code-placeholder {
  margin-bottom: 30px;
}

.qr-code-box {
  margin-bottom: 20px;
}

.qr-code-simulated {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 1px;
  padding: 10px;
}

.qr-grid {
  display: contents;
}

.qr-dot {
  background: #000;
  border-radius: 2px;
}

.qr-amount {
  margin-top: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.payment-method-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.method-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.method-icon i[class*='chat-dot-round'] {
  background: #07c160;
}

.method-icon i[class*='shopping-bag-2'] {
  background: #1677ff;
}

.method-name {
  font-size: 16px;
  color: #303133;
}

.qr-tips {
  text-align: left;
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.qr-tips p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.countdown-timer {
  margin-top: 20px;
  padding: 15px;
  background: #fff6f6;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-weight: bold;
}

.timer {
  font-size: 18px;
  margin-left: 10px;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
</style>
