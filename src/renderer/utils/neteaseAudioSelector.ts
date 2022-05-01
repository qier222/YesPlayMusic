import { FetchAudioSourceParams } from '@/shared/api/Track'

export enum AudioQualityTypes {
  Low = '128Kbps',
  Mid = '192Kbps',
  High = '320Kbps',
  SQ = 'SQ',
  HiRes = 'Hi-Res',
}

export interface NeteaseAudioSelecteResult {
  /** 音质 */
  quality: AudioQualityTypes
  /** 音源的实际比特率 */
  realBr: number
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

export function SelectAudio(track: Track): NeteaseAudioSelecteResult {
  const brs = [
    track.l?.br ?? 0,
    track.m?.br ?? 0,
    track.h?.br ?? 0,
    track.sq?.br ?? 0,
    track.hr?.br ?? 0,
  ]

  const limitQuality = AudioQualityTypes.HiRes // TODO: 用户设置最大音质
  const realBr = Math.max(
    ...brs.slice(0, audioQualities.indexOf(limitQuality) + 1)
  )
  const quality = audioQualities[brs.indexOf(realBr)]

  return {
    quality,
    realBr,
    fetchParams: { id: track.id, br: getBr(quality) },
  }
}
