<template>
  <div class="notice-manage">
    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-content">
          <div class="search-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索通知标题"
              clearable
              style="width: 300px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="selectedType"
              placeholder="通知类型"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="系统通知" value="system" />
              <el-option label="活动公告" value="activity" />
              <el-option label="维护通知" value="maintenance" />
              <el-option label="其他" value="other" />
            </el-select>

            <el-select
              v-model="selectedStatus"
              placeholder="发布状态"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="已发布" value="1" />
              <el-option label="草稿" value="0" />
            </el-select>

            <el-select
              v-model="selectedPriority"
              placeholder="优先级"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="高优先级" value="1" />
              <el-option label="中优先级" value="2" />
              <el-option label="低优先级" value="3" />
            </el-select>
          </div>

          <div class="search-right">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 通知列表 -->
    <div class="table-section">
      <el-card>
        <div class="table-header">
          <div class="table-title">
            <h3>通知列表</h3>
          </div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              发布通知
            </el-button>
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>

        <el-table :data="noticeList" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column label="通知标题" min-width="200">
            <template #default="{ row }">
              <div class="notice-title">
                <el-icon v-if="row.isTop" class="top-icon"><Star /></el-icon>
                <span>{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="优先级" width="80">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="发布时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.publishTime) }}
            </template>
          </el-table-column>

          <el-table-column label="有效期至" width="160">
            <template #default="{ row }">
              {{ formatDate(row.expireTime) || '永久有效' }}
            </template>
          </el-table-column>

          <el-table-column label="阅读量" width="80">
            <template #default="{ row }">
              {{ row.readCount || 0 }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <div class="button-row">
                  <el-button type="text" size="small" @click="handleView(row)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button type="text" size="small" @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                </div>
                <div class="button-row">
                  <el-button type="text" size="small" @click="handleToggleTop(row)">
                    <el-icon><Star /></el-icon>
                    {{ row.isTop ? '取消置顶' : '置顶' }}
                  </el-button>
                  <el-button type="text" size="small" class="danger" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
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
      </el-card>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="showNoticeDialog"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form ref="noticeFormRef" :model="noticeForm" :rules="noticeFormRules" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="noticeForm.title" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select
            v-model="noticeForm.type"
            :disabled="dialogMode === 'view'"
            style="width: 100%"
          >
            <el-option label="系统通知" value="system" />
            <el-option label="活动公告" value="activity" />
            <el-option label="维护通知" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="noticeForm.priority"
            :disabled="dialogMode === 'view'"
            style="width: 100%"
          >
            <el-option label="高优先级" :value="1" />
            <el-option label="中优先级" :value="2" />
            <el-option label="低优先级" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="8"
            :disabled="dialogMode === 'view'"
            placeholder="请输入通知内容"
          />
        </el-form-item>

        <el-form-item label="有效期" prop="expireTime">
          <el-date-picker
            v-model="noticeForm.expireTime"
            type="datetime"
            placeholder="选择过期时间（可选）"
            :disabled="dialogMode === 'view'"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="noticeForm.status" :disabled="dialogMode === 'view'">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="置顶显示">
          <el-switch v-model="noticeForm.isTop" :disabled="dialogMode === 'view'" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNoticeDialog = false">取消</el-button>
          <el-button v-if="dialogMode !== 'view'" type="primary" @click="handleSave">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Search,
  Refresh,
  Plus,
  Download,
  Star,
  View,
  Edit,
  Delete,
  Promotion,
} from '@element-plus/icons-vue'
import {
  getAdminNoticeList,
  addNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  toggleNoticeTop,
} from '@/api/notice'

// 响应式数据
const loading = ref(false)
const noticeList = ref([])
const searchKeyword = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const selectedPriority = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const showNoticeDialog = ref(false)
const dialogMode = ref('add') // add, edit, view
const dialogTitle = computed(() => {
  const titles = {
    add: '发布通知',
    edit: '编辑通知',
    view: '通知详情',
  }
  return titles[dialogMode.value]
})

// 表单数据
const noticeForm = reactive({
  id: null,
  title: '',
  type: 'system',
  priority: 2, // 默认中优先级
  content: '',
  expireTime: null,
  status: 0,
  isTop: false,
})

// 表单验证规则
const noticeFormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '内容长度在 10 到 2000 个字符', trigger: 'blur' },
  ],
}

// 获取通知列表
const fetchNoticeList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      type: selectedType.value,
      status: selectedStatus.value ? Number(selectedStatus.value) : undefined,
      priority: selectedPriority.value ? Number(selectedPriority.value) : undefined,
    }

    const response = await getAdminNoticeList(params)

    if (response.code === 200) {
      noticeList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取通知列表失败')
      noticeList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
    noticeList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchNoticeList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  selectedPriority.value = ''
  pagination.pageNum = 1
  fetchNoticeList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchNoticeList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchNoticeList()
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const types = {
    system: 'primary',
    activity: 'success',
    maintenance: 'warning',
    other: 'info',
  }
  return types[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    system: '系统通知',
    activity: '活动公告',
    maintenance: '维护通知',
    other: '其他',
  }
  return texts[type] || '未知'
}

// 获取优先级标签类型
const getPriorityTagType = (priority) => {
  const types = {
    1: 'danger', // 高优先级 - 红色
    2: 'success', // 中优先级 - 绿色
    3: 'info', // 低优先级 - 蓝色
  }
  return types[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const texts = {
    1: '高',
    2: '中',
    3: '低',
  }
  return texts[priority] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 添加通知
const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  showNoticeDialog.value = true
}

// 查看通知
const handleView = (row) => {
  dialogMode.value = 'view'
  Object.assign(noticeForm, row)
  showNoticeDialog.value = true
}

// 编辑通知
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  Object.assign(noticeForm, row)
  showNoticeDialog.value = true
}

// 发布通知
const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要发布通知 "${row.title}" 吗？`, '确认发布', {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await publishNotice(row.id)

    if (response.code === 200) {
      ElMessage.success('发布成功')
      fetchNoticeList()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布通知失败:', error)
      ElMessage.error('发布通知失败')
    }
  }
}

// 切换置顶状态
const handleToggleTop = async (row) => {
  const action = row.isTop ? '取消置顶' : '置顶'
  try {
    const response = await toggleNoticeTop(row.id, !row.isTop)

    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchNoticeList()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    console.error(`${action}失败:`, error)
    ElMessage.error(`${action}失败`)
  }
}

// 删除通知
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除通知 "${row.title}" 吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await deleteNotice(row.id)

    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchNoticeList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除通知失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 保存通知
const handleSave = async () => {
  try {
    let response
    if (dialogMode.value === 'add') {
      response = await addNotice(noticeForm)
    } else {
      response = await updateNotice(noticeForm)
    }

    if (response.code === 200) {
      ElMessage.success('保存成功')
      showNoticeDialog.value = false
      fetchNoticeList()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存通知失败:', error)
    ElMessage.error('保存通知失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(noticeForm, {
    id: null,
    title: '',
    type: 'system',
    priority: 'medium',
    content: '',
    expireTime: null,
    status: 0,
    isTop: false,
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNoticeList()
})
</script>

<style scoped lang="scss">
.notice-manage {
  padding: 24px;
  background: #ffffff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;

    i {
      color: #409eff;
    }
  }

  .page-subtitle {
    color: #606266;
    margin: 0;
  }
}

.search-section {
  margin-bottom: 24px;

  .search-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .search-left {
      display: flex;
      align-items: center;
    }
  }
}

.table-section {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .table-title {
      h3 {
        margin: 0;
        color: #303133;
      }

      .total-count {
        color: #909399;
        font-size: 14px;
        margin-left: 8px;
      }
    }

    .table-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;

  .top-icon {
    color: #f56c6c;
    font-size: 14px;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;

  .button-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.danger {
  color: #f56c6c;

  &:hover {
    color: #f78989;
  }
}

@media (max-width: 768px) {
  .search-content {
    flex-direction: column;
    gap: 16px;

    .search-left {
      width: 100%;
      flex-direction: column;
      gap: 10px;
    }
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
