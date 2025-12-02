<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount } from 'vue'
import { cn } from '~/utils/cn'
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  class?: string
  editable?: boolean
}>(), {
  editable: true
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable !== false,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || '开始输入...',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose-base lg:prose-lg focus:outline-none max-w-none min-h-[200px]',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && editor.value) {
    editor.value.commands.setContent(newValue, false)
  }
})

watch(() => props.editable, (val) => {
  editor.value?.setEditable(val ?? true)
})

// 监听编辑器初始化，确保 editable 状态正确
watch(editor, (newEditor) => {
  if (newEditor) {
    console.log('Editor initialized, editable:', newEditor.isEditable, 'props.editable:', props.editable)
    // 强制设置 editable 状态
    if (props.editable !== false && !newEditor.isEditable) {
      newEditor.setEditable(true)
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div :class="cn('relative w-full', props.class)">
    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :class="cn('bg-white border border-gray-200 shadow-lg rounded-lg flex overflow-hidden divide-x divide-gray-100')"
    >
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('bold') })"
        title="Bold"
      >
        <Bold class="w-4 h-4" />
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('italic') })"
        title="Italic"
      >
        <Italic class="w-4 h-4" />
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('strike') })"
        title="Strike"
      >
        <Strikethrough class="w-4 h-4" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('heading', { level: 1 }) })"
        title="H1"
      >
        <Heading1 class="w-4 h-4" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('heading', { level: 2 }) })"
        title="H2"
      >
        <Heading2 class="w-4 h-4" />
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('bulletList') })"
        title="Bullet List"
      >
        <List class="w-4 h-4" />
      </button>
       <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="cn('p-2 hover:bg-gray-50 transition-colors text-gray-600', { 'text-primary bg-primary/5': editor.isActive('orderedList') })"
        title="Ordered List"
      >
        <ListOrdered class="w-4 h-4" />
      </button>
    </BubbleMenu>

    <EditorContent :editor="editor" />
  </div>
</template>

<style>

/* Tiptap Placeholder Styles */
.tiptap p.is-editor-empty:first-child::before {
  color: #9ca3af; /* text-gray-400 */
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Custom Typography Styles to match the design */
.tiptap h1 {
  @reference text-2xl font-bold text-text-main mb-4 mt-6;
}
.tiptap h2 {
  @reference text-xl font-bold text-text-main mb-3 mt-5;
}
.tiptap h3 {
  @reference text-lg font-bold text-text-main mb-2 mt-4;
}
.tiptap p {
  @reference text-text-muted leading-relaxed mb-3 font-light;
}
.tiptap ul {
  @reference list-disc pl-5 mb-4 text-text-muted;
}
.tiptap ol {
  @reference list-decimal pl-5 mb-4 text-text-muted;
}
.tiptap blockquote {
  @reference border-l-4 border-gray-200 pl-4 italic text-gray-500 my-4;
}
.tiptap li p {
  @reference mb-0;
}
</style>
