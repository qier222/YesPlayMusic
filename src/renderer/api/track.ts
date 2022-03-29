import request from '@/utils/request'

export enum TrackApiNames {
  FETCH_TRACKS = 'fetchTracks',
  FETCH_AUDIO_SOURCE = 'fetchAudioSource',
}

// 获取歌曲详情
export interface FetchTracksParams {
  ids: number[]
}
export interface FetchTracksResponse {
  code: number
  songs: Track[]
  privileges: {
    [key: string]: unknown
  }
}
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
export interface FetchAudioSourceParams {
  id: number
  br?: number // bitrate, default 999000，320000 = 320kbps
}
export interface FetchAudioSourceResponse {
  code: number
  data: {
    br: number
    canExtend: boolean
    code: number
    encodeType: 'mp3' | null
    expi: number
    fee: number
    flag: number
    freeTimeTrialPrivilege: {
      [key: string]: unknown
    }
    freeTrialPrivilege: {
      [key: string]: unknown
    }
    freeTrialInfo: null
    gain: number
    id: number
    level: 'standard' | 'null'
    md5: string | null
    payed: number
    size: number
    type: 'mp3' | null
    uf: null
    url: string | null
    urlSource: number
  }[]
}
export function fetchAudioSource(
  params: FetchAudioSourceParams
): Promise<FetchAudioSourceResponse> {
  return request({
    url: '/song/url',
    method: 'get',
    params,
  })
}
