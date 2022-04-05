import { likeAAlbum } from '@/api/album'
import type { FetchUserAlbumsParams, FetchUserAlbumsResponse } from '@/api/user'
import { UserApiNames, fetchUserAlbums } from '@/api/user'
import { useQueryClient } from 'react-query'
import useUser from './useUser'

export default function useUserAlbums(params: FetchUserAlbumsParams = {}) {
  const { data: user } = useUser()
  return useQuery(
    [UserApiNames.FETCH_USER_ALBUMS, user?.profile?.userId ?? 0],
    () => fetchUserAlbums(params),
    {
      refetchOnWindowFocus: true,
      placeholderData: (): FetchUserAlbumsResponse | undefined =>
        window.ipcRenderer?.sendSync('getApiCacheSync', {
          api: 'album/sublist',
          query: params,
        }),
    }
  )
}

export const useMutationLikeAAlbum = () => {
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  const { data: userAlbums } = useUserAlbums({ limit: 2000 })
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FETCH_USER_ALBUMS, uid]

  return useMutation(
    async (album: Album) => {
      if (!album.id || userAlbums?.data === undefined) {
        throw new Error('album id is required or userAlbums is undefined')
      }
      const response = await likeAAlbum({
        id: album.id,
        t: userAlbums?.data.findIndex(a => a.id === album.id) > -1 ? 2 : 1,
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onMutate: async album => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(key)

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(key)

        // Optimistically update to the new value
        queryClient.setQueryData(key, old => {
          const userAlbums = old as FetchUserAlbumsResponse
          const albums = userAlbums.data
          const newAlbums =
            albums.findIndex(a => a.id === album.id) > -1
              ? albums.filter(a => a.id !== album.id)
              : [...albums, album]
          return {
            ...userAlbums,
            data: newAlbums,
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
