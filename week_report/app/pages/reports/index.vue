<template>
  <div class="p-8 max-w-6xl mx-auto pt-12 pl-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-text-main mb-2">周报管理</h1>
        <p class="text-sm text-text-muted">查看和管理你的周报记录</p>
      </div>
      <Button variant="primary" @click="handleCreateReport">
        <Plus class="w-4 h-4 mr-2" />
        新建周报
      </Button>
    </div>

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
    <div v-else class="flex flex-wrap gap-6">
      <div
        v-for="report in reports"
        :key="report.id"
        @click="viewReport(report.id)"
        class="sketch-card w-[260px] cursor-pointer group"
      >
        <div class="sketch-card-inner">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-text-main text-lg group-hover:text-primary transition-colors">
              {{ report.title }}
            </h3>
            <!-- 胶带装饰 -->
            <div class="w-8 h-3 bg-yellow-200/50 transform rotate-3 absolute top-2 right-1/2 translate-x-1/2 backdrop-blur-sm border border-white/20" />
          </div>
          
          <p class="text-sm text-gray-600 line-clamp-4 mb-4 min-h-[80px] leading-relaxed flex-1 font-handwriting">
            {{ report.summary || '暂无摘要内容...' }}
          </p>
          
          <div class="text-xs text-gray-500 pt-3 border-t-2 border-dashed border-gray-200 font-mono flex justify-between items-center">
            <span>{{ formatDateRange(report.startDate, report.endDate) }}</span>
            <span class="w-2 h-2 rounded-full" :class="report.summary ? 'bg-green-400' : 'bg-gray-300'" />
          </div>
        </div>
      </div>
    </div>

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
const editingReport = ref<WeeklyReport | null>(null)
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
const viewReport = (id: number) => {
  router.push(`/reports/${id}`)
}

// 删除周报
const deleteReport = async (id: number) => {
  if (!confirm('确定要删除这份周报吗？')) return
  
  try {
    await weeklyReport.remove(id)
    reports.value = reports.value.filter(r => r.id !== id)
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

<style scoped>
/* 手绘风格卡片 v2 */
.sketch-card {
  position: relative;
  transition: transform 0.2s ease;
}

.sketch-card:hover {
  transform: rotate(-1deg) scale(1.02);
  z-index: 10;
}

.sketch-card-inner {
  background: white;
  border: 2px solid #374151;
  /* 非对称圆角模拟手绘感 */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  padding: 1.25rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 4px 0 #374151; /* 硬阴影 */
  transition: all 0.2s ease;
}

.sketch-card:hover .sketch-card-inner {
  box-shadow: 6px 6px 0 #374151;
  border-color: #000;
}

/* 内部虚线框 */
.sketch-card-content {
  border: 1px dashed #9ca3af;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 随机旋转一点点，增加自然感 */
.sketch-card:nth-child(2n) {
  transform: rotate(1deg);
}

.sketch-card:nth-child(3n) {
  transform: rotate(-0.5deg);
}

.sketch-card:nth-child(2n):hover {
  transform: rotate(0deg) scale(1.02);
}

.sketch-card:nth-child(3n):hover {
  transform: rotate(0deg) scale(1.02);
}
</style>
