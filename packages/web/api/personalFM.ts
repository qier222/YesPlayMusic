import request from '@/web/utils/request'

export enum PersonalFMApiNames {
  FetchPersonalFm = 'fetchPersonalFM',
}

export interface PersonalMusic {
  name: null | string
  id: number
  size: number
  extension: 'mp3' | 'flac' | null
  sr: number
  dfsId: number
  bitrate: number
  playTime: number
  volumeDelta: number
}

export interface FetchPersonalFMResponse {
  code: number
  popAdjust: boolean
  data: {
    name: string
    id: number
    position: number
    alias: string[]
    status: number
    fee: number
    copyrightId: number
    disc?: string
    no: number
    artists: Artist[]
    album: Album
    starred: boolean
    popularity: number
    score: number
    starredNum: number
    duration: number
    playedNum: number
    dayPlays: number
    hearTime: number
    ringtone: null
    crbt: null
    audition: null
    copyFrom: string
    commentThreadId: string
    rtUrl: string | null
    ftype: number
    rtUrls: (string | null)[]
    copyright: number
    transName: null | string
    sign: null
    mark: number
    originCoverType: number
    originSongSimpleData: null
    single: number
    noCopyrightRcmd: null
    mvid: number
    bMusic?: PersonalMusic
    lMusic?: PersonalMusic
    mMusic?: PersonalMusic
    hMusic?: PersonalMusic
    reason: string
    privilege: {
      id: number
      fee: number
      payed: number
      st: number
      pl: number
      dl: number
      sp: number
      cp: number
      subp: number
      cs: boolean
      maxbr: number
      fl: number
      toast: boolean
      flag: number
      preShell: boolean
      playMaxbr: number
      downloadMaxbr: number
      rscl: null
      freeTrialPrivilege: {
        [key: string]: unknown
      }
      chargeInfoList: {
        [key: string]: unknown
      }[]
    }
    alg: string
    s_ctrp: string
  }[]
}
export function fetchPersonalFM(): Promise<FetchPersonalFMResponse> {
  return request({
    url: '/personal/fm',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}

export interface FMTrashResponse {
  songs: null[]
  code: number
  count: number
}

export function fmTrash(id: number): Promise<FMTrashResponse> {
  return request({
    url: '/fm/trash',
    method: 'post',
    params: {
      id,
      timestamp: Date.now(),
    },
  })
}
