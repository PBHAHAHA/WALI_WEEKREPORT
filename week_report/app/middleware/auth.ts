export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  // 如果没有登录且访问的不是登录/注册页面，重定向到登录页
  if (!token.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
