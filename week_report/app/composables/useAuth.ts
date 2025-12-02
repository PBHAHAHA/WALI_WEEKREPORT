interface User {
  id: number
  email: string
  nickname?: string
  isEmailVerified: boolean
  createdAt: string
}

interface LoginResponse {
  accessToken: string
  user: {
    id: number
    email: string
  }
}

interface SendCodeResponse {
  message: string
}

interface RegisterResponse {
  message: string
}

export const useAuth = () => {
  const api = useApi()
  const router = useRouter()
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => !!token.value)

  // 发送验证码
  const sendCode = async (email: string, type: 'register' | 'login' | 'reset_password' = 'register') => {
    return api.post<SendCodeResponse>('/auth/send-code', { email, type })
  }

  // 注册
  const register = async (email: string, password: string, code: string, nickname?: string) => {
    const response = await api.post<RegisterResponse>('/auth/register', {
      email,
      password,
      code,
      nickname,
    })
    return response
  }

  // 登录
  const login = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    token.value = response.accessToken
    
    // 登录成功后获取完整用户信息
    // 重新创建 api 实例以确保使用最新的 token
    const freshApi = useApi()
    try {
      const profile = await freshApi.get<User>('/auth/profile')
      user.value = profile
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    
    return response
  }

  // 获取用户信息
  const fetchProfile = async () => {
    if (!token.value) return null
    try {
      const profile = await api.get<User>('/auth/profile')
      user.value = profile
      return profile
    } catch {
      // Token 无效，清除登录状态
      logout()
      return null
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    router.push('/login')
  }

  // 初始化：检查登录状态
  const initAuth = async () => {
    if (token.value && !user.value) {
      await fetchProfile()
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    sendCode,
    register,
    login,
    logout,
    fetchProfile,
    initAuth,
  }
}
