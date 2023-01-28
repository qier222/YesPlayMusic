import { likeAAlbum } from '@/web/api/album'
import { useMutation, useQuery } from '@tanstack/react-query'
import useUser from './useUser'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { FetchUserAlbumsParams, UserApiNames, FetchUserAlbumsResponse } from '@/shared/api/User'
import { fetchUserAlbums } from '../user'
import toast from 'react-hot-toast'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { cloneDeep } from 'lodash-es'
import { AlbumApiNames, FetchAlbumResponse } from '@/shared/api/Album'

export default function useUserAlbums(params: FetchUserAlbumsParams = {}) {
  const { data: user } = useUser()
  const uid = user?.profile?.userId ?? 0
  const key = [UserApiNames.FetchUserAlbums, uid]
  return useQuery(
    key,
    () => {
      const existsQueryData = reactQueryClient.getQueryData(key)
      if (!existsQueryData) {
        window.ipcRenderer
          ?.invoke(IpcChannels.GetApiCache, {
            api: CacheAPIs.UserAlbums,
            query: params,
          })
          .then(cache => {
            if (cache) reactQueryClient.setQueryData(key, cache)
          })
      }

      return fetchUserAlbums(params)
    },
    {
      refetchOnWindowFocus: true,
    }
  )
}

export const useMutationLikeAAlbum = () => {
  const { data: user } = useUser()
  const { data: userAlbums } = useUserAlbums({ limit: 2000 })
  const uid = user?.profile?.userId ?? 0
  const key = [UserApiNames.FetchUserAlbums, uid]

  return useMutation(
    async (albumID: number) => {
      if (!albumID || userAlbums?.data === undefined) {
        throw new Error('album id is required or userAlbums is undefined')
      }
      const response = await likeAAlbum({
        id: albumID,
        t: userAlbums?.data.findIndex(a => a.id === albumID) > -1 ? 2 : 1,
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onMutate: async albumID => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await reactQueryClient.cancelQueries(key)

        console.log(reactQueryClient.getQueryData(key))

        // 如果还未获取用户收藏的专辑列表，则获取一次
        if (!reactQueryClient.getQueryData(key)) {
          await reactQueryClient.fetchQuery(key)
        }

        // Snapshot the previous value
        const previousData = reactQueryClient.getQueryData(key) as FetchUserAlbumsResponse

        const isLiked = !!previousData?.data.find(a => a.id === albumID)
        const newAlbums = cloneDeep(previousData!)

        console.log({ isLiked })

        if (isLiked) {
          newAlbums.data = previousData.data.filter(a => a.id !== albumID)
        } else {
          // 从react-query缓存获取专辑

          console.log({ albumID })

          const albumFromCache: FetchAlbumResponse | undefined = reactQueryClient.getQueryData([
            AlbumApiNames.FetchAlbum,
            { id: albumID },
          ])

          console.log({ albumFromCache })

          // 从api获取专辑
          const album: FetchAlbumResponse | undefined = albumFromCache
            ? albumFromCache
            : await reactQueryClient.fetchQuery([AlbumApiNames.FetchAlbum, { id: albumID }])

          if (!album?.album) {
            toast.error('Failed to like album: unable to fetch album info')
            throw new Error('unable to fetch album info')
          }
          newAlbums.data.unshift(album.album)

          // Optimistically update to the new value
          reactQueryClient.setQueriesData(key, newAlbums)
        }

        reactQueryClient.setQueriesData(key, newAlbums)

        console.log({ newAlbums })

        // Return a context object with the snapshotted value
        return { previousData }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onSettled: (data, error, albumID, context) => {
        if (data?.code !== 200) {
          reactQueryClient.setQueryData(key, (context as any).previousData)
          toast((error as any).toString())
        }
      },
    }
  )
}
