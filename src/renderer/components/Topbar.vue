<script setup lang="ts">
import { resizeImage } from '@renderer/utils/common'
import useUserAccount from '@renderer/hooks/useUserAccount'

const { data: userAccount, isLoading } = useUserAccount()

const router = useRouter()
const store = useStore()

// Handle search
const doSearch = () => {
  router.push({ name: 'search' })
}

// Show background when container is scrolled
const mainContainerRef = ref<HTMLElement | null>(
  document.getElementById('mainContainer')
)
onMounted(() => {
  mainContainerRef.value = document.getElementById('mainContainer')
})
const mainContainerScroll = useScroll(mainContainerRef)
</script>

<template>
  <div
    id="topbar"
    class="app-region-drag sticky top-0 z-30 flex h-16 min-h-[4rem] w-full cursor-default items-center justify-between px-8 transition duration-300"
    :class="{
      'bg-white bg-opacity-[.86] backdrop-blur-xl backdrop-saturate-[1.8]':
        !mainContainerScroll.arrivedState.top,
    }"
  >
    <!-- Left part -->
    <div class="flex gap-2">
      <!-- Navigation buttons -->
      <div class="flex gap-1">
        <div
          v-for="action in ['back', 'forward']"
          class="app-region-no-drag btn-hover-animation rounded-lg p-3 text-gray-500 transition duration-300 after:rounded-full after:bg-black/[.06] hover:text-gray-900"
          @click="router[action]()"
        >
          <SvgIcon class="h-4 w-4" :name="action" />
        </div>
      </div>

      <!-- Search input -->
      <div
        class="app-region-no-drag group flex w-[16rem] cursor-text items-center rounded-full bg-gray-500 bg-opacity-[.05] px-3 transition duration-300 hover:bg-opacity-10"
      >
        <SvgIcon
          class="mr-2 h-4 w-4 text-gray-400 transition duration-300 group-hover:text-gray-600"
          name="search"
        />
        <input
          v-model="store.uiStates.searchKeywords"
          @keydown.enter="doSearch"
          type="text"
          class="w-full bg-transparent"
          placeholder="Search"
        />
      </div>
    </div>
    <!-- Right part -->
    <div class="flex items-center gap-3">
      <div
        class="app-region-no-drag btn-hover-animation rounded-lg p-2.5 text-gray-500 transition duration-300 after:rounded-full after:bg-black/[.06] hover:text-gray-900"
      >
        <SvgIcon class="h-5 w-5" name="settings" />
      </div>
      <img
        class="app-region-no-drag h-9 w-9 rounded-full bg-gray-100"
        v-if="!isLoading"
        :src="
          userAccount?.profile?.avatarUrl
            ? resizeImage(userAccount.profile.avatarUrl, 'md')
            : ''
        "
        @click="router.push('/login')"
      />
      <Skeleton v-else class="h-9 w-9 rounded-full" />
    </div>
  </div>
</template>
