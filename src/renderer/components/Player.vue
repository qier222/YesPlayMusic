<script setup lang="ts">
import usePlayer from '@renderer/hooks/usePlayer'
import { resizeImage } from '@renderer/utils/common'
import useUserLikedSongsIDs from '@renderer/hooks/useUserLikedSongsIDs'
import useUserAccount from '@renderer/hooks/useUserAccount'

const router = useRouter()
const player = usePlayer()

// Current playing track
const cover = computed(() => {
  const cover = player?.track?.al.picUrl
  return cover ? resizeImage(cover, 'sm') : null
})
const trackName = computed(() => {
  return player?.track?.name
})

// Is track liked by user
const { data: userAccount } = useUserAccount()
const { data: userLikedSongs } = useUserLikedSongsIDs({
  uid: computed(() => userAccount.value?.account?.id ?? 0),
})
const isLiked = computed(() => {
  return userLikedSongs.value?.ids.includes(player?.track?.id)
})
</script>

<template>
  <div
    id="player"
    class="fixed bottom-0 left-0 right-0 grid h-16 grid-cols-3 grid-rows-1 bg-white bg-opacity-[.86] py-2.5 px-5 backdrop-blur-xl backdrop-saturate-[1.8]"
  >
    <!-- mock slider -->
    <div class="absolute h-[2px] w-full bg-gray-500 bg-opacity-10"></div>

    <!-- Left part -->
    <div class="flex items-center gap-3">
      <!-- Cover -->
      <img
        v-if="cover"
        @click="
          router.push({
            name: 'album',
            params: { id: player?.playlistSource?.id },
          })
        "
        class="aspect-square h-full rounded-md shadow-md"
        :src="cover"
      />
      <!-- Cover placeholder -->
      <div
        v-if="player?.track && !cover"
        class="flex aspect-square h-full items-center justify-center rounded-md bg-black/[.04] shadow-sm"
      >
        <SvgIcon class="h-6 w-6 text-gray-300" name="music-note" />
      </div>

      <div class="flex flex-col justify-center leading-tight">
        <!-- Track name -->
        <div
          v-if="player?.track"
          class="line-clamp-1 font-semibold text-black"
          >{{ trackName }}</div
        >

        <!-- Artists -->
        <div v-if="player?.track" class="mt-0.5 text-xs text-gray-500"
          ><ArtistInline :artists="player?.track?.ar ?? []"
        /></div>
      </div>

      <!-- Like it button -->
      <ButtonIcon v-show="player?.track">
        <SvgIcon
          class="h-4 w-4 text-black"
          :name="isLiked ? 'heart' : 'heart-outline'"
        />
      </ButtonIcon>
    </div>

    <!-- Middle part -->
    <div class="flex items-center justify-center gap-2">
      <!-- Previous -->
      <ButtonIcon :disabled="!player?.track" @click="player?.previousTrack">
        <SvgIcon class="h-4 w-4 text-black" name="previous" />
      </ButtonIcon>
      <!-- Play / Pause -->
      <ButtonIcon
        @click="player?.playOrPause"
        :disabled="!player?.track"
        class="rounded-2xl"
      >
        <SvgIcon
          class="h-[1.5rem] w-[1.5rem] text-black"
          :name="player?.state === 'playing' ? 'pause' : 'play'"
        />
      </ButtonIcon>
      <!-- Next-->
      <ButtonIcon :disabled="!player?.track" @click="player?.nextTrack">
        <SvgIcon class="h-4 w-4 text-black" name="next" />
      </ButtonIcon>
    </div>

    <!-- Right part -->
    <div class="flex items-center justify-end gap-2 pr-2">
      <ButtonIcon>
        <SvgIcon class="h-4 w-4 text-black" name="playlist" />
      </ButtonIcon>
      <ButtonIcon>
        <SvgIcon class="h-4 w-4 text-black" name="repeat" />
      </ButtonIcon>
      <ButtonIcon>
        <SvgIcon class="h-4 w-4 text-black" name="shuffle" />
      </ButtonIcon>
      <ButtonIcon>
        <SvgIcon class="h-4 w-4 text-black" name="volume" />
      </ButtonIcon>
      <ButtonIcon>
        <SvgIcon class="h-4 w-4 text-black" name="chevron-up" />
      </ButtonIcon>
    </div>
  </div>
</template>
