<template>
  <div class="notice-list-page">
    <div class="page-header">
      <div class="header-content">
        <el-button type="text" @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">公告列表</h1>
      </div>
    </div>

    <div class="notice-container">
      <!-- 搜索筛选 -->
      <div class="filter-section">
        <el-card class="filter-card" shadow="never">
          <div class="filter-content">
            <div class="filter-left">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索公告标题或内容"
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

            <div class="filter-right">
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

      <!-- 公告列表 -->
      <div class="notice-list">
        <el-card v-if="loading" class="loading-card" shadow="never">
          <el-skeleton :rows="5" animated />
        </el-card>

        <div v-else-if="noticeList.length === 0" class="empty-state">
          <el-empty description="暂无公告" :image-size="200">
            <template #image>
              <el-icon size="200" color="#c0c4cc"><Document /></el-icon>
            </template>
            <el-button type="primary" @click="resetSearch"> 重置筛选条件 </el-button>
          </el-empty>
        </div>

        <div v-else class="notice-items">
          <div
            v-for="notice in noticeList"
            :key="notice.id"
            class="notice-item"
            :class="{ 'top-notice': notice.isTop }"
            @click="goToDetail(notice.id)"
          >
            <div class="item-header">
              <div class="item-title">
                <h3>{{ notice.title }}</h3>
                <div class="item-badges">
                  <el-tag v-if="notice.isTop" type="warning" size="small" effect="dark">
                    <el-icon><Star /></el-icon>
                    置顶
                  </el-tag>
                  <el-tag :type="getPriorityTagType(notice.priority)" size="small" effect="dark">
                    {{ getPriorityText(notice.priority) }}
                  </el-tag>
                </div>
              </div>
              <div class="item-time">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(notice.createTime) }}
              </div>
            </div>

            <div class="item-content">
              <p>{{ notice.content }}</p>
            </div>

            <div class="item-footer">
              <div class="item-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ notice.createBy || '管理员' }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ notice.readCount || 0 }} 次阅读
                </span>
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ notice.status === 1 ? '已发布' : '草稿' }}
                </span>
                <span v-if="notice.expireTime" class="meta-item">
                  <el-icon><Clock /></el-icon>
                  有效期至：{{ formatDate(notice.expireTime) }}
                </span>
                <span v-else class="meta-item">
                  <el-icon><Clock /></el-icon>
                  永久有效
                </span>
              </div>
              <el-button type="text" class="read-more">
                阅读全文
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Refresh,
  Star,
  Calendar,
  Clock,
  User,
  View,
  Document,
  ArrowRight,
} from '@element-plus/icons-vue'
import { getNoticeList } from '@/api/notice'

const router = useRouter()

const loading = ref(false)
const noticeList = ref([])
const searchKeyword = ref('')
const selectedPriority = ref('')

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 获取公告列表
const fetchNoticeList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: 1, // 只获取已发布的公告
      priority: selectedPriority.value ? Number(selectedPriority.value) : undefined,
    }

    const response = await getNoticeList(params)

    if (response.code === 200 && response.data) {
      noticeList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取公告列表失败')
      noticeList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败')
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

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/notice/${id}`)
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
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

// 生命周期
onMounted(() => {
  fetchNoticeList()
})
</script>

<style lang="scss" scoped>
.notice-list-page {
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
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;

    .filter-section {
      margin-bottom: 30px;

      .filter-card {
        border-radius: 12px;

        :deep(.el-card__body) {
          padding: 24px;
        }

        .filter-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;

          .filter-left {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;
          }

          .filter-right {
            display: flex;
            gap: 12px;
          }
        }
      }
    }

    .notice-list {
      .loading-card {
        border-radius: 12px;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
      }

      .notice-items {
        .notice-item {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e4e7ed;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            border-color: #4facfe;
          }

          &.top-notice {
            border-color: #e6a23c;
            background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);

            &:hover {
              border-color: #e6a23c;
              box-shadow: 0 8px 24px rgba(230, 162, 60, 0.2);
            }
          }

          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;

            .item-title {
              flex: 1;

              h3 {
                margin: 0 0 12px 0;
                font-size: 18px;
                font-weight: 600;
                color: #303133;
                line-height: 1.4;
              }

              .item-badges {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .el-tag {
                  font-size: 11px;
                  padding: 2px 8px;
                  height: auto;
                  line-height: 1.2;
                }
              }
            }

            .item-time {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              color: #909399;
              white-space: nowrap;
              margin-left: 16px;
            }
          }

          .item-content {
            margin-bottom: 16px;

            p {
              margin: 0;
              font-size: 14px;
              color: #606266;
              line-height: 1.6;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }

          .item-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;

            .item-meta {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;

              .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #909399;

                .el-icon {
                  font-size: 14px;
                }
              }
            }

            .read-more {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #409eff;
              font-size: 14px;
              font-weight: 500;

              &:hover {
                color: #66b1ff;
              }
            }
          }
        }
      }

      .pagination {
        display: flex;
        justify-content: center;
        margin-top: 40px;
      }
    }
  }
}

@media (max-width: 768px) {
  .notice-list-page {
    .page-header {
      .header-content {
        .page-title {
          font-size: 20px;
        }
      }
    }

    .notice-container {
      padding: 20px 16px;

      .filter-section {
        .filter-card {
          :deep(.el-card__body) {
            padding: 16px;
          }

          .filter-content {
            flex-direction: column;
            gap: 16px;

            .filter-left {
              width: 100%;
              flex-direction: column;
              gap: 12px;

              .el-input {
                width: 100% !important;
              }

              .el-select {
                width: 100% !important;
                margin-left: 0 !important;
              }
            }

            .filter-right {
              width: 100%;
              justify-content: space-between;
            }
          }
        }
      }

      .notice-list {
        .notice-items {
          .notice-item {
            padding: 16px;

            .item-header {
              flex-direction: column;
              gap: 12px;

              .item-title {
                .item-time {
                  margin-left: 0;
                  align-self: flex-start;
                }
              }
            }

            .item-footer {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;

              .item-meta {
                justify-content: center;
              }

              .read-more {
                align-self: center;
              }
            }
          }
        }
      }
    }
  }
}
</style>
