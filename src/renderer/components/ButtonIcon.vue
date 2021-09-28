<script setup lang="ts">
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    class="relative transform cursor-default p-2 transition duration-200"
    :class="{
      'btn-pressed-animation btn-hover-animation after:bg-black/[.06]':
        !disabled,
      'opacity-30': disabled,
    }"
  >
    <slot></slot>
  </button>
</template>
