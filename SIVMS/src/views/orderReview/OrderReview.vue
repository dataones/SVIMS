<template>
  <div class="order-review-page">
    <h2>订单评价</h2>
    <p>订单号：{{ orderNo }}</p>

    <el-form :model="form" label-width="80px">
      <el-form-item label="评分">
        <el-rate v-model="form.rating" :max="5"></el-rate>
      </el-form-item>

      <el-form-item label="评价内容">
        <el-input
          type="textarea"
          v-model="form.content"
          placeholder="请输入评价内容"
          rows="4"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitReviewHandler">提交评价</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { submitReview } from '@/api/review' // 确认路径

const route = useRoute()
const router = useRouter()

// 从路由获取订单号
const orderNo = route.params.orderId

// 表单数据
const form = ref({
  rating: 5,
  content: '',
})

// 提交评价
const submitReviewHandler = async () => {
  if (!form.value.content) {
    ElMessage.warning('请填写评价内容')
    return
  }

  try {
    const res = await submitReview({
      orderNo,
      content: form.value.content,
      rating: form.value.rating,
    })

    if (res.code === 200) {
      ElMessage.success('评价提交成功！')
      router.push('/orderManagement') // 提交后返回订单列表
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络错误，提交失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.order-review-page {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
