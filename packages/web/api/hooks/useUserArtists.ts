import { fetchUserArtists } from '@/web/api/user'
import { UserApiNames, FetchUserArtistsResponse } from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { likeAArtist } from '../artist'
import { ArtistApiNames, FetchArtistResponse } from '@/shared/api/Artist'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { cloneDeep } from 'lodash-es'

const KEYS = {
  useUserArtists: [UserApiNames.FetchUserArtists],
}

export default function useUserArtists() {
  return useQuery(KEYS.useUserArtists, fetchUserArtists, {
    refetchOnWindowFocus: true,
    placeholderData: (): FetchUserArtistsResponse =>
      window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
        api: APIs.UserArtists,
      }),
  })
}

export const useMutationLikeAArtist = () => {
  const { data: userLikedArtists } = useUserArtists()

  return useMutation(
    async (artistID: number) => {
      if (!artistID || !userLikedArtists?.data) {
        throw new Error('artistID is required or userLikedArtists is undefined')
      }
      const response = await likeAArtist({
        id: artistID,
        like: !userLikedArtists.data.find(a => a.id === artistID),
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onMutate: async artistID => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await reactQueryClient.cancelQueries(KEYS.useUserArtists)

        // 如果还未获取用户收藏的歌手列表，则获取一次
        if (!reactQueryClient.getQueryData(KEYS.useUserArtists)) {
          await reactQueryClient.fetchQuery(KEYS.useUserArtists)
        }

        // Snapshot the previous value
        const previousData = reactQueryClient.getQueryData(
          KEYS.useUserArtists
        ) as FetchUserArtistsResponse

        const isLiked = !!previousData?.data.find(a => a.id === artistID)
        const newLikedArtists = cloneDeep(previousData!)

        if (isLiked) {
          newLikedArtists.data = previousData.data.filter(
            a => a.id !== artistID
          )
        } else {
          // 从react-query缓存获取歌手信息
          const artistFromCache: FetchArtistResponse | undefined =
            reactQueryClient.getQueryData([
              ArtistApiNames.FetchArtist,
              { id: artistID },
            ])

          // 从api获取歌手信息
          const artist: FetchArtistResponse | undefined = artistFromCache
            ? artistFromCache
            : await reactQueryClient.fetchQuery([
                ArtistApiNames.FetchArtist,
                { id: artistID },
              ])

          if (!artist?.artist) {
            toast.error('Failed to like artist: unable to fetch artist info')
            throw new Error('unable to fetch artist info')
          }
          newLikedArtists.data.unshift(artist.artist)

          // Optimistically update to the new value
          reactQueryClient.setQueriesData(KEYS.useUserArtists, newLikedArtists)
        }

        reactQueryClient.setQueriesData(KEYS.useUserArtists, newLikedArtists)

        // Return a context object with the snapshotted value
        return { previousData }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onSettled: (data, error, artistID, context) => {
        if (data?.code !== 200) {
          reactQueryClient.setQueryData(
            KEYS.useUserArtists,
            (context as any).previousData
          )
          toast((error as any).toString())
        }
      },
    }
  )
}
