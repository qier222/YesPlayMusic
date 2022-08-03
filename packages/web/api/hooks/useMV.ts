import { fetchMV, fetchMVUrl } from '@/web/api/mv'
import { IpcChannels } from '@/shared/IpcChannels'
import { APIs } from '@/shared/CacheAPIs'
import {
  MVApiNames,
  FetchMVParams,
  FetchMVResponse,
  FetchMVUrlParams,
} from '@/shared/api/MV'
import { useQuery } from '@tanstack/react-query'

export default function useMV(params: FetchMVParams) {
  return useQuery([MVApiNames.FetchMV, params], () => fetchMV(params), {
    enabled: !!params.mvid && params.mvid > 0 && !isNaN(Number(params.mvid)),
    staleTime: 5 * 60 * 1000, // 5 mins
    //   placeholderData: (): FetchMVResponse =>
    //     window.ipcRenderer?.sendSync(IpcChannels.GetApiCacheSync, {
    //       api: APIs.SimilarArtist,
    //       query: {
    //         id: params.id,
    //       },
    //     }),
  })
}

export function useMVUrl(params: FetchMVUrlParams) {
  return useQuery([MVApiNames.FetchMVUrl, params], () => fetchMVUrl(params), {
    enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
    staleTime: 60 * 60 * 1000, // 60 mins
  })
}
