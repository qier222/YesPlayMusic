<script setup lang="ts">
import type { PropType } from 'vue'

const router = useRouter()
const props = defineProps({
  artists: {
    type: Object as PropType<Artist[]>,
    required: true,
  },
})
</script>

<template>
  <div class="flex truncate">
    <span
      v-for="(artist, index) in artists"
      @click="artist.id && router.push({ name: 'artist', params: { id: artist.id } })"
    >
      <span :class="{'hover:underline cursor-pointer': artist.id}">
        {{ artist.name }}
      </span>
      {{ index < artists.length - 1 ? ', ' : '' }}&nbsp;
    </span>
  </div>
</template>
