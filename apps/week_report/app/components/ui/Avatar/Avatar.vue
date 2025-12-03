<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  src?: string
  initials?: string
  status?: 'online' | 'offline' | 'busy'
  size?: 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'offline',
  size: 'md',
  class: '',
})

const sizes = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

const statusColors = {
  online: 'bg-status-online',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
}
</script>

<template>
  <div :class="cn('relative inline-block', props.class)">
    <div 
      :class="cn(
        'rounded-full bg-accent-green flex items-center justify-center text-white font-bold overflow-hidden',
        sizes[size]
      )"
    >
      <img v-if="src" :src="src" class="w-full h-full object-cover" />
      <span v-else-if="initials">{{ initials }}</span>
    </div>
    
    <div 
      v-if="status"
      :class="cn(
        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar',
        statusColors[status]
      )"
    ></div>
  </div>
</template>
