import {
  FetchAppleMusicAlbumParams,
  FetchAppleMusicAlbumResponse,
  FetchAppleMusicArtistParams,
  FetchAppleMusicArtistResponse,
} from '@/shared/api/AppleMusic'
import request from '../utils/request'

// AppleMusic专辑
export function fetchAppleMusicAlbum(
  params: FetchAppleMusicAlbumParams
): Promise<FetchAppleMusicAlbumResponse> {
  return request({
    url: '/r3play/apple-music/album',
    method: 'get',
    params,
    baseURL: '/',
  })
}

// AppleMusic艺人
export function fetchAppleMusicArtist(
  params: FetchAppleMusicArtistParams
): Promise<FetchAppleMusicArtistResponse> {
  return request({
    url: '/r3play/apple-music/artist',
    method: 'get',
    params,
    baseURL: '/',
  })
}
