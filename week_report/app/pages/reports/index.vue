<template>
  <div class="p-8 max-w-6xl mx-auto pt-12 pl-12">
    <!-- Reports List -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="reports.length === 0" class="text-center py-20">
      <FileText class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">暂无周报记录</p>
      <Button variant="secondary" @click="handleCreateReport">
        创建第一份周报
      </Button>
    </div>

    <!-- Card Grid -->
    <div v-else class="flex flex-wrap gap-5">
      <div
        v-for="report in reports"
        :key="report.id"
        @click="viewReport(report.id)"
        class="w-[280px] bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
      >
        <!-- Card Top Accent -->
        <div class="h-1.5 bg-gradient-to-r from-primary to-primary/50" />
        
        <!-- Card Content -->
        <div class="p-5">
          <h3 class="font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
            {{ report.title }}
          </h3>
          <p class="text-sm text-gray-500 line-clamp-3 mb-4 min-h-[60px]">
            {{ report.summary || '暂无摘要内容，点击查看详情...' }}
          </p>
          <div class="text-xs text-gray-400">
            {{ formatDateRange(report.startDate, report.endDate) }}
          </div>
        </div>
      </div>
    </div>

    <!-- View/Edit Modal -->
    <Modal 
      :open="showViewModal" 
      title="编辑周报" 
      width="max-w-4xl"
      @close="closeViewModal"
    >
      <div v-if="viewingReport" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="editTitle"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="周报标题"
          />
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-500 pb-3 border-b">
          <span>{{ formatDateRange(viewingReport.startDate, viewingReport.endDate) }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <RichEditor
            v-model="editContent"
            placeholder="编辑周报内容..."
            min-height="400px"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          variant="secondary" 
          @click="handleDeleteReport"
        >
          删除
        </Button>
        <div class="flex-1"></div>
        <Button variant="secondary" @click="closeViewModal">取消</Button>
        <Button 
          variant="primary" 
          :disabled="submitting || !editTitle.trim()"
          @click="handleSaveEdit"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </Button>
      </template>
    </Modal>

    <!-- Create/Edit Modal -->
    <Modal 
      :open="showCreateModal" 
      :title="editingReport ? '编辑周报' : '新建周报'" 
      width="max-w-3xl"
      @close="closeCreateModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="例如：第48周工作周报"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              v-model="formData.startDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              v-model="formData.endDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">周报内容</label>
          <RichEditor
            v-model="formData.content"
            placeholder="输入周报内容..."
            min-height="300px"
          />
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="closeCreateModal">取消</Button>
        <Button 
          variant="primary" 
          :disabled="submitting || !formData.title"
          @click="handleSaveReport"
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

import { Plus, FileText } from 'lucide-vue-next'
import Button from '~/components/ui/Button/Button.vue'
import Modal from '~/components/ui/Modal/Modal.vue'
import RichEditor from '~/components/ui/RichEditor/RichEditor.vue'

interface WeeklyReport {
  id: number
  title: string
  content: string
  summary: string
  year: number
  weekNumber: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

const weeklyReport = useWeeklyReport()
const router = useRouter()

const loading = ref(true)
const reports = ref<WeeklyReport[]>([])
const showCreateModal = ref(false)
const showViewModal = ref(false)
const viewingReport = ref<WeeklyReport | null>(null)
const editingReport = ref<WeeklyReport | null>(null)
const editTitle = ref('')
const editContent = ref('')
const submitting = ref(false)

const formData = ref({
  title: '',
  content: '',
  year: new Date().getFullYear(),
  weekNumber: 1,
  startDate: '',
  endDate: '',
})

// 加载周报列表
const loadReports = async () => {
  loading.value = true
  try {
    const result = await weeklyReport.getAll()
    reports.value = result.data
  } catch (error) {
    console.error('加载周报失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期范围
const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日`
  const endStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`
  return `${startStr} - ${endStr}`
}

// 获取周数
const getWeekNumber = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff / oneWeek) + 1)
}

// 新建周报
const handleCreateReport = () => {
  editingReport.value = null
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const weekNum = getWeekNumber()
  
  formData.value = {
    title: `第${weekNum}周工作周报`,
    content: '',
    year: now.getFullYear(),
    weekNumber: weekNum,
    startDate: monday.toISOString().split('T')[0],
    endDate: friday.toISOString().split('T')[0],
  }
  showCreateModal.value = true
}

// 编辑周报
const editReport = (id: number) => {
  const report = reports.value.find(r => r.id === id)
  if (report) {
    editingReport.value = report
    formData.value = {
      title: report.title,
      content: report.content,
      year: report.year,
      weekNumber: report.weekNumber,
      startDate: report.startDate?.split('T')[0] || '',
      endDate: report.endDate?.split('T')[0] || '',
    }
    showCreateModal.value = true
  }
}

// 查看周报
const viewReport = async (id: number) => {
  try {
    const report = await weeklyReport.getOne(id)
    viewingReport.value = report
    editTitle.value = report.title
    editContent.value = report.content
    showViewModal.value = true
  } catch (error) {
    console.error('加载周报失败:', error)
  }
}

// 关闭查看弹窗
const closeViewModal = () => {
  showViewModal.value = false
  viewingReport.value = null
  editTitle.value = ''
  editContent.value = ''
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!viewingReport.value || submitting.value || !editTitle.value.trim()) return
  
  submitting.value = true
  try {
    await weeklyReport.update(viewingReport.value.id, {
      title: editTitle.value,
      content: editContent.value
    })
    
    // 更新本地数据
    viewingReport.value.title = editTitle.value
    viewingReport.value.content = editContent.value
    const index = reports.value.findIndex(r => r.id === viewingReport.value!.id)
    if (index !== -1) {
      reports.value[index].title = editTitle.value
      reports.value[index].content = editContent.value
    }
    
    closeViewModal()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

// 删除周报
const handleDeleteReport = async () => {
  if (!viewingReport.value) return
  if (!confirm('确定要删除这份周报吗？')) return
  
  try {
    await weeklyReport.remove(viewingReport.value.id)
    reports.value = reports.value.filter(r => r.id !== viewingReport.value!.id)
    closeViewModal()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 保存周报
const handleSaveReport = async () => {
  if (!formData.value.title || submitting.value) return
  
  submitting.value = true
  try {
    if (editingReport.value) {
      await weeklyReport.update(editingReport.value.id, formData.value)
    } else {
      await weeklyReport.create(formData.value)
    }
    await loadReports()
    closeCreateModal()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const closeCreateModal = () => {
  showCreateModal.value = false
  editingReport.value = null
}

// 初始化
onMounted(() => {
  loadReports()
})
</script>
