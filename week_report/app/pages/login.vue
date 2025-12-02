<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">欢迎回来</h1>
        <p class="text-gray-500">登录您的周报系统账户</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
          <input
            v-model="form.password"
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
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        还没有账户？
        <NuxtLink to="/register" class="text-primary hover:text-primary-hover font-medium">
          立即注册
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const { login, isLoggedIn } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

// 如果已登录，重定向到首页
onMounted(() => {
  if (isLoggedIn.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(form.email, form.password)
    router.push('/')
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
