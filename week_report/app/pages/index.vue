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
          <h1 class="text-[42px] font-medium text-text-main mb-3 tracking-tight">你好，{{ user?.nickname || '用户' }}</h1>
          <p class="text-xl text-text-muted font-light tracking-wide">今天的工作进展如何？记录一下吧。</p>
        </div>

        <!-- AI Input Section -->
        <div class="mb-20">
          <ScriptInput v-model="aiQuestion" placeholder="向 AI 提问，或让 AI 帮你生成周报...">
            <template #actions-right>
              <Button 
                variant="primary" 
                class="rounded-full pl-5 pr-4 py-2 bg-primary hover:bg-primary-hover text-white"
                :disabled="!aiQuestion.trim()"
                @click="enterChatWithQuestion"
              >
                <span class="text-sm font-medium">发送</span>
                <Send class="w-4 h-4 opacity-80 ml-1" />
              </Button>
            </template>
          </ScriptInput>
        </div>

    <!-- Weekly Overview -->
    <div class="mb-16">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2 text-text-muted">
          <CalendarDays class="w-4 h-4" />
          <span class="text-xs font-medium">本周概览 (第 {{ currentWeekNumber }} 周)</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          class="text-xs text-primary hover:text-primary-hover"
          @click="enterChatForWeeklyReport"
        >
          生成周报 <ArrowRight class="w-3 h-3 ml-1" />
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
        <span class="text-xs font-medium">历史周报</span>
      </div>
      
      <div v-if="recentReports.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-5">
         <Card 
          v-for="report in recentReports" 
          :key="report.id"
          :title="report.title"
          :description="report.summary || '暂无摘要'"
          :meta="report.startDate"
        />
      </div>
      <div v-else class="text-center py-8 text-gray-400">
        暂无周报记录
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import { Send, CalendarDays, ArrowRight, FileText } from 'lucide-vue-next'
import Button from '~/components/ui/Button/Button.vue'
import Card from '~/components/ui/Card/Card.vue'
import ScriptInput from '~/components/ui/Input/ScriptInput.vue'
import Modal from '~/components/ui/Modal/Modal.vue'
import RichEditor from '~/components/ui/RichEditor/RichEditor.vue'
import ChatView from '~/components/chat/ChatView.vue'
import { cn } from '~/utils/cn'

const { user, initAuth } = useAuth()
const dailyLog = useDailyLog()
const weeklyReport = useWeeklyReport()

// 类型定义
interface WeekDay {
  dayName: string
  date: string
  displayDate: string
  content: string
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

// 获取当前周数
const currentWeekNumber = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff / oneWeek) + 1)
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

// 点击日期卡片 - 打开弹窗
const handleDayClick = (day: WeekDay) => {
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
  if (!aiQuestion.value.trim()) return
  pendingQuestion.value = aiQuestion.value
  aiQuestion.value = ''
  chatMode.value = true
}

// 进入对话模式（生成周报）
const enterChatForWeeklyReport = () => {
  const logsWithContent = weekDays.value.filter(day => day.content)
  if (logsWithContent.length === 0) {
    pendingQuestion.value = '帮我生成本周周报'
  } else {
    const logsText = logsWithContent
      .map(day => `${day.date}: ${day.content}`)
      .join('\n')
    pendingQuestion.value = `请根据以下日报内容帮我生成周报：\n\n${logsText}`
  }
  chatMode.value = true
}

// 退出对话模式
const exitChatMode = () => {
  chatMode.value = false
  pendingQuestion.value = ''
}

// 初始化
onMounted(async () => {
  await initAuth()
  await Promise.all([loadWeekLogs(), loadRecentReports()])
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
