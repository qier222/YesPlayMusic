import log from './log'
import axios from 'axios'

const token =
  'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNjQ2NjU1MDgwLCJleHAiOjE2NjIyMDcwODB9.pyOrt2FmP0cHkzYtO8KiEzQL2t1qpRszzxIYbLH7faXSddo6PQei771Ja3aGwGVU4hD99lZAw7bwat60iBcGiQ'

export const getCoverVideo = async ({
  name,
  artist,
}: {
  name: string
  artist: string
}): Promise<string | undefined> => {
  const keyword = `${artist} ${name}`
  log.debug(`[appleMusic] getCoverVideo: ${keyword}`)
  const searchResult = await axios({
    method: 'GET',
    url: 'https://amp-api.music.apple.com/v1/catalog/us/search',
    params: {
      term: keyword,
      types: 'albums',
      'fields[albums]': 'artistName,name,editorialVideo',
      platform: 'web',
      limit: '1',
    },
    headers: {
      Authority: 'amp-api.music.apple.com',
      Accept: '*/*',
      Authorization: token,
      Referer: 'http://localhost:9000/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cider/1.5.1 Chrome/100.0.4896.160 Electron/18.3.3 Safari/537.36',
      'Accept-Encoding': 'gzip',
    },
  }).catch(e => {
    log.debug('[appleMusic] Search album error', e)
  })

  const album = searchResult?.data?.results?.albums?.data?.[0]
  if (!album) {
    log.debug('[appleMusic] No album found on apple music')
    return
  }
  log.debug(
    `[appleMusic] Got ${album?.id}: ${album?.attributes?.name} by ${album?.attributes?.artistName}`
  )

  const url = album?.attributes?.editorialVideo?.motionSquareVideo1x1?.video
  if (!url) {
    log.debug('[appleMusic] Album does not have video cover')
  }
  return url
}
