<template>
  <div class="register-container">
    <!-- 全屏背景装饰元素 -->
    <div class="sport-background-elements">
      <div class="bg-element"><i class="el-icon-stadium"></i></div>
      <div class="bg-element"><i class="el-icon-basketball"></i></div>
      <div class="bg-element"><i class="el-icon-swimming"></i></div>
      <div class="bg-element"><i class="el-icon-gym"></i></div>
      <div class="bg-element"><i class="el-icon-tennis"></i></div>
    </div>

    <!-- 左侧装饰区 -->
    <div class="register-decor">
      <div class="sport-facilities">
        <div class="facility stadium">
          <i class="el-icon-stadium"></i>
          <span>标准体育场</span>
        </div>
        <div class="facility basketball">
          <i class="el-icon-basketball"></i>
          <span>篮球场地</span>
        </div>
        <div class="facility swimming">
          <i class="el-icon-swimming"></i>
          <span>游泳场馆</span>
        </div>
        <div class="facility gym">
          <i class="el-icon-gym"></i>
          <span>健身中心</span>
        </div>
      </div>

      <div class="decor-text">
        <h1>体育场馆综合管理系统</h1>
        <p>智慧管理 · 便捷预约 · 高效运营</p>
        <ul class="features">
          <li><i class="el-icon-check"></i> 场馆智能预约</li>
          <li><i class="el-icon-check"></i> 会员统一管理</li>
          <li><i class="el-icon-check"></i> 数据统计分析</li>
          <li><i class="el-icon-check"></i> 在线支付结算</li>
        </ul>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="register-form-container">
      <el-card class="register-card" shadow="always">
        <div class="form-header">
          <div class="logo">
            <i class="el-icon-user-filled"></i>
          </div>
          <h2>创建账户</h2>
          <p>注册成为体育场馆管理平台用户</p>
        </div>

        <el-steps :active="currentStep" align-center simple>
          <el-step title="基本信息" />
          <el-step title="账号设置" />
          <el-step title="完成注册" />
        </el-steps>

        <div class="form-content">
          <!-- 步骤1：基本信息 -->
          <div v-if="currentStep === 1" class="step step-1">
            <el-form :model="form" :rules="rules" ref="formStep1Ref" label-width="auto">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="form.username"
                  placeholder="请输入用户名（3-20位字母数字）"
                  size="large"
                  :prefix-icon="User"
                  clearable
                />
                <div class="hint">用于登录，建议使用英文和数字组合</div>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入手机号"
                  size="large"
                  :prefix-icon="Phone"
                  maxlength="11"
                  clearable
                >
                  <template #append>
                    <el-button
                      v-if="!smsCountdown"
                      :disabled="!isPhoneValid"
                      @click="sendSmsCode"
                      size="small"
                    >
                      发送验证码
                    </el-button>
                    <span v-else class="countdown">{{ smsCountdown }}s后重试</span>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="验证码" prop="smsCode">
                <el-input
                  v-model="form.smsCode"
                  placeholder="请输入短信验证码"
                  size="large"
                  :prefix-icon="Message"
                  maxlength="6"
                  clearable
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2：账号设置 -->
          <div v-else-if="currentStep === 2" class="step step-2">
            <el-form :model="form" :rules="rules" ref="formStep2Ref" label-width="auto">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码（至少8位）"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                />
                <div class="password-strength">
                  <div class="strength-bar" :class="passwordStrengthClass"></div>
                  <span class="strength-text">{{ passwordStrengthText }}</span>
                </div>
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱（可选）"
                  size="large"
                  :prefix-icon="Message"
                  clearable
                />
                <div class="hint">用于找回密码和接收通知</div>
              </el-form-item>

              <el-form-item label="用户类型" prop="userType">
                <el-radio-group v-model="form.userType">
                  <el-radio label="ordinary" border>普通用户</el-radio>
                  <el-radio label="venue_admin" border>场馆管理员</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div class="form-actions">
          <el-button
            v-if="currentStep < 3"
            type="primary"
            @click="nextStep"
            :loading="loading"
            class="next-btn"
          >
            {{ currentStep === 2 ? '立即注册' : '下一步' }}
          </el-button>

          <el-button v-if="currentStep === 3" type="primary" @click="goToLogin" class="login-btn">
            前往登录
          </el-button>
        </div>

        <div class="agreement">
          <el-checkbox v-model="agreementChecked"> 我已阅读并同意 </el-checkbox>
          <el-link type="primary" :underline="false">《用户服务协议》</el-link>
          和
          <el-link type="primary" :underline="false">《隐私政策》</el-link>
        </div>

        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="goToLogin" class="login-link-btn">
            立即登录
          </el-link>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import registerLogic from './register.js'
const {
  form,
  formStep1Ref,
  formStep2Ref,
  rules,
  loading,
  currentStep,
  smsCountdown,
  agreementChecked,
  passwordStrengthClass,
  passwordStrengthText,
  userTypeText,
  isPhoneValid,
  prevStep,
  nextStep,
  sendSmsCode,
  goToLogin,
} = registerLogic()
</script>

<style lang="scss" scoped>
@import './register.scss';
</style>
