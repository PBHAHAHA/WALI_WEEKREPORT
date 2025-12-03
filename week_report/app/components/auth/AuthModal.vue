<template>
  <Modal :open="open" :title="mode === 'login' ? '登录' : '注册'" width="max-w-md" @close="handleClose">
    <!-- 登录表单 -->
    <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
        <input
          v-model="loginForm.email"
          type="email"
          placeholder="请输入邮箱"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
        />
      </div>

      <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div class="text-center text-sm text-gray-500">
        还没有账户？
        <button type="button" @click="switchMode" class="text-primary hover:text-primary-hover font-medium">
          立即注册
        </button>
      </div>
    </form>

    <!-- 注册表单 -->
    <form v-else @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
        <input
          v-model="registerForm.nickname"
          type="text"
          placeholder="请输入用户名（2-20位）"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          minlength="2"
          maxlength="20"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
        <input
          v-model="registerForm.email"
          type="email"
          placeholder="请输入邮箱"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
        <div class="flex gap-3">
          <input
            v-model="registerForm.code"
            type="text"
            maxlength="6"
            placeholder="6位验证码"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
          <button
            type="button"
            :disabled="sendingCode || countdown > 0"
            @click="handleSendCode"
            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
          >
            {{ countdown > 0 ? `${countdown}s` : (sendingCode ? '发送中...' : '获取验证码') }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
        <input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码（至少6位）"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
          minlength="6"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
        <input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
        />
      </div>

      <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
        {{ error }}
      </div>

      <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
        {{ success }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <div class="text-center text-sm text-gray-500">
        已有账户？
        <button type="button" @click="switchMode" class="text-primary hover:text-primary-hover font-medium">
          立即登录
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal/Modal.vue'

interface Props {
  open: boolean
  initialMode?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: 'login'
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const { login, register, sendCode } = useAuth()

const mode = ref<'login' | 'register'>(props.initialMode)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const error = ref('')
const success = ref('')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  nickname: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})

// 切换模式
const switchMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
  success.value = ''
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
  // 重置表单
  setTimeout(() => {
    loginForm.email = ''
    loginForm.password = ''
    registerForm.nickname = ''
    registerForm.email = ''
    registerForm.code = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    error.value = ''
    success.value = ''
    mode.value = props.initialMode
  }, 300)
}

// 登录
const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(loginForm.email, loginForm.password)
    emit('success')
    handleClose()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

// 发送验证码
const handleSendCode = async () => {
  if (!registerForm.email) {
    error.value = '请先输入邮箱'
    return
  }

  error.value = ''
  success.value = ''
  sendingCode.value = true

  try {
    await sendCode(registerForm.email, 'register')
    success.value = '验证码已发送，请查收邮件'
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err.message || '发送验证码失败'
  } finally {
    sendingCode.value = false
  }
}

// 注册
const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (registerForm.password.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }

  loading.value = true

  try {
    await register(registerForm.email, registerForm.password, registerForm.code, registerForm.nickname)
    success.value = '注册成功！正在自动登录...'
    
    // 注册成功后自动登录
    setTimeout(async () => {
      try {
        await login(registerForm.email, registerForm.password)
        emit('success')
        handleClose()
      } catch (e) {
        // 自动登录失败，切换到登录模式
        mode.value = 'login'
        loginForm.email = registerForm.email
        error.value = '请手动登录'
      }
    }, 1500)
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err.message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}

// 监听 initialMode 变化
watch(() => props.initialMode, (newMode) => {
  mode.value = newMode
})
</script>
