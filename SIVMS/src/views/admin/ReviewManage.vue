<template>
  <div class="review-manage">

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="审核状态">
          <el-select v-model="filterForm.auditStatus" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审核" value="0" />
            <el-option label="已通过" value="1" />
            <el-option label="违规隐藏" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="场馆名称">
          <el-input v-model="filterForm.venueName" placeholder="输入场馆名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 评价列表 -->
    <el-table :data="reviewList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="venueName" label="场馆名称" width="120" />
      <el-table-column prop="nickname" label="评价用户" width="100" />
      <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
      <el-table-column prop="rating" label="评分" width="100">
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled show-score />
        </template>
      </el-table-column>
      <el-table-column prop="auditStatus" label="审核状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.auditStatus)">
            {{ getStatusText(row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评价时间" width="160" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.auditStatus === 0"
            type="success"
            size="small"
            @click="handleAudit(row, 1)"
          >
            通过
          </el-button>
          <el-button
            v-if="row.auditStatus === 0"
            type="danger"
            size="small"
            @click="handleAudit(row, 2)"
          >
            隐藏
          </el-button>
          <el-button
            v-if="row.auditStatus === 1"
            type="warning"
            size="small"
            @click="handleAudit(row, 2)"
          >
            隐藏
          </el-button>
          <el-button
            v-if="row.auditStatus === 2"
            type="success"
            size="small"
            @click="handleAudit(row, 1)"
          >
            显示
          </el-button>
          <el-button type="primary" size="small" @click="handleViewDetail(row)"> 详情 </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)"> 删除 </el-button>
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

    <!-- 评价详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="评价详情" width="600px">
      <div v-if="currentReview">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="评价ID">{{ currentReview.id }}</el-descriptions-item>
          <el-descriptions-item label="场馆名称">{{
            currentReview.venueName
          }}</el-descriptions-item>
          <el-descriptions-item label="评价用户">{{ currentReview.nickname }}</el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-rate v-model="currentReview.rating" disabled show-score />
          </el-descriptions-item>
          <el-descriptions-item label="评价内容">{{ currentReview.content }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentReview.auditStatus)">
              {{ getStatusText(currentReview.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评价时间">{{
            currentReview.createTime
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- 状态切换按钮 -->
          <el-button
            v-if="currentReview.auditStatus === 0"
            type="success"
            @click="handleAudit(currentReview, 1)"
          >
            通过
          </el-button>
          <el-button
            v-if="currentReview.auditStatus === 0"
            type="danger"
            @click="handleAudit(currentReview, 2)"
          >
            隐藏
          </el-button>
          <el-button
            v-if="currentReview.auditStatus === 1"
            type="warning"
            @click="handleAudit(currentReview, 2)"
          >
            隐藏
          </el-button>
          <el-button
            v-if="currentReview.auditStatus === 2"
            type="success"
            @click="handleAudit(currentReview, 1)"
          >
            显示
          </el-button>
          <el-button type="danger" @click="handleDelete(currentReview)">删除评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllReviews, auditReview, deleteReview } from '@/api/review'

// 响应式数据
const loading = ref(false)
const reviewList = ref([])
const detailDialogVisible = ref(false)
const currentReview = ref(null)

// 筛选表单
const filterForm = reactive({
  auditStatus: '',
  venueName: '',
})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 获取评价列表
const fetchReviews = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      auditStatus: filterForm.auditStatus || undefined,
      venueName: filterForm.venueName || undefined,
    }

    const response = await getAllReviews(params)
    if (response.code === 200) {
      reviewList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取评价列表失败')
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchReviews()
}

// 重置
const handleReset = () => {
  filterForm.auditStatus = ''
  filterForm.venueName = ''
  pagination.pageNum = 1
  fetchReviews()
}

// 审核评价
const handleAudit = async (review, status) => {
  try {
    // 根据当前状态和目标状态生成操作文本
    let actionText = ''
    if (review.auditStatus === 0 && status === 1) {
      actionText = '通过'
    } else if (review.auditStatus === 0 && status === 2) {
      actionText = '隐藏'
    } else if (review.auditStatus === 1 && status === 2) {
      actionText = '隐藏'
    } else if (review.auditStatus === 2 && status === 1) {
      actionText = '显示'
    } else {
      actionText = status === 1 ? '通过' : '隐藏'
    }

    await ElMessageBox.confirm(`确定要${actionText}这条评价吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await auditReview(review.id, status)
    if (response.code === 200) {
      ElMessage.success(`评价${actionText}成功`)
      fetchReviews()
    } else {
      ElMessage.error(response.message || `评价${actionText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核评价失败:', error)
      ElMessage.error('审核评价失败')
    }
  }
}

// 查看详情
const handleViewDetail = (review) => {
  currentReview.value = review
  detailDialogVisible.value = true
}

// 删除评价
const handleDelete = async (review) => {
  try {
    await ElMessageBox.confirm(`确定要删除这条评价吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await deleteReview(review.id)
    if (response.code === 200) {
      ElMessage.success('评价删除成功')
      detailDialogVisible.value = false // 关闭详情对话框
      fetchReviews() // 重新获取列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除评价失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchReviews()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchReviews()
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待审核',
    1: '已通过',
    2: '违规隐藏',
  }
  return texts[status] || '未知'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.review-manage {
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
