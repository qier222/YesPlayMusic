import type { FetchUserLikedTracksIDsResponse } from '@/api/user'
import { UserApiNames, fetchUserLikedTracksIDs } from '@/api/user'
import { likeATrack } from '@/api/track'
import useUser from './useUser'
import { useQueryClient } from 'react-query'

export default function useUserLikedTracksIDs() {
  const { data: user } = useUser()
  const uid = user?.account?.id ?? 0

  return useQuery(
    [UserApiNames.FETCH_USER_LIKED_TRACKS_IDS, uid],
    () => fetchUserLikedTracksIDs({ uid }),
    {
      enabled: !!(uid && uid !== 0),
      refetchOnWindowFocus: true,
      placeholderData: (): FetchUserLikedTracksIDsResponse | undefined =>
        window.ipcRenderer?.sendSync('getApiCacheSync', {
          api: 'likelist',
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
  const key = [UserApiNames.FETCH_USER_LIKED_TRACKS_IDS, uid]

  return useMutation(
    (trackID: number) => {
      if (!trackID || userLikedSongs?.ids === undefined) {
        throw new Error('trackID is required or userLikedSongs is undefined')
      }
      return likeATrack({
        id: trackID,
        like: !userLikedSongs.ids.includes(trackID),
      })
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
          console.log(trackID, ids.includes(trackID), ids, newIds)
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
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(key)
      },
    }
  )
}
