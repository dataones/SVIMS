<template>
  <div><HeaderNav /></div>
  <div class="fault-management">
    <div class="header">
      <h2>故障管理</h2>
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
            @change="loadFaults"
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
            @change="loadFaults"
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
          <el-select
            v-model="filterForm.venueId"
            placeholder="全部场馆"
            clearable
            @change="loadFaults"
          >
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

      <!-- 统计数据 -->
      <div class="stats">
        <el-statistic title="待处理" :value="statistics.pending" />
        <el-statistic title="处理中" :value="statistics.processing" />
        <el-statistic title="已修复" :value="statistics.resolved" />
      </div>
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
        <el-table-column prop="reporterName" label="申报人" width="100" />
        <el-table-column prop="contactPhone" label="联系方式" width="120" />
        <el-table-column prop="createTime" label="申报时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="primary"
              @click="processFault(row)"
            >
              处理
            </el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="updateProgress(row)"
            >
              更新进度
            </el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="warning"
              @click="completeFault(row)"
            >
              完成
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
    <el-dialog v-model="detailVisible" title="故障详情" width="700px">
      <div v-if="currentFault" class="fault-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="故障标题">{{ currentFault.title }}</el-descriptions-item>
          <el-descriptions-item label="故障类型">{{ currentFault.faultType }}</el-descriptions-item>
          <el-descriptions-item label="申报人">{{
            currentFault.reporterName
          }}</el-descriptions-item>
          <el-descriptions-item label="场馆">{{ currentFault.venueName }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{
            currentFault.contactPhone
          }}</el-descriptions-item>
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

    <!-- 处理故障对话框 -->
    <el-dialog v-model="processVisible" title="处理故障" width="500px">
      <el-form :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item label="处理状态" prop="status">
          <el-radio-group v-model="processForm.status">
            <el-radio :label="1">处理中</el-radio>
            <el-radio :label="2">已修复</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注" prop="processRemark">
          <el-input
            v-model="processForm.processRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注"
          />
        </el-form-item>
        <el-form-item label="预计完成时间">
          <el-date-picker
            v-model="processForm.estimatedTime"
            type="datetime"
            placeholder="请选择预计完成时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess" :loading="processing"> 确定 </el-button>
      </template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog v-model="progressVisible" title="更新进度" width="400px">
      <el-form :model="progressForm" label-width="80px">
        <el-form-item label="进度描述">
          <el-input
            v-model="progressForm.progress"
            type="textarea"
            :rows="3"
            placeholder="请输入进度描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress" :loading="updating"> 确定 </el-button>
      </template>
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
import {
  getFaultList,
  processFault as processFaultApi,
  updateFaultProgress,
  getFaultStatistics,
} from '@/api/facility'
import { fetchVenues } from '@/api/venue'
import HeaderNav from '../Home/components/HeaderNav/HeaderNav.vue'
// 响应式数据
const loading = ref(false)
const processing = ref(false)
const updating = ref(false)
const faults = ref([])
const venues = ref([])
const detailVisible = ref(false)
const processVisible = ref(false)
const progressVisible = ref(false)
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const currentFault = ref(null)

// 统计数据
const statistics = reactive({
  pending: 0,
  processing: 0,
  resolved: 0,
})

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

// 处理表单
const processForm = reactive({
  status: 1,
  processRemark: '',
  estimatedTime: '',
})

const processRules = {
  status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
  processRemark: [{ required: true, message: '请输入处理备注', trigger: 'blur' }],
}

// 进度表单
const progressForm = reactive({
  progress: '',
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

    const response = await getFaultList(params)
    faults.value = response.data?.records || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('获取故障列表失败:', error)
    ElMessage.error('获取故障列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const loadStatistics = async () => {
  try {
    const response = await getFaultStatistics({ type: 'month' })
    const data = response.data || {}
    statistics.pending = data.pending || 0
    statistics.processing = data.processing || 0
    statistics.resolved = data.resolved || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
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

// 处理故障
const processFault = (fault) => {
  currentFault.value = fault
  processForm.status = 1
  processForm.processRemark = ''
  processForm.estimatedTime = ''
  processVisible.value = true
}

// 提交处理
const submitProcess = async () => {
  try {
    processing.value = true
    await processFaultApi(
      currentFault.value.id,
      processForm.status,
      processForm.processRemark,
      processForm.estimatedTime,
    )
    ElMessage.success('处理成功')
    processVisible.value = false
    loadFaults()
    loadStatistics()
  } catch (error) {
    console.error('处理故障失败:', error)
    ElMessage.error(error.message || '处理失败')
  } finally {
    processing.value = false
  }
}

// 更新进度
const updateProgress = (fault) => {
  currentFault.value = fault
  progressForm.progress = ''
  progressVisible.value = true
}

// 提交进度
const submitProgress = async () => {
  if (!progressForm.progress.trim()) {
    ElMessage.warning('请输入进度描述')
    return
  }

  try {
    updating.value = true
    await updateFaultProgress(currentFault.value.id, progressForm.progress)
    ElMessage.success('进度更新成功')
    progressVisible.value = false
    loadFaults()
  } catch (error) {
    console.error('更新进度失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    updating.value = false
  }
}

// 完成故障
const completeFault = async (fault) => {
  try {
    await ElMessageBox.confirm(`确定要将故障"${fault.faultType}"标记为已修复吗？`, '确认完成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    })

    await processFaultApi(fault.id, 2, '故障已修复', new Date().toISOString())
    ElMessage.success('标记完成成功')
    loadFaults()
    loadStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成故障失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  }
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
  loadStatistics()
})
</script>

<style scoped>
.fault-management {
  padding: 20px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;

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

.stats {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats :deep(.el-statistic) {
  text-align: center;
  padding: 0 10px;
  border-right: 1px solid #e4e7ed;
}

.stats :deep(.el-statistic:last-child) {
  border-right: none;
}

.stats :deep(.el-statistic__head) {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.stats :deep(.el-statistic__content) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.stats :deep(.el-statistic__number) {
  font-weight: 700;
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
