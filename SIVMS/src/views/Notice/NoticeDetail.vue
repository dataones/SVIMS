<template>
  <div class="notice-detail-page">
    <div class="page-header">
      <div class="header-content">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">公告详情</h1>
      </div>
    </div>

    <div class="notice-container">
      <el-card v-if="notice" class="notice-card" shadow="hover">
        <!-- 公告头部 -->
        <div class="notice-header">
          <div class="notice-title-section">
            <h2 class="notice-title">{{ notice.title }}</h2>
            <div class="notice-badges">
              <el-tag v-if="notice.isTop" type="warning" effect="dark" size="small">
                <el-icon><Star /></el-icon>
                置顶
              </el-tag>
              <el-tag :type="getPriorityTagType(notice.priority)" effect="dark" size="small">
                {{ getPriorityText(notice.priority) }}
              </el-tag>
            </div>
          </div>

          <div class="notice-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ notice.createBy || '管理员' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(notice.createTime) }}</span>
            </div>
            <div class="meta-item" v-if="notice.expireTime">
              <el-icon><Clock /></el-icon>
              <span>有效期至：{{ formatDate(notice.expireTime) }}</span>
            </div>
            <div class="meta-item" v-else>
              <el-icon><Clock /></el-icon>
              <span>永久有效</span>
            </div>
            <div class="meta-item">
              <el-icon><View /></el-icon>
              <span>阅读量：{{ notice.readCount || 0 }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>状态：{{ notice.status === 1 ? '已发布' : '草稿' }}</span>
            </div>
          </div>
        </div>

        <!-- 公告内容 -->
        <div class="notice-content">
          <div class="content-wrapper" v-html="formatContent(notice.content)"></div>
        </div>

        <!-- 公告底部 -->
        <div class="notice-footer">
          <div class="footer-actions">
            <el-button @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回上一页
            </el-button>
            <el-button type="primary" @click="goToNoticeList">
              <el-icon><List /></el-icon>
              查看所有公告
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-container">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-content">
              <el-skeleton-item variant="h1" style="width: 60%; margin-bottom: 20px" />
              <el-skeleton-item
                variant="rect"
                style="width: 100%; height: 200px; margin-bottom: 20px"
              />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-container">
        <el-result icon="warning" title="公告不存在" sub-title="您要查看的公告可能已被删除或不存在">
          <template #extra>
            <el-button type="primary" @click="goToNoticeList"> 查看所有公告 </el-button>
            <el-button @click="goBack"> 返回上一页 </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Star,
  User,
  Calendar,
  Clock,
  View,
  List,
  Document,
} from '@element-plus/icons-vue'
import { getNoticeDetail, increaseReadCount } from '@/api/notice'

const route = useRoute()
const router = useRouter()

const notice = ref(null)
const loading = ref(true)

// 获取公告详情
const fetchNoticeDetail = async () => {
  try {
    loading.value = true
    const noticeId = route.params.id

    if (!noticeId) {
      ElMessage.error('公告ID不能为空')
      router.push('/')
      return
    }

    const response = await getNoticeDetail(noticeId)

    if (response.code === 200 && response.data) {
      notice.value = response.data

      // 增加阅读量
      try {
        await increaseReadCount(noticeId)
        // 更新本地显示的阅读量
        if (notice.value.readCount !== undefined) {
          notice.value.readCount++
        }
      } catch (readError) {
        console.warn('增加阅读量失败:', readError)
        // 不影响主要功能，继续显示
      }
    } else {
      ElMessage.error(response.message || '获取公告详情失败')
      notice.value = null
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
    notice.value = null
  } finally {
    loading.value = false
  }
}

// 格式化内容
const formatContent = (content) => {
  if (!content) return ''
  // 将换行符转换为HTML换行
  return content.replace(/\n/g, '<br>')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 跳转到公告列表
const goToNoticeList = () => {
  router.push('/notices')
}

// 生命周期
onMounted(() => {
  fetchNoticeDetail()
})
</script>

<style lang="scss" scoped>
.notice-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);

  .page-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 20px 0;
    position: sticky;
    top: 0;
    z-index: 100;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 20px;

      .back-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(64, 158, 255, 0.1);
          color: #409eff;
        }
      }

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .notice-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;

    .notice-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      :deep(.el-card__body) {
        padding: 40px;
      }
    }

    .notice-header {
      border-bottom: 1px solid #e4e7ed;
      padding-bottom: 30px;
      margin-bottom: 30px;

      .notice-title-section {
        margin-bottom: 20px;

        .notice-title {
          margin: 0 0 16px 0;
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          line-height: 1.4;
        }

        .notice-badges {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;

          .el-tag {
            font-size: 12px;
            padding: 4px 12px;
            height: auto;
            line-height: 1.2;
            border-radius: 20px;
          }
        }
      }

      .notice-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;

          .el-icon {
            font-size: 16px;
            color: #909399;
          }
        }
      }
    }

    .notice-content {
      margin-bottom: 40px;

      .content-wrapper {
        font-size: 16px;
        line-height: 1.8;
        color: #303133;
        white-space: pre-wrap;
        word-wrap: break-word;

        :deep(p) {
          margin: 16px 0;
          text-indent: 2em;
        }

        :deep(br) {
          margin: 8px 0;
        }
      }
    }

    .notice-footer {
      border-top: 1px solid #e4e7ed;
      padding-top: 30px;

      .footer-actions {
        display: flex;
        gap: 16px;
        justify-content: center;

        .el-button {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
        }
      }
    }
  }

  .loading-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;

    .skeleton-content {
      padding: 40px;
    }
  }

  .error-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .notice-detail-page {
    .page-header {
      .header-content {
        .page-title {
          font-size: 20px;
        }
      }
    }

    .notice-container {
      padding: 20px 16px;

      .notice-card {
        :deep(.el-card__body) {
          padding: 24px;
        }
      }

      .notice-header {
        .notice-title-section {
          .notice-title {
            font-size: 24px;
          }
        }

        .notice-meta {
          gap: 16px;

          .meta-item {
            font-size: 13px;
          }
        }
      }

      .notice-content {
        .content-wrapper {
          font-size: 15px;
        }
      }

      .notice-footer {
        .footer-actions {
          flex-direction: column;
          align-items: stretch;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
