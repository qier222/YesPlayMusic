import useHoverLightSpot from '@/web/hooks/useHoverLightSpot'
import { openContextMenu } from '@/web/states/contextMenus'
import { css, cx } from '@emotion/css'
import { motion, useMotionValue } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import Icon from '../Icon'

const Actions = ({
  onPlay,
  onLike,
  isLiked,
  isLoading,
}: {
  isLiked?: boolean
  isLoading?: boolean
  onPlay: () => void
  onLike?: () => void
}) => {
  return (
    <div className='mt-11 flex items-end justify-between lg:mt-4 lg:justify-start lg:gap-2.5'>
      <div className='flex items-end gap-2.5'>
        <MenuButton isLoading={isLoading} />
        <LikeButton {...{ isLiked, isLoading, onLike }} />
      </div>
      <PlayButton onPlay={onPlay} isLoading={isLoading} />
    </div>
  )
}

const MenuButton = ({ isLoading }: { isLoading?: boolean }) => {
  const params = useParams()

  // hover animation
  const { buttonRef, buttonStyle, LightSpot } = useHoverLightSpot({
    opacity: 0.8,
    size: 16,
  })

  return (
    <motion.button
      ref={buttonRef}
      style={buttonStyle}
      onClick={event => {
        params?.id &&
          openContextMenu({
            event,
            type: 'album',
            dataSourceID: params.id,
          })
      }}
      className={cx(
        'relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10 transition duration-300 ease-linear',
        isLoading ? 'text-transparent' : 'text-white/40'
      )}
    >
      <Icon name='more' className='pointer-events-none h-7 w-7' />
      {LightSpot()}
    </motion.button>
  )
}

const LikeButton = ({
  onLike,
  isLiked,
  isLoading,
}: {
  onLike?: () => void
  isLiked?: boolean
  isLoading?: boolean
}) => {
  // hover animation
  const { buttonRef, buttonStyle, LightSpot } = useHoverLightSpot({
    opacity: 0.8,
    size: 16,
  })

  if (!onLike) return null
  return (
    <motion.button
      ref={buttonRef}
      onClick={() => onLike()}
      style={buttonStyle}
      className={cx(
        'relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10 transition-transform duration-300 ease-linear',
        isLoading ? 'text-transparent' : 'text-white/40 '
      )}
    >
      <Icon name={isLiked ? 'heart' : 'heart-outline'} className='h-7 w-7' />
      {LightSpot()}
    </motion.button>
  )
}

const PlayButton = ({ onPlay, isLoading }: { onPlay: () => void; isLoading?: boolean }) => {
  const { t } = useTranslation()

  // hover animation
  const { buttonRef, buttonStyle, LightSpot } = useHoverLightSpot()

  return (
    <motion.button
      ref={buttonRef}
      style={buttonStyle}
      onClick={() => onPlay()}
      className={cx(
        'relative h-14 overflow-hidden rounded-full px-10 text-18 font-medium transition-transform duration-300 ease-linear',
        isLoading ? 'bg-white/10 text-transparent' : 'bg-brand-700 text-white'
      )}
    >
      {t`player.play`}
      {LightSpot()}
    </motion.button>
  )
}

export default Actions
