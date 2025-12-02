<script setup lang="ts">
import { cn } from '~/utils/cn'

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
  <div :class="cn('bg-input-bg rounded-2xl p-5 shadow-input relative border border-gray-100', props.class)">
    <textarea 
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      class="w-full bg-transparent resize-none outline-none text-text-secondary placeholder-text-placeholder h-24 text-base leading-relaxed font-light"
    ></textarea>
    
    <div class="flex justify-between items-end mt-2">
      <div class="flex gap-3">
         <slot name="actions-left" />
      </div>
      
      <div class="flex items-center gap-3">
        <slot name="actions-right" />
      </div>
    </div>
  </div>
</template>
