import { FetchArtistAlbumsResponse, FetchArtistResponse } from './api/Artist'
import { FetchAlbumResponse } from './api/Album'
import {
  FetchUserAccountResponse,
  FetchUserAlbumsResponse,
  FetchUserArtistsResponse,
  FetchUserLikedTracksIDsResponse,
  FetchUserPlaylistsResponse,
} from './api/User'
import {
  FetchAudioSourceResponse,
  FetchLyricResponse,
  FetchTracksResponse,
} from './api/Track'
import {
  FetchPlaylistResponse,
  FetchRecommendedPlaylistsResponse,
} from './api/Playlists'

export const enum APIs {
  Album = 'album',
  Artist = 'artists',
  ArtistAlbum = 'artist/album',
  CoverColor = 'cover_color',
  Likelist = 'likelist',
  Lyric = 'lyric',
  Personalized = 'personalized',
  Playlist = 'playlist/detail',
  RecommendResource = 'recommend/resource',
  SongUrl = 'song/url',
  Track = 'song/detail',
  UserAccount = 'user/account',
  UserAlbums = 'album/sublist',
  UserArtists = 'artist/sublist',
  UserPlaylist = 'user/playlist',
}

export interface APIsParams {
  [APIs.Album]: { id: number }
  [APIs.Artist]: { id: number }
  [APIs.ArtistAlbum]: { id: number }
  [APIs.CoverColor]: { id: number }
  [APIs.Likelist]: void
  [APIs.Lyric]: { id: number }
  [APIs.Personalized]: void
  [APIs.Playlist]: { id: number }
  [APIs.RecommendResource]: void
  [APIs.SongUrl]: { id: string }
  [APIs.Track]: { ids: string }
  [APIs.UserAccount]: void
  [APIs.UserAlbums]: void
  [APIs.UserArtists]: void
  [APIs.UserPlaylist]: void
}

export interface APIsResponse {
  [APIs.Album]: FetchAlbumResponse
  [APIs.Artist]: FetchArtistResponse
  [APIs.ArtistAlbum]: FetchArtistAlbumsResponse
  [APIs.CoverColor]: string | undefined
  [APIs.Likelist]: FetchUserLikedTracksIDsResponse
  [APIs.Lyric]: FetchLyricResponse
  [APIs.Personalized]: FetchRecommendedPlaylistsResponse
  [APIs.Playlist]: FetchPlaylistResponse
  [APIs.RecommendResource]: FetchRecommendedPlaylistsResponse
  [APIs.SongUrl]: FetchAudioSourceResponse
  [APIs.Track]: FetchTracksResponse
  [APIs.UserAccount]: FetchUserAccountResponse
  [APIs.UserAlbums]: FetchUserAlbumsResponse
  [APIs.UserArtists]: FetchUserArtistsResponse
  [APIs.UserPlaylist]: FetchUserPlaylistsResponse
}
