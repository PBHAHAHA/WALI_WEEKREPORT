<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Undo, Redo } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  minHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '开始编辑...',
  minHeight: '200px',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="rich-editor border border-gray-200 rounded-xl overflow-hidden">
    <!-- Toolbar -->
    <div v-if="editor" class="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('bold') ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="加粗"
      >
        <Bold class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('italic') ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="斜体"
      >
        <Italic class="w-4 h-4" />
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1" />
      
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="标题1"
      >
        <Heading1 class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="标题2"
      >
        <Heading2 class="w-4 h-4" />
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1" />
      
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('bulletList') ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="无序列表"
      >
        <List class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['p-1.5 rounded hover:bg-gray-200 transition-colors', editor.isActive('orderedList') ? 'bg-gray-200 text-primary' : 'text-gray-600']"
        title="有序列表"
      >
        <ListOrdered class="w-4 h-4" />
      </button>
      
      <div class="flex-1" />
      
      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        title="撤销"
      >
        <Undo class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        title="重做"
      >
        <Redo class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Editor Content -->
    <EditorContent 
      :editor="editor" 
      class="px-4 py-3"
      :style="{ minHeight: minHeight }"
    />
  </div>
</template>

<style>
.rich-editor .ProseMirror {
  min-height: v-bind(minHeight);
  outline: none;
}

.rich-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.rich-editor .ProseMirror h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rich-editor .ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rich-editor .ProseMirror ul,
.rich-editor .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-editor .ProseMirror li {
  margin: 0.25rem 0;
}

.rich-editor .ProseMirror p {
  margin: 0.5rem 0;
}
</style>
