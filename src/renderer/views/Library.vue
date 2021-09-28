<script setup lang="ts">
import useUserAccount from '@renderer/hooks/useUserAccount'
import useUserPlaylists from '@renderer/hooks/useUserPlaylists'
import useTracks from '@renderer/hooks/useTracks'
import usePlaylist from '@renderer/hooks/usePlaylist'
import { resizeImage } from '@renderer/utils/common'

const store = useStore()
const { data: userAccount, isLoading: isLoadingAccount } = useUserAccount()
const { data: userPlaylists, isLoading: isLoadingPlaylists } = useUserPlaylists(
  reactive({
    uid: computed(() => userAccount.value?.account?.id ?? 0),
    offset: 0,
  })
)

const { data: likedSongPlaylist } = usePlaylist(
  reactive({ id: computed(() => userPlaylists.value?.playlist[0].id ?? 0) }),
  true
)

const { data: userLikedSongs, isLoading: isLoadingLikedTracks } = useTracks(
  reactive({
    ids: computed(() => {
      return (
        likedSongPlaylist.value?.playlist?.tracks?.map(track => track.id) || []
      )
    }),
  })
)

const tabs: { name: string; id: string }[] = [
  {
    name: 'Playlists',
    id: 'playlists',
  },
  {
    name: 'Albums',
    id: 'albums',
  },
  {
    name: 'Artists',
    id: 'artists',
  },
  {
    name: 'Videos',
    id: 'videos',
  },
]
</script>

<template>
  <div>
    <!-- xxx's Library -->
    <div class="my-6 flex items-center text-3xl font-bold">
      <img
        v-if="!isLoadingAccount"
        class="mr-3 h-9 w-9 rounded-full"
        :src="
          userAccount?.profile?.avatarUrl
            ? resizeImage(userAccount.profile.avatarUrl, 'md')
            : ''
        "
      />
      <Skeleton v-else class="mr-3 h-9 w-9 rounded-full" />

      <span class="pb-1">{{ userAccount?.profile?.nickname }}'s Library </span>
    </div>

    <!-- Liked songs -->
    <div class="flex items-stretch">
      <!-- Liked songs card -->
      <div
        class="mr-4 flex h-[13.75rem] min-w-[24rem] flex-col justify-between rounded-2xl bg-brand-100 px-5 py-4 text-brand-500"
      >
        <ol class="text-sm">
          <li>Got the heat and the thrill</li>
          <li>Give you more than any pill</li>
          <li>Never running out of juice</li>
        </ol>
        <div class="flex items-end justify-between">
          <div>
            <div class="text-xl font-bold">Liked Songs</div>
            <div class="mt-1">
              {{ likedSongPlaylist?.playlist.trackCount || 0 }} liked songs
            </div>
          </div>
          <button
            class="flex h-11 w-11 transform cursor-default items-center justify-center rounded-full bg-brand-500 text-brand-100 shadow-lg transition duration-200 hover:scale-105 active:scale-95"
          >
            <SvgIcon class="ml-1 h-4 w-4 text-brand-100" name="play" />
          </button>
        </div>
      </div>
      <!-- Liked songs list -->
      <TrackList
        :tracks="userLikedSongs?.songs.slice(0, 8) || []"
        :col="2"
        :isLoading="isLoadingLikedTracks"
      />
    </div>

    <!-- Tabs -->
    <div class="mt-8 mb-4 flex gap-3.5">
      <div
        v-for="tab in tabs"
        class="btn-hover-animation rounded-lg px-3.5 py-1.5 text-lg font-semibold text-gray-600 after:bg-gray-100"
        :class="{
          'bg-gray-100': tab.id === 'playlists',
        }"
        >{{ tab.name }}</div
      >
    </div>

    <div>
      <!-- Playlist tab content -->
      <div>
        <CoverRow
          :playlists="userPlaylists?.playlist.slice(1) || []"
          subtitle="creator"
          :isSkeleton="isLoadingPlaylists"
        />
      </div>
    </div>
  </div>
</template>
