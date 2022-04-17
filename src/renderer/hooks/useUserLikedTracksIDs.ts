import { likeATrack } from '@/renderer/api/track'
import useUser from './useUser'
import { useQueryClient } from 'react-query'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import { fetchUserLikedTracksIDs } from '../api/user'
import {
  FetchUserLikedTracksIDsResponse,
  UserApiNames,
} from '@/shared/api/User'

export default function useUserLikedTracksIDs() {
  const { data: user } = useUser()
  const uid = user?.account?.id ?? 0

  return useQuery(
    [UserApiNames.FetchUserLikedTracksIds, uid],
    () => fetchUserLikedTracksIDs({ uid }),
    {
      enabled: !!(uid && uid !== 0),
      refetchOnWindowFocus: true,
      placeholderData: (): FetchUserLikedTracksIDsResponse | undefined =>
        window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
          api: APIs.Likelist,
          query: {
            uid,
          },
        }),
    }
  )
}

export const useMutationLikeATrack = () => {
  const queryClient = useQueryClient()
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
        await queryClient.cancelQueries(key)

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(key)

        // Optimistically update to the new value
        queryClient.setQueryData(key, old => {
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
        queryClient.setQueryData(key, (context as any).previousData)
        toast((err as any).toString())
      },
    }
  )
}
