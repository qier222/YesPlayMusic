import { css, cx } from '@emotion/css'
import { motion, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ease } from '@/web/utils/const'
import Icon from '../../Icon'

const NavigationButtons = () => {
  const navigate = useNavigate()
  const controlsBack = useAnimation()
  const controlsForward = useAnimation()
  const transition = { duration: 0.18, ease }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        onMouseDown={async () => {
          await controlsBack.start({ x: -5 })
          await controlsBack.start({ x: 0 })
        }}
        className='app-region-no-drag rounded-full bg-day-600 p-2.5 dark:bg-night-600'
      >
        <motion.div animate={controlsBack} transition={transition}>
          <Icon name='back' className='h-7 w-7 text-neutral-500' />
        </motion.div>
      </button>
      <button
        onClick={async () => {
          navigate(1)
        }}
        onMouseDown={async () => {
          await controlsForward.start({ x: 5 })
          await controlsForward.start({ x: 0 })
        }}
        className='app-region-no-drag ml-2.5 rounded-full bg-day-600 p-2.5 dark:bg-night-600'
      >
        <motion.div animate={controlsForward} transition={transition}>
          <Icon name='forward' className='h-7 w-7 text-neutral-500' />
        </motion.div>
      </button>
    </>
  )
}

export default NavigationButtons
