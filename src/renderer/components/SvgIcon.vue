<script setup lang="ts">
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const props = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
})
</script>

<template>
  <svg class="fill-current align-middle" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>
