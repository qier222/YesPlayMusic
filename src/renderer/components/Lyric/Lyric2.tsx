import useLyric from '@/hooks/useLyric'
import { player } from '@/store'
import { motion, useMotionValue } from 'framer-motion'
import { lyricParser } from '@/utils/lyric'
import { useWindowSize } from 'react-use'

const Lyric = ({ className }: { className?: string }) => {
  // const ease = [0.5, 0.2, 0.2, 0.8]

  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const { data: lyricRaw } = useLyric({ id: track?.id ?? 0 })

  const lyric = useMemo(() => {
    return lyricRaw && lyricParser(lyricRaw)
  }, [lyricRaw])

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(player.howler.seek() + 0.3)
    }, 300)
    return () => clearInterval(timer)
  }, [])
  const currentIndex = useMemo(() => {
    return (lyric?.lyric.findIndex(({ time }) => time > progress) ?? 1) - 1
  }, [lyric?.lyric, progress])

  const y = useMotionValue(1000)
  const { height: windowHight } = useWindowSize()

  useEffect(() => {
    const top = (
      document.getElementById('lyrics')?.children?.[currentIndex] as any
    )?.offsetTop
    if (top) {
      y.set((windowHight / 9) * 4 - top)
    }
  }, [currentIndex, windowHight, y])

  useEffect(() => {
    y.set(0)
  }, [track, y])

  return (
    <div
      className={classNames(
        'max-h-screen cursor-default select-none overflow-hidden font-semibold',
        className
      )}
      style={{
        paddingTop: 'calc(100vh / 9 * 4)',
        paddingBottom: 'calc(100vh / 9 * 4)',
        fontSize: 'calc(100vw * 0.0264)',
        lineHeight: 'calc(100vw * 0.032)',
      }}
      id='lyrics'
    >
      {lyric?.lyric.map(({ content, time }, index) => {
        return (
          <motion.div
            id={String(time)}
            key={time}
            className={classNames(
              'max-w-[78%] py-[calc(100vw_*_0.0111)] text-white duration-700'
            )}
            style={{
              y,
              opacity:
                index === currentIndex
                  ? 1
                  : index > currentIndex && index < currentIndex + 8
                  ? 0.2
                  : 0,
              transitionProperty:
                index > currentIndex - 2 && index < currentIndex + 8
                  ? 'transform, opacity'
                  : 'none',
              transitionTimingFunction:
                index > currentIndex - 2 && index < currentIndex + 8
                  ? 'cubic-bezier(0.5, 0.2, 0.2, 0.8)'
                  : 'none',
              transitionDelay: `${
                index < currentIndex + 8 && index > currentIndex
                  ? 0.04 * (index - currentIndex)
                  : 0
              }s`,
            }}
          >
            {content}
          </motion.div>
        )
      })}
    </div>
  )
}

export default Lyric
