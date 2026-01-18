<template>
  <div class="approval-page">
    <HeaderNav />

    <div class="approval-container">
      <div class="page-header">
        <h2 class="title"><i class="el-icon-s-check"></i> 审批管理</h2>
        <p class="subtitle">处理用户的场馆预约和器材借用申请</p>
      </div>

      <div class="approval-content">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <!-- 场馆预约 Tab -->
          <el-tab-pane name="booking">
            <template #label>
              <span><i class="el-icon-location-information"></i> 场馆预约</span>
              <el-badge
                :value="bookingList.length"
                class="tab-badge"
                v-if="bookingList.length > 0"
              />
            </template>

            <el-table :data="bookingList" v-loading="loading" stripe style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column label="申请人" width="150">
                <template #default="scope">
                  <div>{{ scope.row.nickname || scope.row.username }}</div>
                  <div class="sub-text">{{ scope.row.username }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="venueName" label="预约场馆" min-width="150" />
              <el-table-column label="预约时间" width="220">
                <template #default="scope">
                  <div>{{ formatDate(scope.row.date) }}</div>
                  <div class="time-slot">{{ scope.row.startTime }} - {{ scope.row.endTime }}</div>
                </template>
              </el-table-column>
              <el-table-column label="费用" width="120">
                <template #default="scope">
                  <span class="price">¥{{ scope.row.totalPrice }}</span>
                </template>
              </el-table-column>
              <el-table-column label="提交时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    type="success"
                    size="small"
                    @click="handleAudit('booking', scope.row.id, true)"
                  >
                    通过
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleAudit('booking', scope.row.id, false)"
                  >
                    驳回
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!loading && bookingList.length === 0" description="暂无待审批的预约" />
          </el-tab-pane>

          <!-- 器材借用 Tab -->
          <el-tab-pane name="rental">
            <template #label>
              <span><i class="el-icon-basketball"></i> 器材借用</span>
              <el-badge :value="rentalList.length" class="tab-badge" v-if="rentalList.length > 0" />
            </template>

            <el-table :data="rentalList" v-loading="loading" stripe style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column label="申请人" width="150">
                <template #default="scope">
                  <div>{{ scope.row.nickname || scope.row.username }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="equipmentName" label="借用器材" min-width="150" />
              <el-table-column prop="count" label="数量" width="100" />
              <el-table-column label="总费用" width="120">
                <template #default="scope">
                  <span class="price">¥{{ scope.row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column label="提交时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    type="success"
                    size="small"
                    @click="handleAudit('rental', scope.row.id, true)"
                  >
                    批准借出
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleAudit('rental', scope.row.id, false)"
                  >
                    驳回
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!loading && rentalList.length === 0" description="暂无待审批的借用" />
          </el-tab-pane>

          <!-- 退款审核 Tab -->
          <el-tab-pane name="refund">
            <template #label>
              <span><i class="el-icon-money"></i> 退款审核</span>
              <el-badge :value="refundList.length" class="tab-badge" v-if="refundList.length > 0" />
            </template>

            <el-table :data="refundList" v-loading="loading" stripe style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column label="申请人" width="150">
                <template #default="scope">
                  <div>{{ scope.row.nickname || scope.row.username }}</div>
                  <div class="sub-text">{{ scope.row.username }}</div>
                </template>
              </el-table-column>
              <el-table-column label="订单类型" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.orderType === 1 ? 'warning' : 'primary'" size="small">
                    {{ scope.row.orderType === 1 ? '器材订单' : '场馆订单' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="退款金额" width="120">
                <template #default="scope">
                  <span class="price">¥{{ scope.row.refundAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="退款原因" min-width="150">
                <template #default="scope">
                  <div>{{ scope.row.reason }}</div>
                  <div v-if="scope.row.remark" class="sub-text">{{ scope.row.remark }}</div>
                </template>
              </el-table-column>
              <el-table-column label="申请时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    type="success"
                    size="small"
                    @click="handleRefundAudit(scope.row.id, true)"
                  >
                    批准退款
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleRefundAudit(scope.row.id, false)"
                  >
                    驳回申请
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty
              v-if="!loading && refundList.length === 0"
              description="暂无待审核的退款申请"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
  <div>
    <!-- 底部信息 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3><i class="el-icon-s-opportunity"></i> 体育场馆综合管理系统</h3>
          <p>智慧管理 · 便捷预约 · 高效运营</p>
          <p>为您提供最优质的体育场馆服务体验</p>
        </div>
        <div class="footer-section">
          <h4>服务支持</h4>
          <ul>
            <li><el-link :underline="false">使用帮助</el-link></li>
            <li><el-link :underline="false">常见问题</el-link></li>
            <li><el-link :underline="false">联系我们</el-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li><el-link :underline="false">平台介绍</el-link></li>
            <li><el-link :underline="false">服务条款</el-link></li>
            <li><el-link :underline="false">隐私政策</el-link></li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        © 2025 体育场馆综合管理系统. All rights reserved.
        <div>
          <img
            src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
            alt="渝公网安备"
            style="width: 20px; height: 20px; margin-right: 5px"
          />
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch"
            target="_blank"
            style="color: aliceblue"
          >
            渝公网安备50024002000227号</a
          ><span> · </span>
          <a href="https://beian.miit.gov.cn/" target="_blank" style="color: aliceblue"
            >渝ICP备2025076592号-6</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HeaderNav from '../Home/components/HeaderNav/HeaderNav.vue'
import { getPendingBookings, getPendingRentals } from '@/api/approval'
import { approveRental, rejectRental } from '@/api/equipment'
import { auditBooking } from '@/api/booking'
import request from '@/api/request'

export default {
  name: 'ApprovalPage',
  components: {
    HeaderNav,
  },
  setup() {
    const activeTab = ref('booking')
    const loading = ref(false)
    const bookingList = ref([])
    const rentalList = ref([])
    const refundList = ref([])

    // 获取数据
    const fetchData = async () => {
      loading.value = true
      try {
        if (activeTab.value === 'booking') {
          const res = await getPendingBookings()
          if (res.code === 200) bookingList.value = res.data || []
        } else if (activeTab.value === 'rental') {
          const res = await getPendingRentals()
          if (res.code === 200) rentalList.value = res.data || []
        } else if (activeTab.value === 'refund') {
          const res = await getPendingRefunds()
          if (res.code === 200) refundList.value = res.data || []
        }
      } catch (error) {
        console.error('获取审批列表失败', error)
        ElMessage.error('获取审批列表失败')
      } finally {
        loading.value = false
      }
    }

    // 切换 Tab 时重新加载
    const handleTabClick = () => {
      fetchData()
    }

    // 审核操作
    const handleAudit = (type, id, pass) => {
      const actionText = pass ? '通过' : '驳回'
      const itemType = type === 'booking' ? '预约' : '借用'

      ElMessageBox.confirm(`确定要${actionText}这条${itemType}申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: pass ? 'success' : 'warning',
      })
        .then(async () => {
          loading.value = true
          try {
            let res

            if (type === 'rental') {
              // 器材借用：调用你已经实现好的接口
              res = pass ? await approveRental(id) : await rejectRental(id)
            } else if (type === 'booking') {
              // 场馆预约：调用审核接口
              res = pass ? await auditBooking(id, 1, '') : await auditBooking(id, 2, '')
            }

            if (res && res.code === 200) {
              ElMessage.success('操作成功')
              // 刷新当前 Tab 列表
              await fetchData()

              // 如果希望两个 Tab 的数量都实时更新，可以顺便刷新另一个列表
              if (type === 'booking') {
                const rentalRes = await getPendingRentals()
                if (rentalRes.code === 200) rentalList.value = rentalRes.data || []
              } else {
                const bookingRes = await getPendingBookings()
                if (bookingRes.code === 200) bookingList.value = bookingRes.data || []
              }
            } else if (res) {
              ElMessage.error(res.msg || '操作失败')
            }
          } catch (error) {
            console.error('审核失败', error)
            ElMessage.error('网络错误，操作失败')
          } finally {
            loading.value = false
          }
        })
        .catch(() => {
          // 用户取消，不做处理
        })
    }

    // 退款审核操作
    const handleRefundAudit = (id, pass) => {
      const actionText = pass ? '批准' : '驳回'

      ElMessageBox.confirm(`确定要${actionText}这条退款申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: pass ? 'success' : 'warning',
      })
        .then(async () => {
          loading.value = true
          try {
            const res = await request({
              url: `/api/refund/audit/${id}`,
              method: 'put',
              data: {
                approved: pass,
                auditRemark: '',
              },
            })

            if (res && res.code === 200) {
              ElMessage.success('操作成功')
              // 刷新退款列表
              await fetchData()
            } else if (res) {
              ElMessage.error(res.msg || '操作失败')
            }
          } catch (error) {
            console.error('退款审核失败', error)
            ElMessage.error('网络错误，操作失败')
          } finally {
            loading.value = false
          }
        })
        .catch(() => {
          // 用户取消，不做处理
        })
    }

    // 获取待审核退款列表
    const getPendingRefunds = () => {
      return request({
        url: '/api/admin/approval/refunds',
        method: 'get',
      })
    }

    // 时间格式化
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString()
    }

    const formatDateTime = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleString()
    }

    onMounted(() => {
      // 初始加载所有列表，用于展示 Badge 数量
      getPendingBookings().then((res) => {
        if (res.code === 200) bookingList.value = res.data || []
      })
      getPendingRentals().then((res) => {
        if (res.code === 200) rentalList.value = res.data || []
      })
      getPendingRefunds().then((res) => {
        if (res.code === 200) refundList.value = res.data || []
      })
    })

    return {
      activeTab,
      loading,
      bookingList,
      rentalList,
      refundList,
      handleTabClick,
      handleAudit,
      handleRefundAudit,
      formatDate,
      formatDateTime,
    }
  },
}
</script>

<style scoped lang="scss">
.approval-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.approval-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 25px;
  .title {
    font-size: 26px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    i {
      color: #667eea;
    }
  }
  .subtitle {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.approval-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    background: #f5f7fa;
  }

  :deep(.el-tabs__content) {
    padding: 20px;
  }
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.time-slot {
  font-weight: 600;
  color: #409eff;
}

.price {
  font-weight: 700;
  color: #f56c6c;
}

.tab-badge {
  margin-left: 5px;
  margin-top: -2px;
  :deep(.el-badge__content) {
    border: none;
  }
}
</style>

<style lang="scss" scoped>
.home-footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 60px 20px 30px;
  margin-top: 80px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;

    .footer-section {
      h3 {
        color: #4facfe;
        margin-bottom: 15px;
        font-size: 1.3rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;

        i {
          font-size: 1.5rem;
        }
      }

      h4 {
        color: #4facfe;
        margin-bottom: 20px;
        font-size: 1.2rem;
        font-weight: 600;
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 2px;
        }
      }

      p {
        color: #cbd5e1;
        font-size: 0.9rem;
        margin-bottom: 10px;
        line-height: 1.6;

        &:first-of-type {
          color: #94a3b8;
          font-weight: 500;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .el-link {
            color: #cbd5e1;
            transition: all 0.3s ease;

            &:hover {
              color: #4facfe;
              padding-left: 5px;
            }
          }
        }
      }
    }
  }

  .copyright {
    max-width: 1200px;
    margin: 50px auto 0;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
  }
}
</style>
