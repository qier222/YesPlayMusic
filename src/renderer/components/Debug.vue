<script setup lang="ts">
const { isSupported, memory } = useMemory()
const size = (v: number) => {
  const kb = v / 1024 / 1024
  return `${kb.toFixed(2)} MB`
}
</script>

<template>
  <div class="bg-opacity fixed right-0 bottom-[4rem] z-10 bg-white text-xs">
    <div v-if="memory && isSupported"
      >Memory:{{ size(memory.usedJSHeapSize) }} /
      {{ size(memory.totalJSHeapSize) }} / {{ size(memory.jsHeapSizeLimit) }}
    </div>
  </div>
</template>
