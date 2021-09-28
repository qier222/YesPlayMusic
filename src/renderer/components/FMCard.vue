<script setup lang="ts">
import { average } from 'color.js'
import { colord } from 'colord'

const background = ref<string>('')
const coverUrl = ref<string>(
  // 'https://p2.music.126.net/-_zf-SC10UEHxCbJB5h0PA==/109951165985694735.jpg?param=512y512'
  // 'https://p1.music.126.net/2jls9nqjYYlQEybpHPaccw==/109951164706184612.jpg?param=512y512'
  'https://p1.music.126.net/lEzPSOjusKaRXKXT3987lQ==/109951166035876388.jpg?param=512y512'
  // 'https://p1.music.126.net/6CB6Jsmb7k7qiJqfMY5Row==/109951164260234943.jpg?param=512y512'
  // 'https://p2.music.126.net/AhYP9TET8l-VSGOpWAKZXw==/109951165134386387.jpg?param=512y512'
  // 'https://p2.music.126.net/vCTNT88k1rnflXtDdmWT9g==/109951165359041202.jpg?param=512y512'
  // 'https://p2.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg?param=512y512'
)

average(coverUrl.value, { amount: 1, format: 'hex', sample: 1 }).then(color => {
  const to = colord(color as string)
    .darken(0.15)
    .rotate(-5)
    .toHex()
  background.value = `linear-gradient(to bottom right, ${color}, ${to})`
})
</script>

<template>
  <div
    class="relative flex h-[198px] overflow-hidden rounded-2xl p-4"
    :style="{ background }"
  >
    <!-- cover -->
    <img class="rounded-xl shadow-2xl" :src="coverUrl" />

    <!-- track info  -->
    <div class="ml-5 flex w-full flex-col justify-between text-white">
      <div>
        <div class="text-xl font-semibold">How Can I Make It OK?</div>
        <div class="opacity-75">Wolf Alice</div>
      </div>
      <div class="flex items-center justify-between">
        <!-- buttons -->
        <div>
          <button
            v-for="action in ['dislike', 'play', 'next']"
            class="btn-pressed-animation btn-hover-animation mr-1 cursor-default rounded-lg p-2 transition duration-200 after:bg-white/10"
            ><SvgIcon :name="action" class="h-5 w-5"
          /></button>
        </div>

        <!-- fm symbol  -->
        <div class="right-4 bottom-5 flex text-white opacity-20">
          <SvgIcon name="fm" class="mr-2 h-5 w-5" />
          <span class="font-semibold">私人FM</span>
        </div>
      </div>
    </div>
  </div>
</template>
