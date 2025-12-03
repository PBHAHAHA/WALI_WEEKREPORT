export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  // 公开访问的页面列表
  const publicPages = ['/', '/login', '/register', '/playground']
  
  // 如果是公开页面，允许访问
  if (publicPages.includes(to.path)) {
    return
  }
  
  // 如果没有登录且访问的是受保护页面，重定向到首页
  if (!token.value) {
    return navigateTo('/')
  }
})
