<template>
  <div class="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-12 pl-16">
    <!-- Toolbar (Optional, sticky top) -->
    <div class="fixed top-4 right-8 z-40 flex gap-2">
      <Button variant="secondary" size="sm">预览</Button>
      <Button variant="primary" size="sm">保存模板</Button>
    </div>

    <!-- Document Paper -->
    <div class="w-full max-w-[800px] bg-white min-h-[1000px] shadow-sm p-16 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Title -->
      <div class="mb-8 group border-b border-transparent focus-within:border-gray-100 transition-colors pb-4">
        <input 
          v-model="templateTitle" 
          type="text" 
          class="w-full text-4xl font-bold text-text-main placeholder-gray-300 outline-none bg-transparent border-none p-0"
          placeholder="未命名模板"
        />
        <div class="text-sm text-text-muted mt-2 font-light">周报模板</div>
      </div>

      <!-- Content Editor Area -->
      <ClientOnly>
        <Editor v-model="content" placeholder="输入周报内容..." />
      </ClientOnly>

    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/ui/Button/Button.vue'
import Editor from '~/components/ui/Editor/Editor.vue'

const route = useRoute()
const templateId = route.params.id

const templateTitle = ref(templateId === 'new' ? '' : '标准周报')

// Initial content for the editor
const content = ref(`
  <h3>本周工作总结</h3>
  <p>简要概述本周完成的主要任务和达成的重要里程碑。</p>
  
  <h3>下周工作计划</h3>
  <p>列出下周计划进行的重点工作事项和预期目标。</p>
  
  <h3>问题与风险</h3>
  <p>遇到的困难、需要协调的资源或潜在的风险点。</p>
`)

// In a real app, we would fetch the template data based on templateId
</script>

<style scoped>
/* Add some print styles if needed */
@media print {
  .no-print {
    display: none;
  }
}
</style>
