<template>
  <div class="resource-manage-container">
    <el-card shadow="never">
      <!-- 顶部标签栏 -->
      <el-tabs v-model="activeTab" @tab-click="handleClick">

        <!-- 标签1：场馆管理 -->
        <el-tab-pane label="场馆管理" name="venue">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Location /></el-icon>
              <span> 场馆管理</span>
            </span>
          </template>
          <!-- 引入场馆组件 -->
          <VenueManage />
        </el-tab-pane>

        <!-- 标签2：器材管理 -->
        <el-tab-pane label="器材管理" name="equipment">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Basketball /></el-icon>
              <span> 器材管理</span>
            </span>
          </template>
          <!-- 引入器材组件 -->
          <EquipmentManage />
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Location, Basketball } from '@element-plus/icons-vue' // 引入图标

// 引入你之前写好的两个组件
// 请根据你的实际文件路径调整 import 路径
import VenueManage from './VenueManage.vue'
import EquipmentManage from './EquipmentManage.vue'

// 默认激活的标签页
const activeTab = ref('venue')

// 切换标签时的回调（如有需要可以在这里处理逻辑，比如刷新数据）
const handleClick = (tab, event) => {
  console.log('切换到了:', tab.props.name)
}
</script>

<style scoped>
.resource-manage-container {
  padding: 20px;
}

/* 调整图标和文字的间距 */
.custom-tabs-label .el-icon {
  vertical-align: middle;
}
.custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
</style>
