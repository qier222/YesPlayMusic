<script setup lang="ts">
const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  isRounded: {
    type: Boolean,
    default: false,
  },
})

const shadowStyles = {
  backgroundImage: `url("${props.imageUrl}")`,
}
</script>

<template>
  <div class="group relative z-0">
    <!-- Neon shadow -->
    <div
      class="absolute top-2 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-xl bg-cover opacity-0 blur-lg filter transition duration-300 group-hover:opacity-60"
      :class="{
        'rounded-full': isRounded,
        'rounded-xl': !isRounded,
      }"
      :style="shadowStyles"
    ></div>

    <!-- The cover -->
    <img
      class="box-content aspect-square h-full w-full border border-black border-opacity-5"
      :class="{
        'rounded-full': isRounded,
        'rounded-xl': !isRounded,
      }"
      :src="props.imageUrl"
    />

    <!-- Play button -->
    <div
      class="absolute top-0 hidden h-full w-full place-content-center group-hover:grid"
    >
      <button
        @click.stop=""
        class="btn-pressed-animation grid h-11 w-11 cursor-default place-content-center rounded-full border border-white border-opacity-[.08] bg-white bg-opacity-[.14] text-white backdrop-blur backdrop-filter transition-all hover:bg-opacity-[.44]"
      >
        <SvgIcon class="ml-1 h-4 w-4" name="play" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
