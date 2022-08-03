import log from './log'
import axios from 'axios'
import { AppleMusicAlbum, AppleMusicArtist } from '@/shared/AppleMusic'

const headers = {
  Authority: 'amp-api.music.apple.com',
  Accept: '*/*',
  Authorization:
    'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNjQ2NjU1MDgwLCJleHAiOjE2NjIyMDcwODB9.pyOrt2FmP0cHkzYtO8KiEzQL2t1qpRszzxIYbLH7faXSddo6PQei771Ja3aGwGVU4hD99lZAw7bwat60iBcGiQ',
  Referer: 'https://music.apple.com/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cider/1.5.1 Chrome/100.0.4896.160 Electron/18.3.3 Safari/537.36',
  'Accept-Encoding': 'gzip',
}

export const getAlbum = async ({
  name,
  artist,
}: {
  name: string
  artist: string
}): Promise<AppleMusicAlbum | undefined> => {
  const keyword = `${artist} ${name}`
  log.debug(`[appleMusic] getAlbum: ${keyword}`)
  const searchResult = await axios({
    method: 'GET',
    headers,
    url: 'https://amp-api.music.apple.com/v1/catalog/us/search',
    params: {
      term: keyword,
      types: 'albums',
      'fields[albums]': 'artistName,name,editorialVideo,editorialNotes',
      platform: 'web',
      limit: '5',
      l: 'en-us', // TODO: get from settings
    },
  }).catch(e => {
    log.debug('[appleMusic] Search album error', e)
  })

  const albums: AppleMusicAlbum[] | undefined =
    searchResult?.data?.results?.albums?.data
  const album =
    albums?.find(
      a =>
        a.attributes.name.toLowerCase() === name.toLowerCase() &&
        a.attributes.artistName.toLowerCase() === artist.toLowerCase()
    ) || albums?.[0]
  if (!album) {
    log.debug('[appleMusic] No album found on apple music')
    return
  }

  return album
}

export const getArtist = async (
  name: string
): Promise<AppleMusicArtist | undefined> => {
  const searchResult = await axios({
    method: 'GET',
    url: 'https://amp-api.music.apple.com/v1/catalog/us/search',
    headers,
    params: {
      term: name,
      types: 'artists',
      'fields[artists]': 'url,name,artwork,editorialVideo,artistBio',
      'omit[resource:artists]': 'relationships',
      platform: 'web',
      limit: '1',
      l: 'en-us', // TODO: get from settings
    },
  }).catch(e => {
    log.debug('[appleMusic] Search artist error', e)
  })

  const artist = searchResult?.data?.results?.artists?.data?.[0]
  if (
    artist &&
    artist?.attributes?.name?.toLowerCase() === name.toLowerCase()
  ) {
    return artist
  }
}
