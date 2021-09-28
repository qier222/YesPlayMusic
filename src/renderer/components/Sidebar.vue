<script setup lang="ts">
import useUserAccount from '@renderer/hooks/useUserAccount'
import useUserPlaylists from '@renderer/hooks/useUserPlaylists'

interface Tab {
  name: string
  icon?: string
  route: string
}
interface PrimaryTab extends Tab {
  icon: string
}

const route = useRoute()
const router = useRouter()

const primaryTabs: PrimaryTab[] = [
  {
    name: 'Home',
    icon: 'home',
    route: '/',
  },
  {
    name: 'Explore',
    icon: 'compass',
    route: '/explore',
  },
  {
    name: 'Library',
    icon: 'music-library',
    route: '/library',
  },
]

const { data: userAccount } = useUserAccount()
const { data: userPlaylists } = useUserPlaylists(
  reactive({
    uid: computed(() => userAccount.value?.account?.id ?? 0),
    offset: 0,
  })
)
</script>

<template>
  <div
    id="sidebar"
    class="grid h-screen max-w-sm border-r border-gray-300/10 bg-gray-50 bg-opacity-[.85]"
  >
    <!-- Primary tabs -->
    <div>
      <div class="app-region-drag h-14"></div>
      <div
        class="btn-hover-animation mx-3 flex items-center rounded-lg px-3 py-2 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06]"
        :class="{
          'text-gray-700 dark:text-white': route.path !== tab.route, //  not active
          'text-brand-500': route.path === tab.route, // active
        }"
        v-for="tab in primaryTabs"
        @click="router.push(tab.route)"
      >
        <SvgIcon class="mr-3 h-6 w-6" :name="tab.icon" />
        <span class="font-semibold">{{ tab.name }}</span>
      </div>
      <div class="mx-5 my-2 h-px bg-black opacity-5"></div>
    </div>

    <!-- Playlists -->
    <div class="overflow-auto pb-[4.6rem]">
      <div
        v-for="playlist in userPlaylists?.playlist || []"
        @click="router.push({ name: 'playlist', params: { id: playlist.id } })"
        :class="{
          'after:scale-100 after:opacity-100':
            route.name === 'playlist' &&
            Number(route.params.id) === playlist.id,
        }"
        class="btn-hover-animation line-clamp-1 my-px mx-3 flex items-center rounded-lg px-3 py-[0.38rem] text-sm text-black opacity-70 transition-colors duration-200 after:scale-[0.97] after:bg-black/[.06]"
      >
        <span class="line-clamp-1">{{ playlist.name }}</span>
      </div>
    </div>
  </div>
</template>
