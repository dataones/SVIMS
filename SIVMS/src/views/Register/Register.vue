<template>
  <div class="register-container">
    <!-- 全屏背景装饰元素 -->
    <div class="sport-background-elements">
      <div class="bg-element">
        <el-icon><House /></el-icon>
      </div>
      <div class="bg-element">
        <el-icon><Star /></el-icon>
      </div>
      <div class="bg-element">
        <el-icon><Message /></el-icon>
      </div>
      <div class="bg-element">
        <el-icon><CircleCheck /></el-icon>
      </div>
      <div class="bg-element">
        <el-icon><Check /></el-icon>
      </div>
    </div>

    <!-- 左侧装饰区 -->
    <div class="register-decor">
      <div class="sport-facilities">
        <div class="facility stadium">
          <el-icon><House /></el-icon>
          <span>标准体育场</span>
        </div>
        <div class="facility basketball">
          <el-icon><Star /></el-icon>
          <span>篮球场地</span>
        </div>
        <div class="facility swimming">
          <el-icon><Message /></el-icon>
          <span>游泳场馆</span>
        </div>
        <div class="facility gym">
          <el-icon><CircleCheck /></el-icon>
          <span>健身中心</span>
        </div>
      </div>

      <div class="decor-text">
        <h1>体育场馆综合管理系统</h1>
        <p>智慧管理 · 便捷预约 · 高效运营</p>
        <ul class="features">
          <li>
            <el-icon><Check /></el-icon> 场馆智能预约
          </li>
          <li>
            <el-icon><Check /></el-icon> 会员统一管理
          </li>
          <li>
            <el-icon><Check /></el-icon> 数据统计分析
          </li>
          <li>
            <el-icon><Check /></el-icon> 在线支付结算
          </li>
        </ul>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="register-form-container">
      <el-card class="register-card" shadow="always">
        <div class="form-header">
          <div class="logo">
            <el-icon><User /></el-icon>
          </div>
          <h2>创建账户</h2>
          <p>加入体育场馆管理平台，开启智能预约体验</p>
        </div>

        <el-steps :active="currentStep" align-center simple class="register-steps">
          <el-step title="基本信息" />
          <el-step title="账号设置" />
          <el-step title="完成注册" />
        </el-steps>

        <div class="form-content">
          <!-- 步骤1：基本信息 -->
          <div v-if="currentStep === 1" class="step step-1">
            <el-form
              :model="form"
              :rules="rules"
              ref="formStep1Ref"
              label-width="auto"
              class="register-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="form.username"
                  placeholder="请输入用户名（3-20位字母数字）"
                  size="default"
                  :prefix-icon="User"
                  clearable
                  class="modern-input"
                />
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入手机号"
                  size="default"
                  :prefix-icon="Phone"
                  maxlength="11"
                  inputmode="numeric"
                  clearable
                  @input="handlePhoneInput"
                  @paste="handlePhonePaste"
                  @keydown="handlePhoneKeydown"
                  @compositionend="handlePhoneCompositionEnd"
                  class="phone-input modern-input"
                >
                  <template #append>
                    <el-button
                      v-if="!smsCountdown"
                      :disabled="!isPhoneValid"
                      @click="sendSmsCode"
                      size="small"
                      class="sms-btn"
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
                  placeholder="请输入6位验证码"
                  size="default"
                  :prefix-icon="Message"
                  maxlength="6"
                  clearable
                  class="modern-input"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2：账号设置 -->
          <div v-else-if="currentStep === 2" class="step step-2">
            <el-form
              :model="form"
              :rules="rules"
              ref="formStep2Ref"
              label-width="auto"
              class="register-form"
            >
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码（至少8位）"
                  size="default"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                  class="modern-input"
                  @input="handlePasswordInput"
                />
                <div v-if="form.password" class="password-strength">
                  <div class="strength-bar" :class="passwordStrengthClass"></div>
                </div>
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="default"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                  class="modern-input"
                  @input="handleConfirmPasswordInput"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱（可选）"
                  size="default"
                  :prefix-icon="Message"
                  clearable
                  @input="handleEmailInput"
                  class="modern-input"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3：完成注册 -->
          <div v-else-if="currentStep === 3" class="step step-3">
            <div class="success-content">
              <div class="success-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <h3>注册成功！</h3>
              <p>您的账户已创建完成，现在可以开始使用体育场馆管理系统了。</p>
              <div class="success-actions">
                <el-button type="primary" size="default" @click="goToLogin" class="login-btn">
                  立即登录
                </el-button>
                <el-button size="default" @click="goToHome" class="home-btn"> 返回首页 </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions" v-if="currentStep < 3">
          <el-button v-if="currentStep > 1" @click="prevStep" size="default" class="prev-btn">
            上一步
          </el-button>
          <el-button
            type="primary"
            @click="nextStep"
            :loading="loading"
            size="default"
            class="next-btn"
          >
            {{ currentStep === 2 ? '立即注册' : '下一步' }}
          </el-button>
        </div>

        <div class="agreement" v-if="currentStep < 3">
          <el-checkbox v-model="agreementChecked" size="small"> 我已阅读并同意 </el-checkbox>
          <el-link type="primary" :underline="false" size="small">《用户服务协议》</el-link>
          和
          <el-link type="primary" :underline="false" size="small">《隐私政策》</el-link>
        </div>

        <div class="login-link" v-if="currentStep < 3">
          <span>已有账号？</span>
          <el-link
            type="primary"
            :underline="false"
            @click="goToLogin"
            class="login-link-btn"
            size="small"
          >
            立即登录
          </el-link>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Lock,
  House,
  Star,
  CircleCheck,
  Check,
  Message,
  Phone,
  InfoFilled,
} from '@element-plus/icons-vue'
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
  isPhoneValid,
  prevStep,
  nextStep,
  sendSmsCode,
  goToLogin,
  goToHome,
} = registerLogic()
</script>

<style lang="scss" scoped>
@use './register.scss';
</style>
