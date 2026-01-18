<template>
  <div class="fault-list">
    <div class="header">
      <h2>故障列表</h2>
      <div class="actions">
        <el-button type="primary" @click="showReportDialog = true"> 申报故障 </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 180px !important"
          >
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已修复" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障类型">
          <el-select
            v-model="filterForm.faultType"
            placeholder="全部类型"
            clearable
            style="width: 180px !important"
          >
            <el-option label="照明设备" value="照明设备" />
            <el-option label="运动器材" value="运动器材" />
            <el-option label="场地设施" value="场地设施" />
            <el-option label="水电设施" value="水电设施" />
            <el-option label="安全设施" value="安全设施" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="场馆">
          <el-select v-model="filterForm.venueId" placeholder="全部场馆" clearable>
            <el-option
              v-for="venue in venues"
              :key="venue.id"
              :label="venue.name"
              :value="venue.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadFaults">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 故障列表 -->
    <div class="fault-table">
      <el-table :data="faults" v-loading="loading" stripe>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="venueName" label="场馆" width="120" />
        <el-table-column prop="title" label="故障标题" width="120" />
        <el-table-column prop="faultType" label="故障类型" width="100" />
        <el-table-column prop="content" label="故障描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="故障位置" width="120" />
        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getUrgencyType(row.urgency)">
              {{ getUrgencyText(row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申报时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="warning"
              @click="cancelFault(row)"
            >
              取消
            </el-button>
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
    </div>

    <!-- 故障详情对话框 -->
    <el-dialog v-model="detailVisible" title="故障详情" width="600px">
      <div v-if="currentFault" class="fault-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="故障标题">{{ currentFault.title }}</el-descriptions-item>
          <el-descriptions-item label="故障类型">{{ currentFault.faultType }}</el-descriptions-item>
          <el-descriptions-item label="场馆">{{ currentFault.venueName }}</el-descriptions-item>
          <el-descriptions-item label="故障位置">{{ currentFault.location }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            <el-tag :type="getUrgencyType(currentFault.urgency)">
              {{ getUrgencyText(currentFault.urgency) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentFault.status)">
              {{ getStatusText(currentFault.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申报时间">{{
            formatDateTime(currentFault.createTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{
            currentFault.contactPhone
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>故障描述</h4>
          <p>{{ currentFault.description }}</p>
        </div>

        <div v-if="currentFault.images && currentFault.images.length > 0" class="detail-section">
          <h4>故障图片</h4>
          <div class="image-list">
            <img
              v-for="(image, index) in currentFault.images"
              :key="index"
              :src="image"
              class="fault-image"
              @click="previewImage(image)"
              alt="故障图片"
            />
          </div>
        </div>

        <div v-if="currentFault.result" class="detail-section">
          <h4>处理结果</h4>
          <p>{{ currentFault.result }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 申报故障对话框 -->
    <el-dialog v-model="showReportDialog" title="申报故障" width="600px">
      <FaultReport @success="onReportSuccess" />
    </el-dialog>

    <!-- 图片预览 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览">
      <img :src="previewImageUrl" style="width: 100%; height: auto" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyFaults, cancelFault as cancelFaultApi } from '@/api/facility'
import { fetchVenues } from '@/api/venue'
import FaultReport from './FaultReport.vue'

// 响应式数据
const loading = ref(false)
const faults = ref([])
const venues = ref([])
const detailVisible = ref(false)
const showReportDialog = ref(false)
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const currentFault = ref(null)

// 筛选表单
const filterForm = reactive({
  status: null,
  faultType: '',
  venueId: null,
})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 获取故障列表
const loadFaults = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...filterForm,
    }

    const response = await getMyFaults(params)
    faults.value = response.data?.records || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('获取故障列表失败:', error)
    ElMessage.error('获取故障列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilter = () => {
  Object.assign(filterForm, {
    status: null,
    faultType: '',
    venueId: null,
  })
  pagination.pageNum = 1
  loadFaults()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadFaults()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadFaults()
}

// 查看详情
const viewDetail = (fault) => {
  currentFault.value = fault
  detailVisible.value = true
}

// 取消故障申报
const cancelFault = async (fault) => {
  try {
    await ElMessageBox.confirm(`确定要取消故障申报"${fault.faultType}"吗？`, '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const reason = await ElMessageBox.prompt('请输入取消原因', '取消原因', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '取消原因不能为空',
    })

    await cancelFaultApi(fault.id, reason.value)
    ElMessage.success('取消成功')
    loadFaults()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消故障申报失败:', error)
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 申报成功回调
const onReportSuccess = () => {
  showReportDialog.value = false
  loadFaults()
}

// 图片预览
const previewImage = (url) => {
  previewImageUrl.value = url
  imagePreviewVisible.value = true
}

// 状态相关方法
const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'primary', 2: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待处理', 1: '处理中', 2: '已修复' }
  return texts[status] || '未知'
}

const getUrgencyType = (urgency) => {
  const types = { LOW: 'info', MEDIUM: 'warning', HIGH: 'danger' }
  return types[urgency] || 'info'
}

const getUrgencyText = (urgency) => {
  const texts = { LOW: '低', MEDIUM: '中', HIGH: '高' }
  return texts[urgency] || '未知'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取场馆列表
const loadVenues = async () => {
  try {
    const response = await fetchVenues()
    venues.value = response.data || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadVenues()
  loadFaults()
})
</script>

<style scoped>
.fault-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  color: #303133;
  margin: 0;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  .el-form-item {
    margin-right: 20px;
    margin-bottom: 10px;
  }

  .el-select {
    min-width: 150px !important;
    width: 150px !important;
  }

  :deep(.el-select) {
    min-width: 150px !important;
    width: 150px !important;
  }

  :deep(.el-select__wrapper) {
    min-width: 150px !important;
    width: 150px !important;
  }

  /* 专门针对状态和故障类型选择框 */
  .el-form-item:nth-child(1) .el-select,
  .el-form-item:nth-child(2) .el-select {
    width: 180px !important;
    min-width: 180px !important;
  }

  :deep(.el-form-item:nth-child(1) .el-select),
  :deep(.el-form-item:nth-child(2) .el-select) {
    width: 180px !important;
    min-width: 180px !important;
  }

  :deep(.el-form-item:nth-child(1) .el-select__wrapper),
  :deep(.el-form-item:nth-child(2) .el-select__wrapper) {
    width: 180px !important;
    min-width: 180px !important;
  }
}

.fault-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  padding: 20px;
  text-align: right;
}

.fault-detail {
  padding: 20px 0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  color: #303133;
  margin-bottom: 10px;
}

.detail-section p {
  color: #606266;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fault-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.fault-image:hover {
  transform: scale(1.05);
}
</style>
