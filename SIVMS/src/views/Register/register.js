import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, sendSms } from '@/api/auth'
import { User, Phone, Message, Lock } from '@element-plus/icons-vue'

export default function useRegister() {
  const router = useRouter()
  const loading = ref(false)
  const formStep1Ref = ref()
  const formStep2Ref = ref()
  const currentStep = ref(1)
  const smsCountdown = ref(0)
  const agreementChecked = ref(false)

  const form = reactive({
    username: '',
    phone: '',
    smsCode: '',
    password: '',
    confirmPassword: '', // ✅ 确保有这个字段
    email: '',
    userType: 'ordinary',
  })

  // 手机号是否有效
  const isPhoneValid = computed(() => {
    return /^1[3-9]\d{9}$/.test(form.phone)
  })

  // 密码强度计算
  const passwordStrength = computed(() => {
    const password = form.password
    if (!password) return 0

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    return Math.min(strength, 5)
  })

  const passwordStrengthClass = computed(() => {
    const strength = passwordStrength.value
    if (strength <= 2) return 'weak'
    if (strength <= 3) return 'medium'
    return 'strong'
  })

  // const passwordStrengthText = computed(() => {
  //   const strength = passwordStrength.value
  //   if (strength <= 2) return '密码强度：弱'
  //   if (strength <= 3) return '密码强度：中'
  //   return '密码强度：强'
  // })

  // 用户类型显示文本
  // const userTypeText = computed(() => {
  //   const typeMap = {
  //     ordinary: '普通用户',
  //     venue_admin: '场馆管理员',
  //   }
  //   return typeMap[form.userType] || '普通用户'
  // })

  // 处理密码输入，禁止中文
  const handlePasswordInput = (value) => {
    // 过滤掉中文字符和空白字符（包括空格、制表符等）
    const filteredValue = value.replace(/[\u4e00-\u9fa5]|\s+/g, '')
    // 直接写回，保证无效字符被移除
    form.password = filteredValue
  }

  // 处理确认密码输入，禁止中文
  const handleConfirmPasswordInput = (value) => {
    // 过滤掉中文字符和空白字符（包括空格、制表符等）
    const filteredValue = value.replace(/[\u4e00-\u9fa5]|\s+/g, '')
    form.confirmPassword = filteredValue
  }

  // 处理手机号输入：移除非数字字符并限制最大长度为11位
  const handlePhoneInput = (value) => {
    const digits = String(value).replace(/\D+/g, '').slice(0, 11)
    form.phone = digits
  }

  // 处理粘贴到手机号输入框的内容：仅保留数字并限制长度
  const handlePhonePaste = (event) => {
    if (!event) return
    try {
      event.preventDefault && event.preventDefault()
      const paste = (event.clipboardData || window.clipboardData).getData('text') || ''
      const digits = String(paste).replace(/\D+/g, '').slice(0, 11)
      // 将粘贴的数字合并到当前值并截断到11位
      const combined = (String(form.phone || '') + digits).replace(/\D+/g, '').slice(0, 11)
      form.phone = combined
    } catch (e) {
      // 兜底：如果事件结构不标准，尝试从 window 剪贴板读取
      try {
        const pasteFallback = (window.clipboardData && window.clipboardData.getData('Text')) || ''
        form.phone = String(pasteFallback).replace(/\D+/g, '').slice(0, 11)
      } catch (err) {
        // ignore
      }
    }
  }

  // 处理 compositionend（输入法输入结束）场景，确保最终值合规
  const handlePhoneCompositionEnd = (event) => {
    try {
      const val = event?.target?.value ?? form.phone
      handlePhoneInput(val)
    } catch (e) {
      // ignore
    }
  }

  // 监听 form.phone，任何场景下（粘贴、拖拽、输入法等）都进行清理，作为兜底
  watch(
    () => form.phone,
    (val) => {
      const digits = String(val || '')
        .replace(/\D+/g, '')
        .slice(0, 11)
      if (digits !== val) {
        form.phone = digits
      }
    },
  )

  // 键盘拦截：阻止非数字按键输入（保留控制键、导航键、组合键）
  const handlePhoneKeydown = (event) => {
    if (!event) return
    const key = event.key
    // 允许的控制和导航键
    const allowed = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
      'Enter',
      'Home',
      'End',
    ]
    if (allowed.includes(key)) return
    // 允许组合键（Ctrl/Cmd + ...）用于复制粘贴等
    if (event.ctrlKey || event.metaKey) return
    // 如果是单字符按键且不是数字，则阻止输入
    if (key.length === 1 && !/^[0-9]$/.test(key)) {
      event.preventDefault()
    }
    // 如果输入长度已达11并且按下的是数字，也阻止
    if (/^[0-9]$/.test(key) && String(form.phone || '').length >= 11) {
      event.preventDefault()
    }
  }

  // 处理邮箱输入：去除空白并转为小写
  const handleEmailInput = (value) => {
    const cleaned = String(value).trim().replace(/\s+/g, '').toLowerCase()
    form.email = cleaned
  }

  // 验证规则
  const validateUsername = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入用户名'))
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      callback(new Error('用户名必须是3-20位的字母、数字或下划线'))
    } else {
      callback()
    }
  }

  const validatePassword = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入密码'))
    } else if (value.length < 8) {
      callback(new Error('密码长度至少8位'))
    } else {
      callback()
    }
  }

  const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请确认密码'))
    } else if (value !== form.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  const validatePhone = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('手机号格式不正确'))
    } else {
      callback()
    }
  }

  const validateEmail = (rule, value, callback) => {
    if (value && !/^\S+@\S+\.\S+$/.test(value)) {
      callback(new Error('邮箱格式不正确'))
    } else {
      callback()
    }
  }

  const validateSmsCode = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入验证码'))
    } else if (!/^\d{6}$/.test(value)) {
      callback(new Error('验证码必须是6位数字'))
    } else {
      callback()
    }
  }

  const rules = {
    username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    smsCode: [{ required: true, validator: validateSmsCode, trigger: 'blur' }],
    password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  }

  // 发送短信验证码
  const sendSmsCode = async () => {
    if (!isPhoneValid.value) {
      ElMessage.warning('请输入正确的手机号')
      return
    }

    try {
      loading.value = true
      const res = await sendSms({ phone: form.phone })
      if (res.code === 200) {
        ElMessage.success('验证码发送成功')
        startCountdown()
      } else {
        ElMessage.error(res.msg || '验证码发送失败')
      }
    } catch (err) {
      ElMessage.error(err.response?.data?.msg || '验证码发送失败')
    } finally {
      loading.value = false
    }
  }

  // 倒计时
  const startCountdown = () => {
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }

  // 上一步
  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  // ✅ 关键修复：修改nextStep函数，确保传递confirmPassword
  const nextStep = async () => {
    if (currentStep.value === 1) {
      // 验证第一步
      try {
        await formStep1Ref.value.validate()
        currentStep.value++
      } catch (err) {
        console.log('第一步验证失败', err)
      }
    } else if (currentStep.value === 2) {
      // 验证第二步
      try {
        await formStep2Ref.value.validate()

        // 检查用户协议
        if (!agreementChecked.value) {
          ElMessage.warning('请阅读并同意用户协议')
          return
        }

        loading.value = true

        // ✅ 关键修复：准备注册数据，包含confirmPassword
        const registerData = {
          username: form.username,
          password: form.password,
          confirmPassword: form.confirmPassword, // ✅ 必须包含这个字段
          phone: form.phone,
          smsCode: form.smsCode,
          email: form.email || undefined,
          userType: form.userType,
        }

        console.log('提交的注册数据:', JSON.stringify(registerData, null, 2)) // 调试用

        // 调用注册API
        const res = await register(registerData)

        if (res.code === 200) {
          ElMessage.success({
            message: '注册成功',
            duration: 2000,
          })
          currentStep.value++ // 跳转到第三步
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)

        // 处理验证错误
        if (error.response?.status === 400) {
          const errorData = error.response?.data
          if (errorData?.errors) {
            // 遍历所有错误字段
            for (const field in errorData.errors) {
              ElMessage.error(`${field}: ${errorData.errors[field]}`)
            }
          } else {
            ElMessage.error(errorData?.msg || '注册失败')
          }
        } else {
          ElMessage.error(error.response?.data?.msg || '注册失败，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }
  }

  // 前往登录
  const goToLogin = () => {
    router.push('/login')
  }

  // 返回首页
  const goToHome = () => {
    router.push('/')
  }

  return {
    form,
    formStep1Ref,
    formStep2Ref,
    rules,
    loading,
    currentStep,
    smsCountdown,
    agreementChecked,
    passwordStrengthClass,
    isPhoneValid,
    handlePasswordInput,
    handleConfirmPasswordInput,
    prevStep,
    nextStep,
    sendSmsCode,
    goToLogin,
    goToHome,
    handlePhoneInput,
    handlePhonePaste,
    handlePhoneKeydown,
    handlePhoneCompositionEnd,
    handleEmailInput,
    User,
    Phone,
    Message,
    Lock,
  }
}
