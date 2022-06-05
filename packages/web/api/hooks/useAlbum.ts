import { fetchAlbum } from '@/web/api/album'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  FetchAlbumParams,
  AlbumApiNames,
  FetchAlbumResponse,
} from '@/shared/api/Album'
import { useQuery } from 'react-query'

const fetch = async (params: FetchAlbumParams, noCache?: boolean) => {
  const album = await fetchAlbum(params, !!noCache)
  if (album?.album?.songs) {
    album.album.songs = album.songs
  }
  return album
}

const fetchFromCache = (id: number): FetchAlbumResponse =>
  window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
    api: APIs.Album,
    query: { id },
  })

export default function useAlbum(params: FetchAlbumParams, noCache?: boolean) {
  return useQuery(
    [AlbumApiNames.FetchAlbum, params.id],
    () => fetch(params, noCache),
    {
      enabled: !!params.id,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      placeholderData: () => fetchFromCache(params.id),
    }
  )
}

export function fetchAlbumWithReactQuery(params: FetchAlbumParams) {
  return reactQueryClient.fetchQuery(
    [AlbumApiNames.FetchAlbum, params.id],
    () => fetch(params),
    {
      staleTime: Infinity,
    }
  )
}

export async function prefetchAlbum(params: FetchAlbumParams) {
  if (fetchFromCache(params.id)) return
  await reactQueryClient.prefetchQuery(
    [AlbumApiNames.FetchAlbum, params.id],
    () => fetch(params),
    {
      staleTime: Infinity,
    }
  )
}
