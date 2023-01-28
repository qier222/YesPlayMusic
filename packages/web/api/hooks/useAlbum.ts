import { fetchAlbum } from '@/web/api/album'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { FetchAlbumParams, AlbumApiNames, FetchAlbumResponse } from '@/shared/api/Album'
import { useQuery } from '@tanstack/react-query'

const fetch = async (params: FetchAlbumParams) => {
  const album = await fetchAlbum(params)
  if (album?.album?.songs) {
    album.album.songs = album.songs
  }
  return album
}

const fetchFromCache = async (params: FetchAlbumParams): Promise<FetchAlbumResponse | undefined> =>
  window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
    api: CacheAPIs.Album,
    query: params,
  })

export default function useAlbum(params: FetchAlbumParams) {
  const key = [AlbumApiNames.FetchAlbum, params]
  return useQuery(
    key,
    () => {
      // fetch from cache as placeholder
      fetchFromCache(params).then(cache => {
        const existsQueryData = reactQueryClient.getQueryData(key)
        if (!existsQueryData && cache) {
          reactQueryClient.setQueryData(key, cache)
        }
      })

      return fetch(params)
    },
    {
      enabled: !!params.id,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    }
  )
}

export function fetchAlbumWithReactQuery(params: FetchAlbumParams) {
  return reactQueryClient.fetchQuery([AlbumApiNames.FetchAlbum, params], () => fetch(params), {
    staleTime: Infinity,
  })
}

export async function prefetchAlbum(params: FetchAlbumParams) {
  if (await fetchFromCache(params)) return
  await reactQueryClient.prefetchQuery([AlbumApiNames.FetchAlbum, params], () => fetch(params), {
    staleTime: Infinity,
  })
}
