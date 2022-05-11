import request from '@/web/utils/request'
import {
  FetchAudioSourceParams,
  FetchAudioSourceResponse,
  FetchLyricParams,
  FetchLyricResponse,
  FetchTracksParams,
  FetchTracksResponse,
  LikeATrackParams,
  LikeATrackResponse,
} from '@/shared/api/Track'

// 获取歌曲详情
export function fetchTracks(
  params: FetchTracksParams
): Promise<FetchTracksResponse> {
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids: params.ids.join(','),
    },
  })
}

// 获取音源URL
export function fetchAudioSource(
  params: FetchAudioSourceParams
): Promise<FetchAudioSourceResponse> {
  return request({
    url: '/song/url',
    method: 'get',
    params,
  })
}

// 获取歌词
export function fetchLyric(
  params: FetchLyricParams
): Promise<FetchLyricResponse> {
  return request({
    url: '/lyric',
    method: 'get',
    params,
  })
}

// 收藏歌曲
export function likeATrack(
  params: LikeATrackParams
): Promise<LikeATrackResponse> {
  return request({
    url: '/like',
    method: 'post',
    params: {
      ...params,
      timestamp: Date.now(),
    },
  })
}
