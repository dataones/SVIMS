import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

export default function useLogin() {
  const router = useRouter()
  const userStore = useUserStore()

  const loading = ref(false)
  const formRef = ref()
  const rememberMe = ref(false)

  const form = reactive({
    username: '',
    password: '',
  })

  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    ],
  }

  /* ================= 记住密码 ================= */

  const checkRememberedPassword = () => {
    try {
      const remembered = localStorage.getItem('rememberedLogin')
      if (remembered) {
        const data = JSON.parse(remembered)
        form.username = data.username || ''
        form.password = data.password || ''
        rememberMe.value = true
      }
    } catch (error) {
      console.error('解析记住密码失败:', error)
      localStorage.removeItem('rememberedLogin')
    }
  }

  onMounted(() => {
    checkRememberedPassword()
  })

  /* ================= 登录逻辑（核心修改） ================= */

  const handleLogin = async () => {
    try {
      // 1. 表单校验
      await formRef.value.validate()
      loading.value = true

      // 2. 记住密码（只负责本地存储）
      if (rememberMe.value) {
        localStorage.setItem(
          'rememberedLogin',
          JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        )
      } else {
        localStorage.removeItem('rememberedLogin')
      }

      // 3. 只调用 store 的登录方法（不再直接调 login 接口）
      await userStore.loginAction({
        username: form.username,
        password: form.password,
        remember: rememberMe.value,
      })

      // 4. 获取用户信息
      await userStore.getUserInfoAction()

      // 5. 成功提示
      ElMessage.success({
        message: '登录成功',
        showClose: true,
        duration: 1500,
      })

      // 6. 跳转
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } catch (error) {
      console.error('登录错误:', error)

      ElMessage.error({
        message: error.message || '登录失败，请检查用户名和密码',
        showClose: true,
      })
    } finally {
      loading.value = false
    }
  }

  /* ================= 注册跳转 ================= */

  const handleRegister = () => {
    router.push('/register')
  }

  /* ================= 调试用（可选） ================= */

  const debugState = () => {
    console.log('当前登录状态:')
    console.log('isLogin:', userStore.isLogin)
    console.log('token:', userStore.token)
    console.log('userInfo:', userStore.userInfo)
    console.log('localStorage token:', localStorage.getItem('token'))
    console.log('sessionStorage token:', sessionStorage.getItem('token'))
  }

  return {
    form,
    formRef,
    rules,
    loading,
    rememberMe,
    handleLogin,
    handleRegister,
    debugState,
    User,
    Lock,
  }
}
