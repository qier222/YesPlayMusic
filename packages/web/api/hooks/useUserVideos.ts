import {
  UserApiNames,
  FetchListenedRecordsResponse,
  FetchUserVideosResponse,
} from '@/shared/api/User'
import { APIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useMutation, useQuery } from '@tanstack/react-query'
import useUser from './useUser'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { fetchUserVideos } from '../user'
import { likeAVideo } from '../mv'
import toast from 'react-hot-toast'
import { cloneDeep } from 'lodash-es'

export default function useUserVideos() {
  const { data: user } = useUser()
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FetchUserVideos, uid]

  return useQuery(
    key,
    () => {
      //   const existsQueryData = reactQueryClient.getQueryData(key)
      //   if (!existsQueryData) {
      //     window.ipcRenderer
      //       ?.invoke(IpcChannels.GetApiCache, {
      //         api: APIs.Likelist,
      //         query: {
      //           uid,
      //         },
      //       })
      //       .then(cache => {
      //         if (cache) reactQueryClient.setQueryData(key, cache)
      //       })
      //   }

      return fetchUserVideos()
    },
    {
      enabled: !!(uid && uid !== 0),
      refetchOnWindowFocus: true,
    }
  )
}

export const useMutationLikeAVideo = () => {
  const { data: user } = useUser()
  const { data: userVideos, refetch } = useUserVideos()
  const uid = user?.account?.id ?? 0
  const key = [UserApiNames.FetchUserVideos, uid]

  return useMutation(
    async (videoID: string | number) => {
      if (!videoID || userVideos?.data === undefined) {
        throw new Error('playlist id is required or userPlaylists is undefined')
      }
      const response = await likeAVideo({
        id: videoID,
        t: userVideos.data.find(v => String(v.vid) === String(videoID)) ? 2 : 1,
      })
      if (response.code !== 200) throw new Error((response as any).msg)
      return response
    },
    {
      onSuccess: () => {
        refetch()
      },
    }
  )
}
