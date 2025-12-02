<template>
  <div class="p-8 max-w-6xl mx-auto pt-12 pl-12 min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-text-main mb-2">模板管理</h1>
        <p class="text-sm text-text-muted">创建和管理你的周报模板</p>
      </div>
      <Button variant="primary" @click="handleCreateTemplate">
        <Plus class="w-4 h-4 mr-2" />
        新建模板
      </Button>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-4 mb-6 border-b border-gray-100">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-3 text-sm font-medium transition-colors relative"
        :class="activeTab === tab.value 
          ? 'text-primary' 
          : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
        <span 
          v-if="activeTab === tab.value"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTemplates.length === 0" class="text-center py-20">
      <FileText class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">暂无模板</p>
      <Button variant="secondary" @click="handleCreateTemplate">
        创建第一个模板
      </Button>
    </div>

    <!-- Templates Grid -->
    <div v-else class="flex flex-wrap gap-5">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="w-[280px] bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
        @click="viewTemplate(template)"
      >
        <div class="h-1.5 bg-gradient-to-r from-primary to-primary/50" />
        
        <div class="p-5">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-text-main group-hover:text-primary transition-colors flex-1">
              {{ template.title }}
            </h3>
            <span 
              class="px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2"
              :class="getTypeClass(template.type)"
            >
              {{ getTypeLabel(template.type) }}
            </span>
          </div>
          <p class="text-sm text-gray-500 line-clamp-3 mb-4 min-h-[60px]">
            {{ template.description || '暂无描述' }}
          </p>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>使用 {{ template.useCount }} 次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal 
      :open="showModal" 
      :title="editingTemplate ? '编辑模板' : '新建模板'" 
      width="max-w-3xl"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="例如：标准周报模板"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模板类型</label>
          <select
            v-model="formData.type"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="daily">日报模板</option>
            <option value="weekly">周报模板</option>
            <option value="custom">自定义模板</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            placeholder="简要描述这个模板的用途..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模板内容</label>
          <RichEditor
            v-model="formData.content"
            placeholder="输入模板内容..."
            min-height="300px"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="formData.isPublic"
            type="checkbox"
            id="isPublic"
            class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label for="isPublic" class="text-sm text-gray-700 cursor-pointer">
            设为公开模板（其他用户可以查看和使用）
          </label>
        </div>
      </div>

      <template #footer>
        <Button 
          v-if="editingTemplate"
          variant="secondary" 
          @click="handleDeleteTemplate"
        >
          删除
        </Button>
        <div class="flex-1"></div>
        <Button variant="secondary" @click="closeModal">取消</Button>
        <Button 
          variant="primary" 
          :disabled="submitting || !formData.title || !formData.content"
          @click="handleSaveTemplate"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import { Plus, FileText, Edit, Trash2 } from 'lucide-vue-next'
import Button from '~/components/ui/Button/Button.vue'
import Modal from '~/components/ui/Modal/Modal.vue'
import RichEditor from '~/components/ui/RichEditor/RichEditor.vue'

interface Template {
  id: number
  title: string
  content: string
  type: 'daily' | 'weekly' | 'custom'
  description: string
  isPublic: boolean
  useCount: number
  createdAt: string
  updatedAt: string
}

const templateService = useTemplate()
const router = useRouter()

const loading = ref(true)
const templates = ref<Template[]>([])
const publicTemplates = ref<Template[]>([])
const activeTab = ref('my')
const showModal = ref(false)
const editingTemplate = ref<Template | null>(null)
const submitting = ref(false)

const formData = ref({
  title: '',
  content: '',
  type: 'weekly' as 'daily' | 'weekly' | 'custom',
  description: '',
  isPublic: false,
})

const tabs = [
  { label: '我的模板', value: 'my' },
  { label: '公开模板', value: 'public' },
]

// 过滤模板
const filteredTemplates = computed(() => {
  return activeTab.value === 'my' ? templates.value : publicTemplates.value
})

// 加载模板
const loadTemplates = async () => {
  loading.value = true
  try {
    const [myTemplates, pubTemplates] = await Promise.all([
      templateService.getMy(),
      templateService.getPublic(),
    ])
    templates.value = myTemplates
    publicTemplates.value = pubTemplates
  } catch (error) {
    console.error('加载模板失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取类型样式
const getTypeClass = (type: string) => {
  const classes = {
    daily: 'bg-blue-100 text-blue-700',
    weekly: 'bg-green-100 text-green-700',
    custom: 'bg-purple-100 text-purple-700',
  }
  return classes[type as keyof typeof classes] || classes.custom
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const labels = {
    daily: '日报',
    weekly: '周报',
    custom: '自定义',
  }
  return labels[type as keyof typeof labels] || '自定义'
}

// 新建模板
const handleCreateTemplate = () => {
  editingTemplate.value = null
  formData.value = {
    title: '',
    content: '',
    type: 'weekly',
    description: '',
    isPublic: false,
  }
  showModal.value = true
}

// 查看/编辑模板
const viewTemplate = (temp: Template) => {
  editingTemplate.value = temp
  formData.value = {
    title: temp.title,
    content: temp.content,
    type: temp.type,
    description: temp.description || '',
    isPublic: temp.isPublic,
  }
  showModal.value = true
}

// 应用模板
const applyTemplate = async (id: number) => {
  try {
    const temp = await templateService.use(id)
    // 跳转到创建周报页面，并传递模板内容
    router.push({
      path: '/reports/create',
      query: { templateId: id }
    })
  } catch (error) {
    console.error('使用模板失败:', error)
  }
}

// 删除模板
const handleDeleteTemplate = async () => {
  if (!editingTemplate.value) return
  if (!confirm('确定要删除这个模板吗？')) return
  
  try {
    await templateService.remove(editingTemplate.value.id)
    templates.value = templates.value.filter(t => t.id !== editingTemplate.value!.id)
    publicTemplates.value = publicTemplates.value.filter(t => t.id !== editingTemplate.value!.id)
    closeModal()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 保存模板
const handleSaveTemplate = async () => {
  if (!formData.value.title || !formData.value.content || submitting.value) return
  
  submitting.value = true
  try {
    if (editingTemplate.value) {
      await templateService.update(editingTemplate.value.id, formData.value)
    } else {
      await templateService.create(formData.value)
    }
    await loadTemplates()
    closeModal()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  editingTemplate.value = null
}

// 初始化
onMounted(() => {
  loadTemplates()
})
</script>
