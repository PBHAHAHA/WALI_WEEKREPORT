<script setup lang="ts">
import { cn } from '~/utils/cn'
import { Plus } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  placeholder: 'Type something...',
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div :class="cn('bg-white rounded-3xl p-3 shadow border border-gray-100/50', props.class)">
    <div class="bg-[#EFF5F2] rounded-2xl p-5 mb-3 transition-colors hover:bg-[#E8F0EB] group">
      <textarea 
        :value="modelValue"
        @input="updateValue"
        :placeholder="placeholder"
        class="w-full bg-transparent resize-none outline-none text-text-main placeholder-gray-400/80 h-28 text-base leading-relaxed font-light"
      ></textarea>
    </div>
    
    <div class="flex justify-between items-center px-2 pb-1">
      <div class="flex gap-3">
         <slot name="actions-left">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                <span class="w-3.5 h-3.5 flex items-center justify-center">✨</span>
                <span class="font-bold">WALI_V1.0</span>
             </div>
         </slot>
      </div>
      
      <div class="flex items-center gap-3">
        <button class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary hover:border-primary/20 transition-all shadow-sm" title="添加附件">
            <Plus class="w-5 h-5" />
        </button>
        <slot name="actions-right" />
      </div>
    </div>
  </div>
</template>
