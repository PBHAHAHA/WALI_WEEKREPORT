<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  class: '',
})

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
  secondary: 'bg-surface text-text-main border border-gray-200/50 hover:bg-gray-50 shadow-sm',
  ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-gray-100',
  icon: 'text-gray-400 hover:text-gray-800',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
}
</script>

<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      props.class
    )"
  >
    <slot />
  </button>
</template>
