<template>
  <div class="p-8 max-w-6xl mx-auto pt-32 pl-12 min-h-screen">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-[32px] font-medium text-text-main mb-3 tracking-tight">周报模板</h1>
      <p class="text-base text-text-muted font-light tracking-wide">选择一个模板开始编写，或者创建新的自定义模板。</p>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card 
        v-for="template in templates" 
        :key="template.id"
        :title="template.title"
        :description="template.description"
        variant="notebook"
        @click="navigateToTemplate(template.id)"
      />
      
      <!-- New Template Card -->
      <div 
        class="bg-white relative rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/30 hover:bg-gray-50/50 transition-all h-64 flex flex-col items-center justify-center cursor-pointer group shadow-sm hover:shadow-md"
        @click="navigateToTemplate('new')"
      >
        <div class="w-14 h-14 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors shadow-sm border border-gray-100 group-hover:border-primary/10 group-hover:scale-110 duration-300">
          <Plus class="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <span class="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">创建新模板</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import Card from '~/components/ui/Card/Card.vue'

const router = useRouter()

const templates = [
  {
    id: 'weekly-standard',
    title: '标准周报',
    description: '包含本周工作总结、下周计划、问题与风险三个标准模块。适用于大多数通用场景。'
  },
  {
    id: 'project-milestone',
    title: '项目里程碑汇报',
    description: '专注于项目进度的汇报模板，强调里程碑达成情况、关键路径分析和资源需求。'
  },
  {
    id: 'okr-tracking',
    title: 'OKR 进度追踪',
    description: '基于OKR管理法的周报模板，对齐季度目标，量化关键结果进度。'
  },
  {
    id: 'team-sync',
    title: '团队同步会议',
    description: '用于周会记录的模板，包含议程、讨论要点、决议项和待办事项分配。'
  }
]

const navigateToTemplate = (id: string) => {
  router.push(`/templates/${id}`)
}
</script>
