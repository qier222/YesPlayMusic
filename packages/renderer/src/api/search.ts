import request from '@/utils/request'

export enum SearchApiNames {
  SEARCH = 'search',
  MULTI_MATCH_SEARCH = 'multiMatchSearch',
}

// 搜索
export enum SearchTypes {
  SINGLE = 1,
  ALBUM = 10,
  ARTIST = 100,
  PLAYLIST = 1000,
  USER = 1002,
  MV = 1004,
  LYRICS = 1006,
  RADIO = 1009,
  VIDEO = 1014,
  ALL = 1018,
}
export interface SearchParams {
  keywords: string
  limit?: number // 返回数量 , 默认为 30
  offset?: number // 偏移数量，用于分页 , 如 : 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
  type?: SearchTypes // type: 搜索类型
}
interface SearchResponse {
  code: number
  result: {
    album: {
      albums: Album[]
      more: boolean
      moreText: string
      resourceIds: number[]
    }
    artist: {
      artists: Artist[]
      more: boolean
      moreText: string
      resourceIds: number[]
    }
    playList: {
      playLists: Playlist[]
      more: boolean
      moreText: string
      resourceIds: number[]
    }
    song: {
      songs: Track[]
      more: boolean
      moreText: string
      resourceIds: number[]
    }
    user: {
      users: User[]
      more: boolean
      moreText: string
      resourceIds: number[]
    }
    circle: unknown
    new_mlog: unknown
    order: string[]
    rec_type: null
    rec_query: null[]
    sim_query: unknown
    voice: unknown
    voiceList: unknown
  }
}
export function search(params: SearchParams): Promise<SearchResponse> {
  return request({
    url: '/search',
    method: 'get',
    params: params,
  })
}

// 搜索多重匹配
export interface MultiMatchSearchParams {
  keywords: string
}
interface MultiMatchSearchResponse {
  code: number
  result: {
    album: Album[]
    artist: Artist[]
    playlist: Playlist[]
    orpheus: unknown
    orders: Array<'artist' | 'album'>
  }
}
export function multiMatchSearch(
  params: MultiMatchSearchParams
): Promise<MultiMatchSearchResponse> {
  return request({
    url: '/search/multimatch',
    method: 'get',
    params: params,
  })
}
