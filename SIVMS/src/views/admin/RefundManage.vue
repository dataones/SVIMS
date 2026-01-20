<template>
  <HeaderNav />
  <div class="refund-manage">
    <div class="header">
      <h2>退款管理</h2>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="订单类型">
          <el-select v-model="filterForm.type" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="场馆预约" value="1" />
            <el-option label="器材租赁" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已退款" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <el-table :data="orderList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column prop="type" label="订单类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'primary' : 'success'">
            {{ row.type === 1 ? '场馆预约' : '器材租赁' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="100" />
      <el-table-column prop="amount" label="订单金额" width="100">
        <template #default="{ row }"> ¥{{ row.amount }} </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 1" type="warning" size="small" @click="handleRefund(row)">
            退款
          </el-button>
          <el-button type="primary" size="small" @click="handleViewDetail(row)"> 详情 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 退款对话框 -->
    <el-dialog v-model="refundDialogVisible" title="处理退款" width="500px">
      <el-form :model="refundForm" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="refundForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="refundForm.amount" disabled>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="退款金额" prop="amount">
          <el-input-number
            v-model="refundForm.refundAmount"
            :min="0"
            :max="refundForm.amount"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="管理员备注" prop="adminRemark">
          <el-input
            v-model="refundForm.adminRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入退款处理备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRefund" :loading="refundLoading">
          确认退款
        </el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="currentOrder.type === 1 ? 'primary' : 'success'">
              {{ currentOrder.type === 1 ? '场馆预约' : '器材租赁' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentOrder.username }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.amount }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            currentOrder.createTime
          }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.payTime" label="支付时间">{{
            currentOrder.payTime
          }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.venueName" label="场馆名称">{{
            currentOrder.venueName
          }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.equipmentName" label="器材名称">{{
            currentOrder.equipmentName
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, processRefund } from '@/api/settlement'

// 响应式数据
const loading = ref(false)
const refundLoading = ref(false)
const orderList = ref([])
const refundDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentOrder = ref(null)
const refundFormRef = ref(null)

// 筛选表单
const filterForm = reactive({
  type: '',
  status: '',
  username: '',
})

// 退款表单
const refundForm = reactive({
  orderNo: '',
  amount: 0,
  refundAmount: 0,
  adminRemark: '',
})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 退款表单验证规则
const refundRules = {
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '退款金额必须大于0', trigger: 'blur' },
  ],
  adminRemark: [{ required: true, message: '请输入管理员备注', trigger: 'blur' }],
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      type: filterForm.type || undefined,
      status: filterForm.status || undefined,
      username: filterForm.username || undefined,
    }

    const response = await getOrderList(params)
    if (response.code === 200) {
      orderList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchOrders()
}

// 重置
const handleReset = () => {
  filterForm.type = ''
  filterForm.status = ''
  filterForm.username = ''
  pagination.pageNum = 1
  fetchOrders()
}

// 处理退款
const handleRefund = (order) => {
  refundForm.orderNo = order.orderNo
  refundForm.amount = parseFloat(order.amount)
  refundForm.refundAmount = parseFloat(order.amount)
  refundForm.adminRemark = ''
  refundDialogVisible.value = true
}

// 确认退款
const handleConfirmRefund = async () => {
  try {
    await refundFormRef.value.validate()

    refundLoading.value = true

    const response = await processRefund(
      refundForm.orderNo,
      refundForm.refundAmount,
      refundForm.adminRemark,
    )

    if (response.code === 200) {
      ElMessage.success('退款处理成功')
      refundDialogVisible.value = false
      fetchOrders()
    } else {
      ElMessage.error(response.message || '退款处理失败')
    }
  } catch (error) {
    console.error('退款处理失败:', error)
    ElMessage.error('退款处理失败')
  } finally {
    refundLoading.value = false
  }
}

// 查看详情
const handleViewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchOrders()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchOrders()
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'info',
    4: 'danger',
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '未支付',
    1: '已支付',
    2: '已完成',
    3: '已取消',
    4: '已退款',
  }
  return texts[status] || '未知'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.refund-manage {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.filter-section {
  background: #fff;
  padding: 18px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.el-table {
  margin-bottom: 20px;
}

.el-descriptions {
  margin-top: 20px;
}
</style>
