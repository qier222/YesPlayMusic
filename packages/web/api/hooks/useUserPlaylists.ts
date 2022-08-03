import { likeAPlaylist } from '@/web/api/playlist'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useUser from './useUser'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import { fetchUserPlaylists } from '@/web/api/user'
import { FetchUserPlaylistsResponse, UserApiNames } from '@/shared/api/User'
import toast from 'react-hot-toast'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { cloneDeep } from 'lodash-es'
import { FetchPlaylistResponse, PlaylistApiNames } from '@/shared/api/Playlists'

export default function useUserPlaylists() {
  const { data: user } = useUser()
  const uid = user?.profile?.userId ?? 0

  const params = {
    uid: uid,
    offset: 0,
    limit: 2000,
  }

  return useQuery(
    [UserApiNames.FetchUserPlaylists, uid],
    async () => {
      if (!params.uid) {
        throw new Error('请登录后再请求用户收藏的歌单')
      }
      const data = await fetchUserPlaylists(params)
      return data
    },
    {
      enabled: !!(
        !!params.uid &&
        params.uid !== 0 &&
        params.offset !== undefined
      ),
      refetchOnWindowFocus: true,
      placeholderData: (): FetchUserPlaylistsResponse =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.UserPlaylist,
          query: {
            uid: params.uid,
          },
        }),
    }
  )
}

export const useMutationLikeAPlaylist = () => {
  const { data: user } = useUser()
  const { data: userPlaylists } = useUserPlaylists()
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FetchUserPlaylists, uid]

  return useMutation(
    async (playlistID: number) => {
      if (!playlistID || userPlaylists?.playlist === undefined) {
        throw new Error('playlist id is required or userPlaylists is undefined')
      }
      const response = await likeAPlaylist({
        id: playlistID,
        t:
          userPlaylists.playlist.findIndex(p => p.id === playlistID) > -1
            ? 2
            : 1,
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onMutate: async playlistID => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await reactQueryClient.cancelQueries(key)

        console.log(reactQueryClient.getQueryData(key))

        // 如果还未获取用户收藏的专辑列表，则获取一次
        if (!reactQueryClient.getQueryData(key)) {
          await reactQueryClient.fetchQuery(key)
        }

        // Snapshot the previous value
        const previousData = reactQueryClient.getQueryData(
          key
        ) as FetchUserPlaylistsResponse

        const isLiked = !!previousData?.playlist.find(p => p.id === playlistID)
        const newPlaylists = cloneDeep(previousData!)

        console.log({ isLiked })

        if (isLiked) {
          newPlaylists.playlist = previousData.playlist.filter(
            p => p.id !== playlistID
          )
        } else {
          // 从react-query缓存获取歌单信息

          const playlistFromCache: FetchPlaylistResponse | undefined =
            reactQueryClient.getQueryData([
              PlaylistApiNames.FetchPlaylist,
              { id: playlistID },
            ])

          // 从api获取歌单信息
          const playlist: FetchPlaylistResponse | undefined = playlistFromCache
            ? playlistFromCache
            : await reactQueryClient.fetchQuery([
                PlaylistApiNames.FetchPlaylist,
                { id: playlistID },
              ])

          if (!playlist?.playlist) {
            toast.error(
              'Failed to like playlist: unable to fetch playlist info'
            )
            throw new Error('unable to fetch playlist info')
          }
          newPlaylists.playlist.splice(1, 0, playlist.playlist)

          // Optimistically update to the new value
          reactQueryClient.setQueriesData(key, newPlaylists)
        }

        reactQueryClient.setQueriesData(key, newPlaylists)

        console.log({ newPlaylists })

        // Return a context object with the snapshotted value
        return { previousData }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onSettled: (data, error, playlistID, context) => {
        if (data?.code !== 200) {
          reactQueryClient.setQueryData(key, (context as any).previousData)
          toast((error as any).toString())
        }
      },
    }
  )
}
