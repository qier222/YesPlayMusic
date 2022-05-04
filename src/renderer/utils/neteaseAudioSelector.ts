import { FetchAudioSourceParams } from '@/shared/api/Track'

export enum AudioQualityTypes {
  Low = '128Kbps',
  Mid = '192Kbps',
  High = '320Kbps',
  SQ = 'SQ',
  HiRes = 'Hi - Res',
}

export interface NeteaseAudioSelecteResult {
  /** 音质 */
  quality?: AudioQualityTypes
  /** 音源的实际比特率 */
  realBr?: number
  /** 获取音源使用的参数 */
  fetchParams: FetchAudioSourceParams
}

function getBr(quality: AudioQualityTypes): number {
  switch (quality) {
    case AudioQualityTypes.Low:
      return 128000
    case AudioQualityTypes.Mid:
      return 192000
    case AudioQualityTypes.High:
      return 320000
    case AudioQualityTypes.SQ:
      return 350000 // 当br >= 400000时会优先使用 hi-res
    default:
      return 999000
  }
}

const audioQualities = [
  AudioQualityTypes.Low,
  AudioQualityTypes.Mid,
  AudioQualityTypes.High,
  AudioQualityTypes.SQ,
  AudioQualityTypes.HiRes,
]

export class NeteaseAudioSelector {
  private _track: Track
  private _privilege: Privilege | null // TODO: 用于之后判断登陆的用户是否可以播放
  constructor(track: Track, privilege: Privilege | null) {
    this._track = track
    this._privilege = privilege?.id === track.id ? privilege : null
  }

  private _getBrs(): number[] {
    return [
      this._track.l?.br ?? 0,
      this._track.m?.br ?? 0,
      this._track.h?.br ?? 0,
      this._track.sq?.br ?? 0,
      this._track.hr?.br ?? 0,
    ]
  }

  selectAudio(): NeteaseAudioSelecteResult {
    const limitQuality = AudioQualityTypes.HiRes // TODO: 用户设置最大音质
    if (this._track.noCopyrightRcmd) {
      return {
        fetchParams: {
          id: this._track.id,
          br: getBr(limitQuality),
        },
      }
    }

    const brs = this._getBrs()
    const realBr = Math.max(
      ...brs.slice(0, audioQualities.indexOf(limitQuality) + 1)
    )
    const quality =
      realBr === 0 ? limitQuality : audioQualities[brs.indexOf(realBr)]

    return {
      quality,
      realBr,
      fetchParams: {
        id: this._track.id,
        br: getBr(quality),
      },
    }
  }

  getQuality(audioBr: number): AudioQualityTypes | null {
    if (this._track.noCopyrightRcmd) return null

    const datas = this._getBrs().map(br => Math.abs(br - audioBr))
    const index = datas.indexOf(Math.min(...datas))
    return audioQualities[index]
  }
}
