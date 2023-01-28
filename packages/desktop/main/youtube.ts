import log from './log'
import youtube, { Scraper, Video } from '@yimura/scraper'
import ytdl from 'ytdl-core'

class YoutubeDownloader {
  yt: Scraper

  constructor() {
    // @ts-ignore
    this.yt = new youtube.default()
  }

  async search(keyword: string) {
    const result = await this.yt.search(keyword)
    return result?.videos
  }

  async matchTrack(artist: string, trackName: string) {
    console.time('[youtube] search')
    const videos = await this.search(`${artist} ${trackName} lyric audio`)
    console.timeEnd('[youtube] search')
    let video: Video | null = null

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

    console.time('[youtube] getInfo')
    const info = await ytdl.getInfo('http://www.youtube.com/watch?v=' + video.id)
    console.timeEnd('[youtube] getInfo')
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
}

const youtubeDownloader = new YoutubeDownloader()
export default youtubeDownloader
