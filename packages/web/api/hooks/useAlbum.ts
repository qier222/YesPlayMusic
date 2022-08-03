import { fetchAlbum } from '@/web/api/album'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchAlbumParams,
  AlbumApiNames,
  FetchAlbumResponse,
} from '@/shared/api/Album'
import { useQuery } from '@tanstack/react-query'

const fetch = async (params: FetchAlbumParams) => {
  const album = await fetchAlbum(params)
  if (album?.album?.songs) {
    album.album.songs = album.songs
  }
  return album
}

const fetchFromCache = (params: FetchAlbumParams): FetchAlbumResponse =>
  window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
    api: APIs.Album,
    query: params,
  })

export default function useAlbum(params: FetchAlbumParams) {
  return useQuery([AlbumApiNames.FetchAlbum, params], () => fetch(params), {
    enabled: !!params.id,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    placeholderData: () => fetchFromCache(params),
  })
}

export function fetchAlbumWithReactQuery(params: FetchAlbumParams) {
  return reactQueryClient.fetchQuery(
    [AlbumApiNames.FetchAlbum, params],
    () => fetch(params),
    {
      staleTime: Infinity,
    }
  )
}

export async function prefetchAlbum(params: FetchAlbumParams) {
  if (fetchFromCache(params)) return
  await reactQueryClient.prefetchQuery(
    [AlbumApiNames.FetchAlbum, params],
    () => fetch(params),
    {
      staleTime: Infinity,
    }
  )
}
