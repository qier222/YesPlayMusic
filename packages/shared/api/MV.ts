export enum MVApiNames {
  FetchMV = 'fetchMV',
  FetchMVUrl = 'fetchMVUrl',
}

// MV详情
export interface FetchMVParams {
  mvid: number
}
export interface FetchMVResponse {
  code: number
  loadingPic: string
  bufferPic: string
  loadingPicFS: string
  bufferPicFS: string
  data: {
    artistId: number
    artistName: string
    artists: Artist[]
    briefDesc: string
    brs: {
      br: number
      point: number
      size: number
    }[]
    commentCount: number
    commentThreadId: string
    cover: string
    coverId: number
    coverId_str: string
    desc: string
    duration: number
    id: number
    nType: number
    name: string
    playCount: number
    price: null | unknown
    publishTime: string
    shareCount: number
    subCount: number
    videoGroup: unknown[]
  }
  mp: {
    cp: number
    dl: number
    fee: number
    id: number
    msg: null | string
    mvFee: number
    normal: boolean
    payed: number
    pl: number
    sid: number
    st: number
    unauthorized: boolean
  }
}

// MV地址
export interface FetchMVUrlParams {
  id: number
  r?: number
}
export interface FetchMVUrlResponse {
  code: number
  data: {
    code: number
    expi: number
    fee: number
    id: number
    md5: string
    msg: string
    mvFee: number
    promotionVo: null | unknown
    r: number
    size: number
    st: number
    url: string
  }
}
