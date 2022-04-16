import useLyric from '@/renderer/hooks/useLyric'
import { player } from '@/renderer/store'
import {
  motion,
  useMotionValue,
  AnimatePresence,
  AnimationControls,
  useAnimation,
  LayoutGroup,
} from 'framer-motion'
import { lyricParser } from '@/renderer/utils/lyric'

const Lyric = ({ className }: { className?: string }) => {
  //   const ease = [0.5, 0.2, 0.2, 0.8]
  console.log('rendering')

  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])
  const { data: lyricRaw } = useLyric({ id: track?.id ?? 0 })

  const lyric = useMemo(() => {
    return lyricRaw && lyricParser(lyricRaw)
  }, [lyricRaw])

  const progress = playerSnapshot.progress + 0.3
  const currentLine = useMemo(() => {
    const index =
      (lyric?.lyric.findIndex(({ time }) => time > progress) ?? 1) - 1
    return {
      index: index < 1 ? 0 : index,
      time: lyric?.lyric?.[index]?.time ?? 0,
    }
  }, [lyric?.lyric, progress])

  const displayLines = useMemo(() => {
    const index = currentLine.index
    const lines =
      lyric?.lyric.slice(index === 0 ? 0 : index - 1, currentLine.index + 7) ??
      []
    if (index === 0) {
      lines.unshift({
        time: 0,
        content: '',
        rawTime: '[00:00:00]',
      })
    }
    return lines
  }, [currentLine.index, lyric?.lyric])

  const variants = {
    initial: { opacity: [0, 0.2], y: ['24%', 0] },
    current: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.5, 0.2, 0.2, 0.8],
        duration: 0.7,
      },
    },
    rest: (index: number) => ({
      opacity: 0.2,
      y: 0,
      transition: {
        delay: index * 0.04,
        ease: [0.5, 0.2, 0.2, 0.8],
        duration: 0.7,
      },
    }),
    exit: {
      opacity: 0,
      y: -132,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transition: {
        duration: 0.7,
        ease: [0.5, 0.2, 0.2, 0.8],
      },
    },
  }

  return (
    <div
      className={classNames(
        'max-h-screen cursor-default overflow-hidden font-semibold',
        className
      )}
      style={{
        paddingTop: 'calc(100vh / 7 * 3)',
        paddingBottom: 'calc(100vh / 7 * 3)',
        fontSize: 'calc(100vw * 0.0264)',
        lineHeight: 'calc(100vw * 0.032)',
      }}
    >
      {displayLines.map(({ content, time }, index) => {
        return (
          <motion.div
            key={`${String(index)}-${String(time)}`}
            custom={index}
            variants={variants}
            initial={'initial'}
            animate={
              time === currentLine.time
                ? 'current'
                : time < currentLine.time
                ? 'exit'
                : 'rest'
            }
            layout
            className={classNames(
              'max-w-[78%] py-[calc(100vw_*_0.0111)] text-white'
            )}
          >
            {content}
          </motion.div>
        )
      })}
    </div>
  )
}

export default Lyric
