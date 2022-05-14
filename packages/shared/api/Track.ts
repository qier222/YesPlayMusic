export enum TrackApiNames {
  FetchTracks = 'fetchTracks',
  FetchAudioSource = 'fetchAudioSource',
  FetchLyric = 'fetchLyric',
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
    source?: AudioSource
    unm?: {
      source: AudioSource
      song?: any
      biliData?: string // base64
    }
  }[]
}

// 获取歌词

export interface FetchLyricParams {
  id: number
}
export interface FetchLyricResponse {
  code: number
  sgc: boolean
  sfy: boolean
  qfy: boolean
  lyricUser?: {
    id: number
    status: number
    demand: number
    userid: number
    nickname: string
    uptime: number
  }
  transUser?: {
    id: number
    status: number
    demand: number
    userid: number
    nickname: string
    uptime: number
  }
  lrc: {
    version: number
    lyric: string
  }
  klyric?: {
    version: number
    lyric: string
  }
  tlyric?: {
    version: number
    lyric: string
  }
}

// 收藏歌曲
export interface LikeATrackParams {
  id: number
  like: boolean
}
export interface LikeATrackResponse {
  code: number
  playlistId: number
  songs: Track[]
}

export type AudioSource =
  | 'unknown'
  | 'netease'
  | 'migu'
  | 'kuwo'
  | 'kugou'
  | 'youtube'
  | 'qq'
  | 'bilibili'
  | 'joox'
