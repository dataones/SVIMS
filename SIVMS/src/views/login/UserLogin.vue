<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <!-- login/index.vue 中的装饰部分 -->
     <div class="sport-background-elements">
      <div class="bg-element"><i class="el-icon-stadium"></i></div>
      <div class="bg-element"><i class="el-icon-basketball"></i></div>
      <div class="bg-element"><i class="el-icon-swimming"></i></div>
    </div>
<div class="login-decor">
  <div class="sport-icons">
    <div class="icon basketball"><i class="el-icon-basketball"></i></div>
    <div class="icon football"><i class="el-icon-football"></i></div>
    <div class="icon swimming"><i class="el-icon-swimming"></i></div>
    <div class="icon tennis"><i class="el-icon-tennis"></i></div>
  </div>
  <div class="decor-text">
    <h1>体育场馆综合管理系统</h1>
    <p>智慧管理 · 便捷预约 · 高效运营</p>
  </div>
</div>

    <!-- 右侧登录表单 -->
    <div class="login-form-container">
      <el-card class="login-card" shadow="always">
        <div class="form-header">
          <div class="logo">
            <i class="el-icon-stadium"></i>
          </div>
          <h2>用户登录</h2>
          <p>欢迎回来，请登录您的账号</p>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              size="large"
              class="login-btn"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>

          <div class="divider">
            <span>其他登录方式</span>
          </div>

          <div class="social-login">
            <el-button circle class="social-btn wechat">
              <i class="el-icon-wechat"></i>
            </el-button>
            <el-button circle class="social-btn alipay">
              <i class="el-icon-alipay"></i>
            </el-button>
            <el-button circle class="social-btn phone">
              <i class="el-icon-phone"></i>
            </el-button>
          </div>

          <div class="register-link">
            <span>还没有账号？</span>
            <el-link
              type="primary"
              :underline="false"
              @click="handleRegister"
              class="register-btn"
            >
              立即注册
            </el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import loginLogic from './login.js'
const { form, formRef, rules, loading, rememberMe, handleLogin, handleRegister } = loginLogic()
</script>

<style lang="scss">
/* 使用 @use 替代 @import */
@use './login.scss';

</style>
