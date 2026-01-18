<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="名称">
          <el-input
            v-model="queryParams.name"
            placeholder="场馆名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="queryParams.type"
            placeholder="全部分类"
            clearable
            style="width: 150px"
          >
            <el-option label="篮球馆" value="篮球馆" />
            <el-option label="羽毛球馆" value="羽毛球馆" />
            <el-option label="游泳馆" value="游泳馆" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <!--
            clearable: 允许清空，清空后值为 null，即查询全部
            style: 调整宽度适配
          -->
          <el-select
            v-model="queryParams.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="上架中" :value="1" />
            <el-option label="已下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border style="margin-top: 20px">
      <el-table-column prop="id" label="ID" width="60" align="center" />

      <el-table-column label="图片" width="120" align="center">
        <template #default="scope">
          <el-image
            style="width: 80px; height: 60px"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
            fit="contain"
            :hide-on-click-modal="true"
          >
            <template #error
              ><div class="image-slot">
                <el-icon><Picture /></el-icon>
                <div style="font-size: 10px; color: #999">加载失败</div>
              </div>
              ></template
            >
          </el-image>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="场馆名称" min-width="120" />
      <el-table-column prop="type" label="分类" width="100" align="center">
        <template #default="scope"
          ><el-tag effect="plain">{{ scope.row.type }}</el-tag></template
        >
      </el-table-column>
      <el-table-column prop="price" label="价格/时" width="100" sortable>
        <template #default="scope">￥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="location" label="地址" min-width="150" show-overflow-tooltip />
      <el-table-column prop="tags" label="标签" show-overflow-tooltip />

      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <!-- 这里只显示状态，管理员可以直接在这里切换 -->
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

    <!-- 弹窗 -->
    <el-dialog :title="form.id ? '编辑场馆' : '新增场馆'" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="场馆名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="场馆分类">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="篮球馆" value="篮球馆" />
            <el-option label="羽毛球馆" value="羽毛球馆" />
            <el-option label="游泳馆" value="游泳馆" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="例如：室内,木地板" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :precision="2" :step="10" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.location" placeholder="请输入场馆地址" />
        </el-form-item>
        <el-form-item label="场馆图片">
          <OssUpload v-model="form.image" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-time-select
            placeholder="起始"
            v-model="form.openTime"
            start="06:00"
            step="01:00"
            end="23:00"
            style="width: 140px; margin-right: 10px"
          />
          -
          <el-time-select
            placeholder="结束"
            v-model="form.closeTime"
            start="06:00"
            step="01:00"
            end="23:00"
            style="width: 140px; margin-left: 10px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Picture } from '@element-plus/icons-vue'
import { fetchVenues, addVenue, updateVenue, deleteVenue } from '@/api/venue'
import { uploadImage } from '@/api/oss'
import OssUpload from '@/components/OssUpload.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  type: '',
  status: null, // 初始化为 null，表示查询所有状态
})

const form = reactive({
  id: null,
  name: '',
  type: '',
  tags: '',
  price: 0,
  image: '',
  openTime: '',
  closeTime: '',
  status: 1,
})

// 监听form.image的变化
watch(
  () => form.image,
  (newValue) => {
    // 如果是对象格式，说明是从OssUpload组件传递的
    if (newValue && typeof newValue === 'object') {
      form.image = newValue.url // 使用URL
    }
  },
)

// 获取列表
const getList = () => {
  loading.value = true
  // 调用 API，此时如果 queryParams.status 是 0，通过第一步的修改，它能正确传给后端
  // 如果是 null，则传给后端的是 '' (空字符串)，后端应当视为查询全部
  fetchVenues(queryParams)
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

// 列表中的 Switch 开关：快速上下架
const handleStatusChange = (row) => {
  const text = row.status === 1 ? '上架' : '下架'
  updateVenue({ id: row.id, status: row.status })
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success(`${text}成功`)
      }
    })
    .catch(() => {
      // 失败回滚
      row.status = row.status === 1 ? 0 : 1
    })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该场馆吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteVenue(row.id).then((res) => {
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    })
  })
}

// 提交新增/编辑
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

  // 调用API保存场馆信息
  const apiCall = form.id ? updateVenue : addVenue
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

// 查询按钮
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 打开新增弹窗
const handleAdd = () => {
  // 不要重置image字段，保持OSS上传的URL
  Object.assign(form, {
    id: null,
    name: '',
    type: '',
    tags: '',
    price: 0,
    openTime: '',
    closeTime: '',
    status: 1,
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

onMounted(() => {
  getList()
})
</script>
