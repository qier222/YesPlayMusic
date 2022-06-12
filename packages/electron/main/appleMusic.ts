import { logger } from '@sentry/utils'
import axios from 'axios'

// 'https://mvod.itunes.apple.com/itunes-assets/HLSMusic116/v4/de/52/95/de52957b-fcf1-ae96-b114-0445cb8c41d4/P359420813_default.m3u8'

const searchAlbum = async (
  keyword: string
): Promise<
  | {
      id: string
      href: string
      attributes: {
        artistName: string
        url: string
        name: string
        editorialNotes?: {
          standard: string
          short: string
        }
      }
    }
  | undefined
> => {
  const r = await axios.get(
    `https://amp-api.music.apple.com/v1/catalog/cn/search`,
    {
      params: {
        term: keyword,
        l: 'zh-cn',
        platform: 'web',
        types: 'albums',
        limit: 1,
      },
      headers: {
        authorization: 'Bearer xxxxxx', // required token
      },
    }
  )

  return r.data?.results?.albums?.data?.[0]
}

export const getCoverVideo = async ({
  name,
  artists,
}: {
  name: string
  artists: string[]
}): Promise<string | undefined> => {
  const keyword = `${artists.join(' ')} ${name}`
  logger.debug(`[appleMusic] getCoverVideo: ${keyword}`)
  const album = await searchAlbum(keyword).catch(e => {
    console.log(e)
    logger.debug('[appleMusic] Search album error', e)
  })

  const url = album?.attributes.url

  if (!url) {
    logger.info('[appleMusic] no url')
    return
  }

  let { data: html } = await axios.get(url)
  if (!html) return

  const regex =
    /<script type="fastboot\/shoebox" id="shoebox-media-api-cache-amp-music">(.*?)<\/script>/
  html = html
    .match(regex)[0]
    .replace(
      '<script type="fastboot/shoebox" id="shoebox-media-api-cache-amp-music">',
      ''
    )
    .replace('</script>', '')
  html = JSON.parse(html)
  const data = JSON.parse(html[Object.keys(html)[1]])
  const m3u8 =
    data?.d?.[0]?.attributes?.editorialVideo?.motionSquareVideo1x1?.video

  logger.debug(`[appleMusic] ${m3u8}`)

  return m3u8
}
