export interface FetchAppleMusicAlbumParams {
  neteaseId: number | string
  lang?: 'zh-CN' | 'en-US'
}

export interface FetchAppleMusicAlbumResponse {
  id: number
  neteaseId: number
  name: string
  artistName: string
  editorialVideo: string
  artwork: string
  editorialNote: {
    en_US: string
    zh_CN: string
  }
}

export interface FetchAppleMusicArtistParams {
  neteaseId: number | string
  lang?: 'zh-CN' | 'en-US'
}

export interface FetchAppleMusicArtistResponse {
  id: number
  neteaseId: number
  editorialVideo: string
  artwork: string
  name: string
  artistBio: {
    en_US: string
    zh_CN: string
  }
}
