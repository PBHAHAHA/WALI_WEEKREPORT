<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  title: string
  description?: string
  meta?: string
  variant?: 'default' | 'notebook'
  class?: string
  html?: boolean // 是否渲染 HTML 内容
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  variant: 'default',
  html: false,
})
</script>

<template>
  <div 
    v-if="variant === 'default'"
    :class="cn(
      'bg-surface p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all h-56 flex flex-col justify-between cursor-pointer group',
      props.class
    )"
  >
    <div>
      <h3 class="font-bold text-lg text-text-main mb-3 group-hover:text-primary transition-colors">{{ title }}</h3>
      <p v-if="description && !html" class="text-xs text-text-muted leading-relaxed line-clamp-3">{{ description }}</p>
      <div v-else-if="description && html" class="text-xs text-text-muted leading-relaxed overflow-hidden card-html-content" v-html="description" />
      <slot />
    </div>
    <div v-if="meta" class="text-[10px] text-[#B0B0B0] font-medium">{{ meta }}</div>
  </div>

  <div
    v-else-if="variant === 'notebook'"
    :class="cn(
      'bg-white relative rounded-r-lg rounded-l-sm border-r border-t border-b border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-64 flex flex-col cursor-pointer group overflow-hidden',
      props.class
    )"
  >
    <!-- Binding Holes (Left Spine) -->
    <div class="absolute left-0 top-0 bottom-0 w-8 bg-[#F8F8F8] border-r border-gray-200/60 z-10 flex flex-col items-center py-4 gap-3">
       <!-- Holes -->
       <div v-for="i in 8" :key="i" class="w-3 h-3 rounded-full bg-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"></div>
    </div>
    
    <div class="pl-12 pr-6 py-6 h-full flex flex-col justify-between relative z-0">
      <!-- Ruled Lines Background -->
      <div class="absolute inset-0 top-6 pointer-events-none opacity-10 bg-[linear-gradient(#000_1px,transparent_1px)] bg-[size:100%_2rem]"></div>

      <div class="relative">
        <h3 class="font-bold text-lg text-text-main mb-3 group-hover:text-primary transition-colors tracking-tight">{{ title }}</h3>
        <p v-if="description" class="text-xs text-text-muted leading-8 line-clamp-4 font-light tracking-wide">{{ description }}</p>
      </div>
      <div v-if="meta" class="text-[10px] text-[#B0B0B0] font-medium relative pt-4 border-t border-dashed border-gray-100">{{ meta }}</div>
    </div>
  </div>
</template>

<style scoped>
.card-html-content {
  max-height: 4.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-html-content :deep(p) {
  margin: 0;
}

.card-html-content :deep(ol),
.card-html-content :deep(ul) {
  margin: 0;
  padding-left: 1.25rem;
}

.card-html-content :deep(li) {
  margin: 0;
}

.card-html-content :deep(h1),
.card-html-content :deep(h2) {
  font-size: inherit;
  font-weight: 600;
  margin: 0;
}
</style>
