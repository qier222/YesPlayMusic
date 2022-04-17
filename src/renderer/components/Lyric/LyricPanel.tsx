import Player from './Player'
import { player, state } from '@/renderer/store'
import { getCoverColor } from '@/renderer/utils/common'
import { colord } from 'colord'
import IconButton from '../IconButton'
import SvgIcon from '../SvgIcon'
import Lyric from './Lyric'
import { motion, AnimatePresence } from 'framer-motion'
import Lyric2 from './Lyric2'
import useCoverColor from '@/renderer/hooks/useCoverColor'

const LyricPanel = () => {
  const stateSnapshot = useSnapshot(state)
  const playerSnapshot = useSnapshot(player)
  const track = useMemo(() => playerSnapshot.track, [playerSnapshot.track])

  const bgColor = useCoverColor(track?.al?.picUrl ?? '')

  return (
    <AnimatePresence>
      {stateSnapshot.uiStates.showLyricPanel && (
        <motion.div
          initial={{
            y: '100%',
          }}
          animate={{
            y: 0,
            transition: {
              ease: 'easeIn',
              duration: 0.4,
            },
          }}
          exit={{
            y: '100%',
            transition: {
              ease: 'easeIn',
              duration: 0.4,
            },
          }}
          className={classNames(
            'fixed inset-0 z-40 grid grid-cols-[repeat(13,_minmax(0,_1fr))] gap-[8%]  bg-gray-800'
          )}
          style={{
            background: `linear-gradient(to bottom, ${bgColor.from}, ${bgColor.to})`,
          }}
        >
          {/* Drag area */}
          <div className='app-region-drag absolute top-0 right-0 left-0 h-16'></div>

          <Player className='col-span-6' />
          {/* <Lyric className='col-span-7' /> */}
          <Lyric2 className='col-span-7' />

          <div className='absolute bottom-3.5 right-7 text-white'>
            <IconButton onClick={() => (state.uiStates.showLyricPanel = false)}>
              <SvgIcon className='h-6 w-6' name='lyrics' />
            </IconButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LyricPanel
