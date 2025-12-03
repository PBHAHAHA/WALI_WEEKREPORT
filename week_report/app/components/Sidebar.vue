<script setup lang="ts">
import { Home, FileText, LayoutTemplate, Settings, LogOut, LogIn } from 'lucide-vue-next'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import AuthModal from '~/components/auth/AuthModal.vue'

const route = useRoute()
const { user, isLoggedIn, logout } = useAuth()
const showAuthModal = ref(false)

const navItems = computed(() => {
  const items = [
    { icon: Home, label: '主页', to: '/', active: route.path === '/', requireAuth: false },
  ]
  
  // 只有登录后才显示这些菜单
  if (isLoggedIn.value) {
    items.push(
      { icon: FileText, label: '周报', to: '/reports', active: route.path.startsWith('/reports'), requireAuth: true },
      { icon: LayoutTemplate, label: '模板', to: '/templates', active: route.path.startsWith('/templates'), requireAuth: true },
    )
  }
  
  return items
})

// 获取用户名首字母
const userInitials = computed(() => {
  if (user.value?.nickname) {
    return user.value.nickname.slice(0, 2).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.slice(0, 2).toUpperCase()
  }
  return 'U'
})

const handleLogout = () => {
  logout()
}

const handleLogin = () => {
  showAuthModal.value = true
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
}
</script>

<template>
  <aside class="h-screen w-16 bg-sidebar border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0 z-50">
    <!-- Logo -->
    <div class="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
      <span class="text-white font-bold text-lg">W</span>
    </div>

    <!-- Main Navigation -->
    <div class="flex flex-col items-center space-y-6 flex-1 w-full pt-8">
      <div class="flex flex-col items-center space-y-8 w-full pt-2">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.label"
          :to="item.to"
          class="flex flex-col items-center gap-1 group transition-colors"
          :class="item.active ? 'text-text-main' : 'text-gray-400 hover:text-text-main'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px]" :class="item.active ? 'font-medium' : 'group-hover:font-medium'">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex flex-col items-center space-y-4 pb-2">
      <!-- 未登录时显示登录按钮 -->
      <button 
        v-if="!isLoggedIn"
        @click="handleLogin"
        class="flex flex-col items-center gap-1 text-primary hover:text-primary-hover transition-colors"
        title="登录"
      >
        <LogIn class="w-5 h-5" />
        <span class="text-[10px] font-medium">登录</span>
      </button>
      
      <!-- 已登录时显示设置和退出 -->
      <template v-else>
      <button 
        class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-800 transition-colors"
        title="设置"
      >
        <Settings class="w-5 h-5" />
        <span class="text-[10px]">设置</span>
      </button>
      
        <button 
          @click="handleLogout"
          class="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
          title="退出登录"
        >
          <LogOut class="w-5 h-5" />
          <span class="text-[10px]">退出</span>
        </button>

        <!-- User Avatar -->
        <Avatar 
          size="md" 
          :initials="userInitials" 
          status="online" 
          class="text-white mt-2" 
          :title="user?.nickname || user?.email || '用户'"
        />
      </template>
    </div>
  </aside>
  
  <!-- Auth Modal -->
  <AuthModal 
    :open="showAuthModal" 
    @close="showAuthModal = false"
    @success="handleAuthSuccess"
  />
</template>
