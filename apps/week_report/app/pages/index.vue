<template>
  <div class="relative min-h-screen">
    <!-- Main Content -->
    <Transition name="fade-slide">
      <div 
        v-show="!chatMode" 
        class="p-8 max-w-6xl mx-auto pt-32 pl-12"
      >
        <!-- Greeting Section -->
        <div class="mb-12">
          <h1 class="text-[42px] font-medium text-text-main mb-3 tracking-tight">你好，{{ user?.nickname || '访客' }}</h1>
          <p class="text-xl text-text-muted font-light tracking-wide">今天的工作进展如何？记录一下吧。</p>
        </div>

        <!-- AI Input Section -->
        <div class="mb-20">
          <ScriptInput 
            v-model="aiQuestion" 
            :placeholder="isLoggedIn ? '向 AI 提问，或让 AI 帮你生成周报...' : '登录后即可使用 AI 功能...'"
            :readonly="!isLoggedIn"
            @click="!isLoggedIn && (showAuthModal = true)"
          >
            <template #actions-right>
              <Button 
                variant="primary" 
                class="rounded-full pl-6 pr-5 py-2.5 bg-[#4A6B4D] hover:bg-[#3D5A40] text-white border-none shadow-md transition-all hover:shadow-lg active:scale-95"
                :disabled="!isLoggedIn || !aiQuestion.trim()"
                @click="enterChatWithQuestion"
              >
                <span class="text-sm font-medium">{{ isLoggedIn ? '开始' : '登录使用' }}</span>
                <CornerDownLeft class="w-4 h-4 ml-2 opacity-90" />
              </Button>
            </template>
          </ScriptInput>
        </div>

    <!-- Weekly Overview -->
    <div class="mb-16">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-text-muted">
            <CalendarDays class="w-4 h-4" />
            <span class="text-xs font-medium">本周概览 (第 {{ currentWeekNumber }} 周){{ !isLoggedIn ? ' - 演示' : '' }}</span>
          </div>
          <div v-if="hasAnyDailyLog" class="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <Sparkles class="w-3.5 h-3.5" />
            <span class="font-medium">可以生成周报了</span>
          </div>
        </div>
        <Button 
          variant="primary" 
          size="md"
          class="bg-gradient-to-r from-[#4A6B4D] to-[#5A7B5D] hover:from-[#3D5A40] hover:to-[#4A6B4D] text-white border-none shadow-lg hover:shadow-xl transition-all active:scale-95 px-6 py-2.5 text-sm font-medium"
          @click="showTemplateSelectionModal"
        >
          <Sparkles class="w-4 h-4 mr-2" />
          生成周报
          <ArrowRight class="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card 
          v-for="day in weekDays" 
          :key="day.date"
          :title="day.dayName"
          :description="day.content || '点击添加日报...'"
          :html="!!day.content"
          :class="cn('h-40 cursor-pointer', !day.content && 'opacity-60 border-dashed bg-gray-50 hover:bg-white hover:opacity-100')"
          :meta="day.displayDate"
          @click="handleDayClick(day)"
        />
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="pb-12">
      <div class="flex items-center gap-2 mb-6 text-text-muted">
        <FileText class="w-4 h-4" />
        <span class="text-xs font-medium">历史周报{{ !isLoggedIn ? ' - 演示' : '' }}</span>
      </div>
      
      <div v-if="displayReports.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-5">
         <Card 
          v-for="report in displayReports" 
          :key="report.id"
          :title="report.title"
          :description="cleanSummary(report.summary) || '暂无摘要'"
          :meta="report.startDate"
          @click="isLoggedIn ? viewRecentReport(report.id) : (showAuthModal = true)"
          :class="cn(!isLoggedIn && 'cursor-pointer hover:border-primary/50')"
        />
      </div>
      <div v-else class="text-center py-12 text-gray-400">
        <p class="mb-4">{{ isLoggedIn ? '暂无周报记录' : '登录后查看你的周报' }}</p>
        <Button v-if="!isLoggedIn" variant="primary" @click="showAuthModal = true">
          立即登录
        </Button>
      </div>
    </div>

    <!-- Daily Log Edit Modal -->
    <Modal :open="showEditModal" :title="editingDay?.dayName + ' 日报'" width="max-w-2xl" @close="closeEditModal">
      <div class="space-y-4">
        <div class="text-sm text-gray-500">{{ formatModalDate(editingDay?.date || '') }}</div>
        <RichEditor
          v-model="editContent"
          placeholder="记录今天的工作内容..."
          min-height="250px"
        />
      </div>
      <template #footer>
        <Button variant="secondary" @click="closeEditModal">取消</Button>
        <Button 
          variant="primary" 
          :disabled="submitting"
          @click="handleSaveLog"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </Button>
      </template>
    </Modal>

    <!-- Generate Report Modal -->
    <Modal :open="showGenerateModal" title="生成周报" width="max-w-4xl" @close="closeGenerateModal">
      <div class="space-y-4">
        <!-- Template Selection -->
        <div v-if="!isGenerating && !generatedContent">
          <p class="text-sm text-gray-500 mb-3">选择一个模板来生成本周周报，或不使用模板直接生成</p>
          
          <div v-if="loadingTemplates" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-primary" />
          </div>
          
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto">
            <div
              @click="selectedTemplateId = null"
              class="p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="selectedTemplateId === null ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="font-medium text-sm">不使用模板</div>
              <div class="text-xs text-gray-500 mt-1">使用默认格式生成周报</div>
            </div>
            
            <div
              v-for="template in templates"
              :key="template.id"
              @click="selectedTemplateId = template.id"
              class="p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="font-medium text-sm">{{ template.title }}</div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-2">{{ template.description || '暂无描述' }}</div>
            </div>
          </div>
        </div>

        <!-- Generating / Generated Content -->
        <div v-if="isGenerating || generatedContent" class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">周报内容</label>
            <div v-if="isGenerating" class="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 class="w-3 h-3 animate-spin" />
              <span>AI 生成中...</span>
            </div>
          </div>
          <RichEditor
            v-model="generatedContent"
            placeholder="生成的周报内容将显示在这里..."
            min-height="400px"
            :readonly="isGenerating"
          />
        </div>
      </div>
      
      <template #footer>
        <Button variant="secondary" @click="closeGenerateModal">取消</Button>
        <Button 
          v-if="!isGenerating && !generatedContent"
          variant="primary" 
          @click="startGenerating"
        >
          开始生成
        </Button>
        <Button 
          v-if="generatedContent && !isGenerating"
          variant="primary" 
          :disabled="savingReport"
          @click="handleSaveGeneratedReport"
        >
          {{ savingReport ? '保存中...' : '保存周报' }}
        </Button>
      </template>
    </Modal>

    <!-- View Report Modal -->
    <Modal 
      :open="showReportViewModal" 
      title="编辑周报" 
      width="max-w-4xl"
      @close="closeReportViewModal"
    >
      <div v-if="viewingReport" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="reportEditTitle"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="周报标题"
          />
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-500 pb-3 border-b">
          <span>{{ formatReportDateRange(viewingReport.startDate, viewingReport.endDate) }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <RichEditor
            v-model="reportEditContent"
            placeholder="编辑周报内容..."
            min-height="400px"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          variant="secondary" 
          @click="handleDeleteReportFromHome"
        >
          删除
        </Button>
        <div class="flex-1"></div>
        <Button variant="secondary" @click="closeReportViewModal">取消</Button>
        <Button 
          variant="primary" 
          :disabled="savingReport || !reportEditTitle.trim()"
          @click="handleSaveReportFromHome"
        >
          {{ savingReport ? '保存中...' : '保存' }}
        </Button>
      </template>
    </Modal>
      </div>
    </Transition>

    <!-- Chat Mode -->
    <Transition name="chat-slide">
      <div 
        v-if="chatMode" 
        class="fixed inset-0 z-40 bg-white"
        style="left: 64px;"
      >
        <ChatView 
          :visible="chatMode" 
          :initial-question="pendingQuestion"
          @close="exitChatMode" 
        />
      </div>
    </Transition>

    <!-- Auth Modal -->
    <AuthModal 
      :open="showAuthModal" 
      :initial-mode="authModalMode"
      @close="showAuthModal = false; authModalMode = 'login'"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// 首页允许未登录访问

import { 
  CalendarDays, 
  FileText, 
  ArrowRight, 
  Send, 
  CornerDownLeft,
  Loader2,
  Sparkles
} from 'lucide-vue-next'
import Button from '~/components/ui/Button/Button.vue'
import Card from '~/components/ui/Card/Card.vue'
import ScriptInput from '~/components/ui/Input/ScriptInput.vue'
import Modal from '~/components/ui/Modal/Modal.vue'
import RichEditor from '~/components/ui/RichEditor/RichEditor.vue'
import ChatView from '~/components/chat/ChatView.vue'
import { cn } from '~/utils/cn'
import AuthModal from '~/components/auth/AuthModal.vue'

const { user, isLoggedIn, initAuth } = useAuth()
const dailyLog = useDailyLog()
const weeklyReport = useWeeklyReport()
const templateService = useTemplate()
const router = useRouter()

// 类型定义
interface WeekDay {
  dayName: string
  date: string
  displayDate: string
  content: string
}

interface Template {
  id: number
  title: string
  description: string
  type: string
}

// 状态
const aiQuestion = ref('')
const chatMode = ref(false)
const pendingQuestion = ref('')
const submitting = ref(false)
const weekDays = ref<WeekDay[]>([])
const recentReports = ref<Array<{ id: number; title: string; summary: string; startDate: string }>>([])

// 弹窗状态
const showEditModal = ref(false)
const editingDay = ref<WeekDay | null>(null)
const editContent = ref('')

// 生成周报弹窗状态
const showGenerateModal = ref(false)
const templates = ref<Template[]>([])
const selectedTemplateId = ref<number | null>(null)
const loadingTemplates = ref(false)
const isGenerating = ref(false)
const generatedContent = ref('')
const savingReport = ref(false)

// 查看周报弹窗状态
const showReportViewModal = ref(false)
const viewingReport = ref<any>(null)
const reportEditTitle = ref('')
const reportEditContent = ref('')

// 登录弹窗状态
const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

// 获取当前周数
const currentWeekNumber = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff / oneWeek) + 1)
})

// 检查是否有任何日报内容
const hasAnyDailyLog = computed(() => {
  return weekDays.value.some(day => day.content && day.content.trim().length > 0)
})

// 显示的周报列表（未登录时显示演示数据）
const displayReports = computed(() => {
  if (isLoggedIn.value) {
    return recentReports.value
  }
  // 未登录时返回演示数据
  return [
    {
      id: -1,
      title: '第48周工作周报',
      summary: '本周完成了用户管理模块的开发，优化了数据库查询性能，修复了若干 Bug...',
      startDate: '2024-11-25'
    },
    {
      id: -2,
      title: '第47周工作周报',
      summary: '完成了 API 接口的设计与实现，集成了第三方登录功能，开始前端页面的开发...',
      startDate: '2024-11-18'
    },
    {
      id: -3,
      title: '第46周工作周报',
      summary: '项目启动，完成了技术选型和架构设计，搭建了基础开发环境...',
      startDate: '2024-11-11'
    }
  ]
})

// 生成本周日期
const generateWeekDays = () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  
  const dayNames = ['周一', '周二', '周三', '周四', '周五']
  const days = []
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      dayName: dayNames[i],
      date: dateStr,
      displayDate: `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`,
      content: '',
    })
  }
  
  return days
}

// 加载本周日报
const loadWeekLogs = async () => {
  try {
    const logs = await dailyLog.getCurrentWeek()
    const days = generateWeekDays()
    
    // 将日报内容填充到对应日期
    logs.forEach(log => {
      const day = days.find(d => d.date === log.date)
      if (day) {
        day.content = log.content
      }
    })
    
    weekDays.value = days
  } catch (error) {
    console.error('加载本周日报失败:', error)
    weekDays.value = generateWeekDays()
  }
}

// 加载最近周报
const loadRecentReports = async () => {
  try {
    const reports = await weeklyReport.getRecent(4)
    recentReports.value = reports
  } catch (error) {
    console.error('加载周报失败:', error)
  }
}

// 格式化弹窗日期
const formatModalDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 清理摘要中的 HTML 标签
const cleanSummary = (summary: string) => {
  if (!summary) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = summary
  return tempDiv.textContent || tempDiv.innerText || ''
}

// 点击日期卡片 - 打开弹窗
const handleDayClick = (day: WeekDay) => {
  if (!isLoggedIn.value) {
    showAuthModal.value = true
    return
  }
  editingDay.value = day
  editContent.value = day.content
  showEditModal.value = true
}

// 关闭弹窗
const closeEditModal = () => {
  showEditModal.value = false
  editingDay.value = null
  editContent.value = ''
}

// 保存日报
const handleSaveLog = async () => {
  if (!editingDay.value || submitting.value) return
  
  submitting.value = true
  try {
    await dailyLog.createOrUpdate(editingDay.value.date, editContent.value)
    await loadWeekLogs()
    closeEditModal()
  } catch (error) {
    console.error('保存日报失败:', error)
  } finally {
    submitting.value = false
  }
}

// 进入对话模式（带问题）
const enterChatWithQuestion = () => {
  if (!isLoggedIn.value) {
    showAuthModal.value = true
    return
  }
  if (!aiQuestion.value.trim()) return
  pendingQuestion.value = aiQuestion.value
  aiQuestion.value = ''
  chatMode.value = true
}

// 显示生成周报弹窗
const showTemplateSelectionModal = async () => {
  if (!isLoggedIn.value) {
    showAuthModal.value = true
    return
  }
  const logsWithContent = weekDays.value.filter(day => day.content)
  if (logsWithContent.length === 0) {
    alert('请先添加本周的日报内容')
    return
  }
  
  showGenerateModal.value = true
  generatedContent.value = ''
  selectedTemplateId.value = null
  
  loadingTemplates.value = true
  try {
    const myTemplates = await templateService.getMy('weekly')
    templates.value = myTemplates
  } catch (error) {
    console.error('加载模板失败:', error)
  } finally {
    loadingTemplates.value = false
  }
}

// 关闭生成弹窗
const closeGenerateModal = () => {
  showGenerateModal.value = false
  selectedTemplateId.value = null
  generatedContent.value = ''
  isGenerating.value = false
}

// 开始生成周报（流式）
const startGenerating = async () => {
  const logsWithContent = weekDays.value.filter(day => day.content)
  if (logsWithContent.length === 0) {
    alert('请先添加本周的日报内容')
    return
  }
  
  isGenerating.value = true
  generatedContent.value = ''
  let markdownBuffer = ''
  
  try {
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = currentWeekNumber.value
    
    // 计算本周开始和结束日期
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)
    
    const requestData = {
      templateId: selectedTemplateId.value || undefined,
      dailyLogs: logsWithContent.map(day => ({
        date: day.date,
        content: day.content
      })),
      year,
      weekNumber,
      startDate: monday.toISOString().split('T')[0],
      endDate: friday.toISOString().split('T')[0],
    }
    
    // 使用 fetch 接收流式响应
    const config = useRuntimeConfig()
    const token = useCookie('auth_token').value
    const response = await fetch(`${config.public.apiBaseUrl}/weekly-reports/generate-with-template/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
    
    if (!response.ok) {
      throw new Error('生成失败')
    }
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    // 动态导入 marked 库
    const { marked } = await import('marked')
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                markdownBuffer += data.content
                // 实时将 Markdown 转换为 HTML
                generatedContent.value = marked(markdownBuffer) as string
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    }
    
    isGenerating.value = false
  } catch (error) {
    console.error('生成周报失败:', error)
    alert('生成周报失败，请稍后重试')
    isGenerating.value = false
  }
}

// 保存生成的周报
const handleSaveGeneratedReport = async () => {
  if (!generatedContent.value || savingReport.value) return
  
  savingReport.value = true
  try {
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = currentWeekNumber.value
    
    // 计算本周开始和结束日期
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)
    
    // 生成摘要（去除 HTML 标签）
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = generatedContent.value
    const summary = (tempDiv.textContent || tempDiv.innerText || '').substring(0, 200)
    
    // 检查是否已存在该周的周报
    const existingReports = await weeklyReport.getAll()
    const existingReport = existingReports.data.find(
      r => r.year === year && r.weekNumber === weekNumber
    )
    
    if (existingReport) {
      // 更新现有周报
      await weeklyReport.update(existingReport.id, {
        content: generatedContent.value,
        summary,
        startDate: monday.toISOString().split('T')[0],
        endDate: friday.toISOString().split('T')[0],
      })
    } else {
      // 创建新周报
      await weeklyReport.create({
        title: `第${weekNumber}周工作周报`,
        content: generatedContent.value,
        summary,
        year,
        weekNumber,
        startDate: monday.toISOString().split('T')[0] || '',
        endDate: friday.toISOString().split('T')[0] || '',
      })
    }
    
    // 刷新最近周报列表
    await loadRecentReports()
    closeGenerateModal()
  } catch (error) {
    console.error('保存周报失败:', error)
    alert('保存周报失败，请稍后重试')
  } finally {
    savingReport.value = false
  }
}

// 查看最近周报
const viewRecentReport = async (id: number) => {
  try {
    const report = await weeklyReport.getOne(id)
    viewingReport.value = report
    reportEditTitle.value = report.title
    reportEditContent.value = report.content
    showReportViewModal.value = true
  } catch (error) {
    console.error('加载周报失败:', error)
  }
}

// 关闭查看周报弹窗
const closeReportViewModal = () => {
  showReportViewModal.value = false
  viewingReport.value = null
  reportEditTitle.value = ''
  reportEditContent.value = ''
}

// 格式化周报日期范围
const formatReportDateRange = (start: string, end: string) => {
  if (!start || !end) return ''
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日`
  const endStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`
  return `${startStr} - ${endStr}`
}

// 保存周报编辑
const handleSaveReportFromHome = async () => {
  if (!viewingReport.value || savingReport.value || !reportEditTitle.value.trim()) return
  
  savingReport.value = true
  try {
    await weeklyReport.update(viewingReport.value.id, {
      title: reportEditTitle.value,
      content: reportEditContent.value
    })
    
    // 更新本地数据
    const index = recentReports.value.findIndex(r => r.id === viewingReport.value.id)
    if (index !== -1) {
      recentReports.value[index].title = reportEditTitle.value
    }
    
    closeReportViewModal()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    savingReport.value = false
  }
}

// 删除周报
const handleDeleteReportFromHome = async () => {
  if (!viewingReport.value) return
  if (!confirm('确定要删除这份周报吗？')) return
  
  try {
    await weeklyReport.remove(viewingReport.value.id)
    recentReports.value = recentReports.value.filter(r => r.id !== viewingReport.value.id)
    closeReportViewModal()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 退出对话模式
const exitChatMode = () => {
  chatMode.value = false
  pendingQuestion.value = ''
}

// 登录成功后刷新数据
const handleAuthSuccess = async () => {
  await initAuth()
  await Promise.all([loadWeekLogs(), loadRecentReports()])
}

// 初始化
onMounted(async () => {
  await initAuth()
  if (isLoggedIn.value) {
    await Promise.all([loadWeekLogs(), loadRecentReports()])
  }
})
</script>

<style scoped>
/* 主内容淡出动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 对话模式滑入动画 */
.chat-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
