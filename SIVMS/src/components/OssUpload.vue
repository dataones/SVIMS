<template>
  <div class="oss-upload">
    <el-upload
      :action="uploadUrl"
      :on-change="handleFileChange"
      :on-success="handleSuccess"
      :on-error="handleError"
      :show-file-list="false"
      :limit="1"
      accept="image/*"
      :auto-upload="false"
    >
      <template #trigger>
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          选择图片
        </el-button>
      </template>

      <template #tip>
        <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
      </template>
    </el-upload>

    <!-- 图片预览 -->
    <div v-if="imageUrl" class="preview-container">
      <el-image
        :src="imageUrl"
        :preview-src-list="[imageUrl]"
        fit="cover"
        style="width: 100px; height: 100px"
      />
      <div class="preview-actions">
        <el-button type="danger" size="small" @click="removeImage">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const imageUrl = ref(props.modelValue)
const selectedFile = ref(null) // 添加选中的文件
const uploading = ref(false) // 添加上传状态

// 处理文件选择
const handleFileChange = (file, fileList) => {
  if (file && file.raw) {
    // 检查文件类型
    const isImage = file.raw.type.startsWith('image/')
    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return
    }

    // 检查文件大小 (2MB)
    const isLt2M = file.raw.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过2MB!')
      return
    }

    // 保存选中的文件供后续上传
    selectedFile.value = file.raw

    // 创建本地预览URL
    const localUrl = URL.createObjectURL(file.raw)
    imageUrl.value = localUrl
    emit('update:modelValue', localUrl)
  }
}

// 上传成功
const handleSuccess = (response) => {}

// 上传失败
const handleError = (error) => {}

// 删除图片
const removeImage = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    imageUrl.value = newValue
  },
)
</script>

<style scoped>
.oss-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-actions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style>
