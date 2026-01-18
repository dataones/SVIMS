<template>
  <div class="fault-report">
    <div class="header">
      <h2>故障申报</h2>
      <p>请详细描述您发现的设施故障，我们将尽快处理</p>
    </div>

    <el-form
      ref="faultFormRef"
      :model="faultForm"
      :rules="faultRules"
      label-width="120px"
      class="fault-form"
    >
      <el-form-item label="场馆" prop="venueId">
        <el-select
          v-model="faultForm.venueId"
          placeholder="请选择场馆"
          style="width: 100%"
          @change="onVenueChange"
        >
          <el-option
            v-for="venue in venues"
            :key="venue.id"
            :label="venue.name"
            :value="venue.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="故障标题" prop="title">
        <el-input
          v-model="faultForm.title"
          placeholder="请输入故障标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="故障类型" prop="faultType">
        <el-select v-model="faultForm.faultType" placeholder="请选择故障类型" style="width: 100%">
          <el-option label="照明设备" value="照明设备" />
          <el-option label="运动器材" value="运动器材" />
          <el-option label="场地设施" value="场地设施" />
          <el-option label="水电设施" value="水电设施" />
          <el-option label="安全设施" value="安全设施" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <el-form-item label="故障位置" prop="location">
        <el-input
          v-model="faultForm.location"
          placeholder="请描述具体的故障位置"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="故障设施" prop="facilityId">
        <el-select
          v-model="faultForm.facilityId"
          placeholder="请选择故障设施（可选）"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="facility in facilities"
            :key="facility.id"
            :label="facility.name"
            :value="facility.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="紧急程度" prop="urgency">
        <el-radio-group v-model="faultForm.urgency">
          <el-radio label="LOW">低</el-radio>
          <el-radio label="MEDIUM">中</el-radio>
          <el-radio label="HIGH">高</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="故障详情" prop="content">
        <el-input
          v-model="faultForm.content"
          type="textarea"
          :rows="4"
          placeholder="请详细描述故障情况，包括具体表现和影响范围"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="联系方式" prop="contactPhone">
        <el-input
          v-model="faultForm.contactPhone"
          placeholder="请输入您的联系电话"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="期望修复时间">
        <el-date-picker
          v-model="faultForm.expectedTime"
          type="datetime"
          placeholder="请选择期望的修复时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="故障图片">
        <el-upload
          class="image-uploader"
          action="#"
          :show-file-list="true"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-change="handleImageChange"
          :before-upload="beforeUpload"
          :auto-upload="false"
          list-type="picture-card"
          :limit="5"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="备注信息">
        <el-input
          v-model="faultForm.remark"
          type="textarea"
          :rows="2"
          placeholder="其他需要说明的信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitFault" :loading="submitting"> 提交申报 </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览">
      <img w-full :src="previewImage" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { reportFault, getFacilityList } from '@/api/facility'
import { fetchVenues } from '@/api/venue'

// 响应式数据
const faultFormRef = ref()
const submitting = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const venues = ref([])
const facilities = ref([])

// 表单数据
const faultForm = reactive({
  venueId: null,
  facilityId: null,
  faultType: '',
  title: '',
  location: '',
  urgency: 'MEDIUM',
  content: '',
  contactPhone: '',
  expectedTime: '',
  images: [],
  remark: '',
})

// 表单验证规则
const faultRules = {
  venueId: [{ required: true, message: '请选择场馆', trigger: 'change' }],
  title: [
    { required: true, message: '请输入故障标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  location: [
    { required: true, message: '请输入故障位置', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  content: [
    { required: true, message: '请输入故障详情', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' },
  ],
  contactPhone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
}

// 获取场馆列表
const loadVenues = async () => {
  try {
    const response = await fetchVenues({
      pageNum: 1,
      pageSize: 100, // 获取所有场馆
      status: 1, // 只获取正常状态的场馆
    })
    venues.value = response.data?.records || response.data || []
    console.log('场馆数据:', venues.value)
  } catch (error) {
    console.error('获取场馆列表失败:', error)
    ElMessage.error('获取场馆列表失败')
  }
}

// 场馆变更时获取设施列表
const onVenueChange = async (venueId) => {
  if (venueId) {
    try {
      const response = await getFacilityList({ venueId })
      facilities.value = response.data || []
      // 清空已选择的设施
      faultForm.facilityId = null
    } catch (error) {
      console.error('获取设施列表失败:', error)
      ElMessage.error('获取设施列表失败')
    }
  }
}

// 图片上传相关方法
const handlePictureCardPreview = (file) => {
  previewImage.value = file.url
  previewVisible.value = true
}

const handleRemove = (file, fileList) => {
  faultForm.images = fileList.map((item) => item.url || item.response?.url)
}

const handleImageChange = (file, fileList) => {
  // 这里只是暂存文件，实际上传在提交时进行
  console.log('文件变更:', file, fileList)
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

// 提交故障申报
const submitFault = async () => {
  if (!faultFormRef.value) return

  try {
    await faultFormRef.value.validate()

    submitting.value = true

    // 构建提交数据
    const submitData = {
      ...faultForm,
      images: faultForm.images.filter((img) => img), // 过滤空值
    }

    await reportFault(submitData)
    ElMessage.success('故障申报提交成功！')
    resetForm()
  } catch (error) {
    console.error('提交故障申报失败:', error)
    ElMessage.error(error.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (faultFormRef.value) {
    faultFormRef.value.resetFields()
  }
  faultForm.images = []
}

// 页面加载时获取数据
onMounted(() => {
  loadVenues()
})
</script>

<style scoped>
.fault-report {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.header p {
  color: #606266;
  font-size: 14px;
}

.fault-form {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.image-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.image-uploader .el-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
</style>
