import log from './log'
import ytdl from 'ytdl-core'
import axios, { AxiosProxyConfig } from 'axios'
import store from './store'
import httpProxyAgent from 'http-proxy-agent'

class YoutubeDownloader {
  constructor() {
    //
  }

  async search(keyword: string): Promise<
    {
      duration: number
      id: string
      title: string
    }[]
  > {
    let proxy: AxiosProxyConfig | false = false
    if (store.get('settings.httpProxyForYouTube')) {
      const host = store.get('settings.httpProxyForYouTube.host') as string | undefined
      const port = store.get('settings.httpProxyForYouTube.port') as number | undefined
      const auth = store.get('settings.httpProxyForYouTube.auth') as any | undefined
      const protocol = store.get('settings.httpProxyForYouTube.protocol') as string | undefined
      if (host && port) {
        proxy = { host, port, auth, protocol }
      }
    }
    // proxy = { host: '127.0.0.1', port: 8888, protocol: 'http' }
    const webPage = await axios.get(`https://www.youtube.com/results`, {
      params: {
        search_query: keyword,
        sp: 'EgIQAQ==',
      },
      headers: { 'Accept-Language': 'en-US' },
      timeout: 5000,
      proxy,
    })

    if (webPage.status !== 200) {
      return []
    }

    // @credit https://www.npmjs.com/package/@yimura/scraper
    function _parseData(data) {
      const results = {
        channels: [],
        playlists: [],
        streams: [],
        videos: [],
      }

      const isVideo = item => item.videoRenderer && item.videoRenderer.lengthText
      const getVideoData = item => {
        const vRender = item.videoRenderer
        const compress = key => {
          return (key && key['runs'] ? key['runs'].map(v => v.text) : []).join('')
        }
        const parseDuration = vRender => {
          if (!vRender.lengthText?.simpleText) return 0

          const nums = vRender.lengthText.simpleText.split(':')
          let time = nums.reduce((a, t) => 60 * a + +t) * 1e3

          return time
        }

        return {
          duration: parseDuration(vRender),
          id: vRender.videoId,
          title: compress(vRender.title),
        }
      }

      for (const item of data) {
        if (isVideo(item)) results.videos.push(getVideoData(item))
      }

      return results
    }

    function _extractData(json) {
      json = json.contents.twoColumnSearchResultsRenderer.primaryContents

      let contents = []

      if (json.sectionListRenderer) {
        contents = json.sectionListRenderer.contents
          .filter(item =>
            item?.itemSectionRenderer?.contents.filter(
              x => x.videoRenderer || x.playlistRenderer || x.channelRenderer
            )
          )
          .shift().itemSectionRenderer.contents
      }

      if (json.richGridRenderer) {
        contents = json.richGridRenderer.contents
          .filter(item => item.richItemRenderer && item.richItemRenderer.content)
          .map(item => item.richItemRenderer.content)
      }

      return contents
    }

    function _getSearchData(webPage: string) {
      const startString = 'var ytInitialData = '
      const start = webPage.indexOf(startString)
      const end = webPage.indexOf(';</script>', start)

      const data = webPage.substring(start + startString.length, end)

      try {
        return JSON.parse(data)
      } catch (e) {
        throw new Error(
          'Failed to parse YouTube search data. YouTube might have updated their site or no results returned.'
        )
      }
    }

    const parsedJson = _getSearchData(webPage.data)

    const extracted = _extractData(parsedJson)
    const parsed = _parseData(extracted)

    return parsed?.videos
  }

  async matchTrack(
    artist: string,
    trackName: string
  ): Promise<{
    url: string
    bitRate: number
    title: string
    videoId: string
    duration: string
    channel: string
  }> {
    const match = async () => {
      console.time('[youtube] search')
      const videos = await this.search(`${artist} ${trackName} audio`)
      console.timeEnd('[youtube] search')
      let video: {
        duration: number
        id: string
        title: string
      } | null = null

      // 找官方频道最匹配的
      // videos.forEach(v => {
      //   if (video) return
      //   const channelName = v.channel.name.toLowerCase()
      //   if (channelName !== artist.toLowerCase()) return
      //   const title = v.title.toLowerCase()
      //   if (!title.includes(trackName.toLowerCase())) return
      //   if (!title.includes('audio') && !title.includes('lyric')) return
      //   video = v
      // })

      // TODO:找时长误差不超过2秒的

      // 最后方案选搜索的第一个
      if (!video) {
        video = videos[0]
      }
      if (!video) return null

      console.time('[youtube] getInfo')
      const proxy = 'http://127.0.0.1:8888'
      const agent = httpProxyAgent(proxy)
      const info = await ytdl.getInfo(video.id, {
        // requestOptions: { agent },
      })
      console.timeEnd('[youtube] getInfo')
      if (!info) return null
      let url = ''
      let bitRate = 0
      info.formats.forEach(video => {
        if (
          video.mimeType === `audio/webm; codecs="opus"` &&
          video.bitrate &&
          video.bitrate > bitRate
        ) {
          url = video.url
          bitRate = video.bitrate
        }
      })
      const data = {
        url,
        bitRate,
        title: info.videoDetails.title,
        videoId: info.videoDetails.videoId,
        duration: info.videoDetails.lengthSeconds,
        channel: info.videoDetails.ownerChannelName,
      }
      log.info(`[youtube] matched `, data)
      return data
    }

    return new Promise(async (resolve, reject) => {
      setTimeout(() => reject('youtube match timeout'), 10000)
      try {
        const result = await match()
        if (result) resolve(result)
      } catch (e) {
        log.error(`[youtube] matchTrack error`, e)
        reject(e)
      }
    })
  }

  async testConnection() {
    return axios.get('https://www.youtube.com', { timeout: 5000 })
  }
}

const youtubeDownloader = new YoutubeDownloader()
export default youtubeDownloader
