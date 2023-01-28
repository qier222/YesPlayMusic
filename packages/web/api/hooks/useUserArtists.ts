import { fetchUserArtists } from '@/web/api/user'
import { UserApiNames, FetchUserArtistsResponse } from '@/shared/api/User'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { likeAArtist } from '../artist'
import { ArtistApiNames, FetchArtistResponse } from '@/shared/api/Artist'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { cloneDeep } from 'lodash-es'

export default function useUserArtists() {
  const key = [UserApiNames.FetchUserArtists]
  return useQuery(
    key,
    () => {
      const existsQueryData = reactQueryClient.getQueryData(key)
      if (!existsQueryData) {
        window.ipcRenderer
          ?.invoke(IpcChannels.GetApiCache, {
            api: CacheAPIs.UserArtists,
          })
          .then(cache => {
            if (cache) reactQueryClient.setQueryData(key, cache)
          })
      }
      return fetchUserArtists()
    },
    {
      refetchOnWindowFocus: true,
    }
  )
}

export const useMutationLikeAArtist = () => {
  const { data: userLikedArtists } = useUserArtists()
  const key = [UserApiNames.FetchUserArtists]

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
        await reactQueryClient.cancelQueries(key)

        // 如果还未获取用户收藏的歌手列表，则获取一次
        if (!reactQueryClient.getQueryData(key)) {
          await reactQueryClient.fetchQuery(key)
        }

        // Snapshot the previous value
        const previousData = reactQueryClient.getQueryData(key) as FetchUserArtistsResponse

        const isLiked = !!previousData?.data.find(a => a.id === artistID)
        const newLikedArtists = cloneDeep(previousData!)

        if (isLiked) {
          newLikedArtists.data = previousData.data.filter(a => a.id !== artistID)
        } else {
          // 从react-query缓存获取歌手信息
          const artistFromCache: FetchArtistResponse | undefined = reactQueryClient.getQueryData([
            ArtistApiNames.FetchArtist,
            { id: artistID },
          ])

          // 从api获取歌手信息
          const artist: FetchArtistResponse | undefined = artistFromCache
            ? artistFromCache
            : await reactQueryClient.fetchQuery([ArtistApiNames.FetchArtist, { id: artistID }])

          if (!artist?.artist) {
            toast.error('Failed to like artist: unable to fetch artist info')
            throw new Error('unable to fetch artist info')
          }
          newLikedArtists.data.unshift(artist.artist)

          // Optimistically update to the new value
          reactQueryClient.setQueriesData(key, newLikedArtists)
        }

        reactQueryClient.setQueriesData(key, newLikedArtists)

        // Return a context object with the snapshotted value
        return { previousData }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onSettled: (data, error, artistID, context) => {
        if (data?.code !== 200) {
          reactQueryClient.setQueryData(key, (context as any).previousData)
          toast((error as any).toString())
        }
      },
    }
  )
}
