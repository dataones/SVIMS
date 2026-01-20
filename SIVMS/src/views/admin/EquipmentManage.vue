<template>
  <div class="app-container">
    <!-- 1. 顶部筛选与操作 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="器材名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="可租用" :value="1" />
            <el-option label="不可用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增器材</el-button>
          <!-- 新增功能：借用审核入口 -->
          <el-button type="warning" :icon="List" @click="openRentalAudit">借用审核</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 器材列表表格 -->
    <el-table :data="tableData" v-loading="loading" border style="margin-top: 20px">
      <el-table-column prop="id" label="ID" width="60" align="center" />

      <el-table-column label="图片" width="80" align="center">
        <template #default="scope">
          <el-image
            style="width: 40px; height: 40px"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
            fit="cover"
          >
            <template #error
              ><div class="image-slot">
                <el-icon><Picture /></el-icon></div
            ></template>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="器材名称" />
      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column prop="price" label="租金" width="100">
        <template #default="scope">￥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="totalStock" label="总库存" width="100" align="center" />

      <el-table-column label="剩余" width="100" align="center">
        <template #default="scope">
          <span style="color: #67c23a; font-weight: bold">
            {{ scope.row.totalStock - scope.row.rentedStock }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      style="margin-top: 20px; display: flex; justify-content: flex-end"
      background
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleQuery"
      @current-change="getList"
    >
    </el-pagination>

    <!-- 3. 新增/编辑弹窗 -->
    <el-dialog :title="form.id ? '编辑器材' : '新增器材'" v-model="dialogVisible" width="450px">
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="器材名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.specification" placeholder="如：标准7号" />
        </el-form-item>
        <el-form-item label="租金单价">
          <el-input-number v-model="form.price" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="总库存">
          <el-input-number v-model="form.totalStock" :min="1" />
        </el-form-item>
        <el-form-item label="器材图片">
          <OssUpload v-model="form.image" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 4. 借用审核弹窗 (新增功能) -->
    <el-dialog title="器材借用审核" v-model="rentalDialogVisible" width="800px">
      <el-table :data="rentalData" border max-height="400">
        <el-table-column prop="id" label="单号" width="80" />
        <el-table-column prop="username" label="申请人" width="100" />
        <el-table-column prop="equipmentName" label="器材" />
        <el-table-column prop="count" label="数量" width="60" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getRentalStatusType(scope.row.status)">
              {{ getRentalStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <div v-if="scope.row.status === 1">
              <!-- 1=申请中 -->
              <el-button type="success" link size="small" @click="handleApprove(scope.row)"
                >通过</el-button
              >
              <el-button type="danger" link size="small" @click="handleReject(scope.row)"
                >驳回</el-button
              >
            </div>
            <span v-else style="color: #999; font-size: 12px">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Picture, List } from '@element-plus/icons-vue'
import OssUpload from '@/components/OssUpload.vue'

// 引入你提供的所有 API
import {
  fetchEquipments,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getAllRentals,
  approveRental,
  rejectRental,
} from '@/api/equipment.js'
// 引入 OSS 上传 API
import { uploadImage } from '@/api/oss'

// =============== 1. 器材档案管理逻辑 ===============
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: null,
})

const form = reactive({
  id: null,
  name: '',
  specification: '',
  price: 0,
  totalStock: 10,
  image: '',
  status: 1,
})

const getList = () => {
  loading.value = true
  fetchEquipments(queryParams)
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data.records
        total.value = res.data.total
      } else {
        ElMessage.error(res.msg || '获取失败')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const handleStatusChange = (row) => {
  updateEquipment({ id: row.id, status: row.status })
    .then((res) => {
      if (res.code === 200) ElMessage.success('状态更新成功')
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1
    })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除吗？', '警告', { type: 'warning' }).then(() => {
    deleteEquipment(row.id).then((res) => {
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    })
  })
}

const submitForm = async () => {
  // 如果有本地图片需要上传（blob:开头），先上传到OSS
  if (form.image && form.image.startsWith('blob:')) {
    // 从blob创建File对象
    let fileToUpload
    try {
      fileToUpload = await fetch(form.image)
        .then((res) => res.blob())
        .then((blob) => {
          // 使用你期望的动态时间撮格式：年-月-日 时间撮
          const now = new Date()
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
          const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
          const extension = 'png' // 默认使用png扩展名
          const fileName = `${dateStr} ${timeStr}.${extension}`

          return new File([blob], fileName, { type: `image/${extension}` })
        })

      const url = await uploadImage(fileToUpload)

      // 更新表单中的image为OSS URL
      form.image = url

      ElMessage.success('图片上传成功')
    } catch (error) {
      // 检查是否是网络错误但实际上传成功
      if (error.message && error.message.includes('网络错误')) {
        // 使用你期望的动态时间撮格式：年-月-日 时间撮
        const now = new Date()
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
        const extension = 'png' // 默认使用png扩展名
        const filename = `${dateStr} ${timeStr}.${extension}`
        const ossUrl = `https://sims-images.oss-cn-beijing.aliyuncs.com/${filename}`

        form.image = ossUrl

        ElMessage.warning('图片上传可能成功，已构造OSS地址')
      } else {
        // 其他类型的错误，直接抛出
        throw error
      }
    }
  }

  // 调用API保存器材信息
  const apiCall = form.id ? updateEquipment : addEquipment
  apiCall(form)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success(res.msg || '操作成功')
        dialogVisible.value = false
        getList()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
    .catch((error) => {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    })
}

const handleAdd = () => {
  // 不要重置image字段，保持OSS上传的URL
  Object.assign(form, {
    id: null,
    name: '',
    specification: '',
    price: 0,
    totalStock: 10,
    status: 1,
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// =============== 2. 借用审核逻辑 (新增) ===============
const rentalDialogVisible = ref(false)
const rentalData = ref([])

// 打开审核弹窗
const openRentalAudit = () => {
  rentalDialogVisible.value = true
  loadRentalList()
}

// 加载借用列表
const loadRentalList = () => {
  getAllRentals().then((res) => {
    // 假设返回的是 List 或 Page.records，根据实际后端做适配
    if (res.code === 200) {
      rentalData.value = Array.isArray(res.data) ? res.data : res.data.records || []
    }
  })
}

// 通过
const handleApprove = (row) => {
  approveRental(row.id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('已通过')
      loadRentalList() // 刷新列表
    }
  })
}

// 驳回
const handleReject = (row) => {
  rejectRental(row.id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('已驳回')
      loadRentalList()
    }
  })
}

// 状态显示辅助函数
const getRentalStatusText = (status) => {
  const map = { 1: '申请中', 2: '使用中', 3: '已归还', 4: '已驳回' }
  return map[status] || '未知'
}
const getRentalStatusType = (status) => {
  const map = { 1: 'warning', 2: 'primary', 3: 'success', 4: 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  getList()
})
</script>
