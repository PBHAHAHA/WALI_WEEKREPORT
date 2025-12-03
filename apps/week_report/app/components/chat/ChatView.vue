<script setup lang="ts">
import { Send, ArrowLeft, Sparkles, User } from 'lucide-vue-next'
import { marked } from 'marked'
import Button from '~/components/ui/Button/Button.vue'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  visible: boolean
  initialQuestion?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const ai = useAi()

const inputValue = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked(content)
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 发送消息（流式）
const sendMessage = async () => {
  if (!inputValue.value.trim() || loading.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputValue.value,
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  const question = inputValue.value
  inputValue.value = ''
  scrollToBottom()

  loading.value = true

  // 创建 AI 消息占位
  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    timestamp: new Date(),
  }
  messages.value.push(assistantMessage)

  try {
    await ai.askStream(question, (chunk) => {
      // 流式更新内容
      assistantMessage.content += chunk
      scrollToBottom()
    })
  } catch (error) {
    assistantMessage.content = '抱歉，请求失败，请稍后重试。'
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 处理回车发送
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 返回
const handleBack = () => {
  emit('close')
}

// 处理初始问题
watch(() => props.visible, (visible) => {
  if (visible && props.initialQuestion) {
    inputValue.value = props.initialQuestion
    nextTick(() => {
      sendMessage()
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="chat-view h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
      <button
        @click="handleBack"
        class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h2 class="font-medium text-gray-900">AI 助手</h2>
        <p class="text-xs text-gray-500">可以帮你写日报、生成周报、回答问题</p>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-6 py-4 space-y-4"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles class="w-8 h-8 text-primary" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">你好，有什么可以帮你？</h3>
        <p class="text-sm text-gray-500 max-w-sm">
          我可以帮你撰写日报、生成周报、回答工作相关问题，或者只是聊聊天。
        </p>
        
        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-2 mt-6 justify-center">
          <button
            v-for="action in ['帮我写今天的日报', '根据本周日报生成周报', '如何提高工作效率']"
            :key="action"
            @click="inputValue = action"
            class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
          >
            {{ action }}
          </button>
        </div>
      </div>

      <!-- Message List -->
      <template v-else>
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex gap-3"
          :class="message.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            :class="message.role === 'user' ? 'bg-primary' : 'bg-gray-100'"
          >
            <User v-if="message.role === 'user'" class="w-4 h-4 text-white" />
            <Sparkles v-else class="w-4 h-4 text-primary" />
          </div>

          <!-- Content -->
          <div
            class="max-w-[70%] px-4 py-3 rounded-2xl"
            :class="message.role === 'user' 
              ? 'bg-primary text-white rounded-br-md' 
              : 'bg-gray-100 text-gray-900 rounded-bl-md'"
          >
            <div 
              v-if="message.role === 'assistant'" 
              class="prose prose-sm max-w-none markdown-content"
              v-html="renderMarkdown(message.content)" 
            />
            <p v-else class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>

        <!-- Loading (only show when no assistant message is being streamed) -->
        <div v-if="loading && (!messages.length || messages[messages.length - 1]?.role !== 'assistant' || messages[messages.length - 1]?.content)" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Sparkles class="w-4 h-4 text-primary" />
          </div>
          <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input -->
    <div class="px-6 py-4 border-t border-gray-100">
      <div class="flex items-end gap-3">
        <div class="flex-1 relative">
          <textarea
            v-model="inputValue"
            @keydown="handleKeydown"
            placeholder="输入消息..."
            rows="1"
            class="w-full px-4 py-3 pr-12 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            :class="{ 'ring-2 ring-primary/20': inputValue }"
          />
        </div>
        <Button
          variant="primary"
          class="rounded-full w-11 h-11 p-0 flex items-center justify-center"
          :disabled="!inputValue.trim() || loading"
          @click="sendMessage"
        >
          <Send class="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  background: white;
}

textarea {
  max-height: 120px;
  min-height: 44px;
}

/* 自动调整高度 */
textarea {
  field-sizing: content;
}

/* Markdown 内容样式 */
.markdown-content :deep(h1) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.markdown-content :deep(h2) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.markdown-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
}
</style>
