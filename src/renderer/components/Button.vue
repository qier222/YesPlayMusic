<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  shape: {
    type: String as PropType<'square' | 'default'>,
    required: false,
    default: 'default',
  },
  color: {
    type: String as PropType<'primary' | 'gray'>,
    required: false,
    default: 'primary',
  },
  iconColor: {
    type: String as PropType<'primary' | 'gray'>,
    required: false,
    default: 'primary',
  },
  isSkelton: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <div
    class="btn-pressed-animation flex cursor-default items-center rounded-lg text-lg font-semibold"
    :class="{
      'px-4 py-1.5': props.shape === 'default',
      'px-3 py-1.5': props.shape === 'square',
      'bg-brand-100 ': props.color === 'primary',
      'text-brand-500': props.iconColor === 'primary',
      'bg-gray-100 ': props.color === 'gray',
      'text-gray-900': props.iconColor === 'gray',
      'animate-pulse bg-gray-100 text-transparent': props.isSkelton,
    }"
  >
    <slot></slot>
  </div>
</template>
