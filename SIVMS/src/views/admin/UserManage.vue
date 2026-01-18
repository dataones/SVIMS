<template>
  <div class="user-manage">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><User /></el-icon>
        用户管理
      </h1>
      <p class="page-subtitle">管理系统中的所有用户账户</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-content">
          <div class="search-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名、邮箱或手机号"
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
              v-model="selectedRole"
              placeholder="用户角色"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="普通用户" value="0" />
              <el-option label="会员" value="1" />
              <el-option label="管理员" value="2" />
            </el-select>

            <el-select
              v-model="selectedStatus"
              placeholder="账户状态"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="正常" value="1" />
              <el-option label="禁用" value="0" />
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

    <!-- 用户列表 -->
    <div class="table-section">
      <el-card>
        <div class="table-header">
          <div class="table-title">
            <h3>用户列表</h3>
            <span class="total-count">共 {{ total }} 条记录</span>
          </div>
          <div class="table-actions">
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>

        <el-table :data="userList" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="40" :src="row.avatar" :icon="UserFilled" />
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="nickname">{{ row.nickname || '未设置昵称' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="邮箱" min-width="180" />

          <el-table-column prop="phone" label="手机号" min-width="120" />

          <el-table-column label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="getRoleTagType(row.role)">
                {{ getRoleText(row.role) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="注册时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-vertical">
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
                  <el-button
                    type="text"
                    size="small"
                    :class="row.status === 1 ? 'danger' : 'success'"
                    @click="handleToggleStatus(row)"
                  >
                    <el-icon><Switch /></el-icon>
                    {{ row.status === 1 ? '禁用' : '启用' }}
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" :disabled="dialogMode === 'view'" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" :disabled="dialogMode === 'view'" style="width: 100%">
            <el-option label="普通用户" :value="0" />
            <el-option label="会员" :value="1" />
            <el-option label="管理员" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status" :disabled="dialogMode === 'view'">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUserDialog = false">取消</el-button>
          <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSave">
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
  User,
  Search,
  Refresh,
  Download,
  UserFilled,
  View,
  Edit,
  Switch,
  Delete,
} from '@element-plus/icons-vue'
import { getUserList, updateUser, deleteUser, toggleUserStatus } from '@/api/userManage'

// 响应式数据
const loading = ref(false)
const userList = ref([])
const searchKeyword = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const showUserDialog = ref(false)
const dialogMode = ref('view') // view, edit
const dialogTitle = computed(() => {
  const titles = {
    edit: '编辑用户',
    view: '用户详情',
  }
  return titles[dialogMode.value]
})

// 表单数据
const userForm = reactive({
  id: null,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: 0,
  status: 1,
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }],
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      role: selectedRole.value ? Number(selectedRole.value) : undefined,
      status: selectedStatus.value ? Number(selectedStatus.value) : undefined,
    }

    const response = await getUserList(params)

    if (response.code === 200) {
      userList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
      userList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    userList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
  pagination.pageNum = 1
  fetchUserList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchUserList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchUserList()
}

// 获取角色标签类型
const getRoleTagType = (role) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'danger',
  }
  return types[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    0: '普通用户',
    1: '会员',
    2: '管理员',
  }
  return texts[role] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 查看用户
const handleView = (row) => {
  dialogMode.value = 'view'
  Object.assign(userForm, row)
  showUserDialog.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  Object.assign(userForm, row)
  showUserDialog.value = true
}

// 切换用户状态
const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const newStatus = row.status === 1 ? 0 : 1
    const response = await toggleUserStatus(row.id, newStatus)

    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchUserList()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}用户失败:`, error)
      ElMessage.error(`${action}用户失败`)
    }
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const response = await deleteUser(row.id)

    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchUserList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 保存用户
const handleSave = async () => {
  try {
    const response = await updateUser(userForm)

    if (response.code === 200) {
      ElMessage.success('保存成功')
      showUserDialog.value = false
      fetchUserList()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存用户失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    nickname: '',
    email: '',
    phone: '',
    role: 0,
    status: 1,
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-manage {
  padding: 24px;
  background: #f5f5f5;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-details {
    .username {
      font-weight: 600;
      color: #303133;
    }

    .nickname {
      font-size: 12px;
      color: #909399;
    }
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

.action-buttons-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;

  .button-row {
    display: flex;
    gap: 4px;
    width: 100%;

    .el-button {
      flex: 1;
      margin: 0;
      padding: 4px 8px;
      min-height: auto;
      line-height: 1.2;
      white-space: nowrap;

      .el-icon {
        margin-right: 2px;
      }
    }
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
