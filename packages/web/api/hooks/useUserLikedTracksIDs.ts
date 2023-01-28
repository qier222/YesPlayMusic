import { likeATrack } from '@/web/api/track'
import useUser from './useUser'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { fetchUserLikedTracksIDs } from '../user'
import { FetchUserLikedTracksIDsResponse, UserApiNames } from '@/shared/api/User'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useUserLikedTracksIDs() {
  const { data: user } = useUser()
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FetchUserLikedTracksIds, uid]

  return useQuery(
    key,
    () => {
      const existsQueryData = reactQueryClient.getQueryData(key)
      if (!existsQueryData) {
        window.ipcRenderer
          ?.invoke(IpcChannels.GetApiCache, {
            api: CacheAPIs.Likelist,
            query: {
              uid,
            },
          })
          .then(cache => {
            if (cache) reactQueryClient.setQueryData(key, cache)
          })
      }

      return fetchUserLikedTracksIDs({ uid })
    },
    {
      enabled: !!(uid && uid !== 0),
      refetchOnWindowFocus: true,
    }
  )
}

export const useMutationLikeATrack = () => {
  const { data: user } = useUser()
  const { data: userLikedSongs } = useUserLikedTracksIDs()
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FetchUserLikedTracksIds, uid]

  return useMutation(
    async (trackID: number) => {
      if (!trackID || userLikedSongs?.ids === undefined) {
        throw new Error('trackID is required or userLikedSongs is undefined')
      }
      const response = await likeATrack({
        id: trackID,
        like: !userLikedSongs.ids.includes(trackID),
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onMutate: async trackID => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await reactQueryClient.cancelQueries(key)

        // Snapshot the previous value
        const previousData = reactQueryClient.getQueryData(key)

        // Optimistically update to the new value
        reactQueryClient.setQueryData(key, old => {
          const likedSongs = old as FetchUserLikedTracksIDsResponse
          const ids = likedSongs.ids
          const newIds = ids.includes(trackID)
            ? ids.filter(id => id !== trackID)
            : [...ids, trackID]
          return {
            ...likedSongs,
            ids: newIds,
          }
        })

        // Return a context object with the snapshotted value
        return { previousData }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, trackID, context) => {
        reactQueryClient.setQueryData(key, (context as any).previousData)
        toast((err as any).toString())
      },
    }
  )
}
