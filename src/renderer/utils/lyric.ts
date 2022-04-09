import { FetchLyricResponse } from '@/renderer/api/track'

export function lyricParser(lrc: FetchLyricResponse) {
  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || ''),
    lyricuser: lrc.lyricUser,
    transuser: lrc.transUser,
  }
}

/**
 * @see {@link https://regexr.com/6e52n}
 */
const extractLrcRegex =
  /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm
const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g

interface ParsedLyric {
  time: number
  rawTime: string
  content: string
}

function parseLyric(lrc: string): ParsedLyric[] {
  // A sorted list of parsed lyric and its timestamp.
  const parsedLyrics: ParsedLyric[] = []

  // Find the appropriate index to push our parsed lyric.
  const binarySearch = (lyric: ParsedLyric) => {
    const time = lyric.time

    let low = 0
    let high = parsedLyrics.length - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midTime = parsedLyrics[mid].time
      if (midTime === time) {
        return mid
      } else if (midTime < time) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return low
  }

  for (const line of lrc.trim().matchAll(extractLrcRegex)) {
    const { lyricTimestamps, content } = line.groups as {
      lyricTimestamps: string
      content: string
    }

    if (content === '纯音乐，请欣赏') continue

    if (
      content.match(
        // https://regexr.com/6j8pf
        .*(?<role>作曲|作词|编曲|制作|Producers|Producer|Produced|贝斯|工程师|吉他|合成器|助理|编程|制作|和声|母带|人声|鼓|混音|中提琴|编写|Talkbox|钢琴|出版|录音|发行|出品|键盘|弦乐|设计|监制|原曲|演唱|声明|版权|封面|插画|统筹|企划|填词|原唱|后期|和音|琵琶).*[:：]\s*(?<name>.*)
      )
    ) {
      continue
    }

    for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
      const { min, sec, ms } = timestamp.groups as {
        min: string
        sec: string
        ms: string
      }
      const rawTime = timestamp[0]
      const time = Number(min) * 60 + Number(sec) + Number(ms ?? 0) * 0.001

      const parsedLyric = { rawTime, time, content: trimContent(content) }
      parsedLyrics.splice(binarySearch(parsedLyric), 0, parsedLyric)
    }
  }

  return parsedLyrics
}

function trimContent(content: string): string {
  const t = content.trim()
  return t.length < 1 ? content : t
}
