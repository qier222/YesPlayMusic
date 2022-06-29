import React, { useEffect, useMemo, useRef, useState } from 'react'
import { css, cx } from '@emotion/css'
import Icon from '../Icon'
import { formatDuration, resizeImage } from '@/web/utils/common'
import { player } from '@/web/store'
import { useSnapshot } from 'valtio'
import { State as PlayerState, Mode as PlayerMode } from '@/web/utils/player'
import Slider from './Slider'
import { animate, motion, useAnimation } from 'framer-motion'
import { ease } from '@/web/utils/const'
import useUserLikedTracksIDs, {
  useMutationLikeATrack,
} from '@/web/api/hooks/useUserLikedTracksIDs'
import ArtistInline from './ArtistsInLine'

const Progress = () => {
  const { track, progress } = useSnapshot(player)

  return (
    <div className='flex flex-col w-full mt-10'>
      <Slider
        min={0}
        max={(track?.dt ?? 100000) / 1000}
        value={progress}
        onChange={value => {
          player.progress = value
        }}
        onlyCallOnChangeAfterDragEnded={true}
      />

      <div className='flex justify-between mt-1 font-bold text-14 text-black/20 dark:text-white/20'>
        <span>{formatDuration(progress * 1000, 'en', 'hh:mm:ss')}</span>
        <span>{formatDuration(track?.dt || 0, 'en', 'hh:mm:ss')}</span>
      </div>
    </div>
  )
}

const Cover = () => {
  const playerSnapshot = useSnapshot(player)
  const [cover, setCover] = useState('')
  const animationStartTime = useRef(0)
  const controls = useAnimation()
  const duration = 150 // ms

  useEffect(() => {
    const resizedCover = resizeImage(
      playerSnapshot.track?.al.picUrl || '',
      'lg'
    )
    const animate = async () => {
      animationStartTime.current = Date.now()
      await controls.start({ opacity: 0 })
      setCover(resizedCover)
    }
    animate()
  }, [controls, playerSnapshot.track?.al.picUrl])

  // 防止狂点下一首或上一首造成封面与歌曲不匹配的问题
  useEffect(() => {
    const realCover = resizeImage(playerSnapshot.track?.al.picUrl ?? '', 'lg')
    if (cover !== realCover) setCover(realCover)
  }, [cover, playerSnapshot.track?.al.picUrl])

  const onLoad = () => {
    const passedTime = Date.now() - animationStartTime.current
    controls.start({
      opacity: 1,
      transition: {
        delay: passedTime > duration ? 0 : (duration - passedTime) / 1000,
      },
    })
  }

  return (
    <motion.img
      animate={controls}
      transition={{ duration: duration / 1000, ease }}
      className={cx('absolute inset-0 w-full')}
      src={cover}
      onLoad={onLoad}
    />
  )
}

const LikeButton = () => {
  const { track } = useSnapshot(player)
  const { data: likedIDs } = useUserLikedTracksIDs()

  const isLiked = !!likedIDs?.ids?.find(id => id === track?.id)

  const likeATrack = useMutationLikeATrack()

  return (
    <button onClick={() => track?.id && likeATrack.mutateAsync(track.id)}>
      <Icon
        name={isLiked ? 'heart' : 'heart-outline'}
        className='h-7 w-7 text-black/90 dark:text-white/40'
      />
    </button>
  )
}

const NowPlaying = () => {
  const { state, track } = useSnapshot(player)

  return (
    <div
      className={cx(
        'relative flex aspect-square h-full w-full flex-col justify-end overflow-hidden rounded-24 border',
        css`
          border-color: hsl(0, 100%, 100%, 0.08);
        `
      )}
    >
      {/* Cover */}
      <Cover />

      {/* Info & Controls */}
      <div className='flex flex-col items-center p-5 m-3 font-medium rounded-20 bg-white/60 backdrop-blur-3xl dark:bg-black/70'>
        {/* Track Info */}
        <div className='text-lg text-black line-clamp-1 dark:text-white'>
          {track?.name}
        </div>
        <ArtistInline
          artists={track?.ar || []}
          className='text-black/30 dark:text-white/30'
          hoverClassName='hover:text-black/50 dark:hover:text-white/50 transition-colors duration-500'
        />

        {/* Dividing line */}
        <div className='w-2/3 h-px mt-2 bg-black/10 dark:bg-white/10'></div>

        {/* Progress */}
        <Progress />

        {/* Controls */}
        <div className='flex items-center justify-between w-full mt-4'>
          <button>
            <Icon
              name='hide-list'
              className='h-7 w-7 text-black/90 dark:text-white/40'
            />
          </button>

          <div className='text-black/95 dark:text-white/80'>
            <button
              onClick={() => track && player.prevTrack()}
              disabled={!track}
              className='rounded-full bg-black/10 p-2.5 dark:bg-white/10'
            >
              <Icon name='previous' className='w-6 h-6 ' />
            </button>
            <button
              onClick={() => track && player.playOrPause()}
              className='mx-2 rounded-full bg-black/10 p-2.5 dark:bg-white/10'
            >
              <Icon
                name={
                  [PlayerState.Playing, PlayerState.Loading].includes(state)
                    ? 'pause'
                    : 'play'
                }
                className='w-6 h-6 '
              />
            </button>
            <button
              onClick={() => track && player.nextTrack()}
              disabled={!track}
              className='rounded-full bg-black/10 p-2.5 dark:bg-white/10'
            >
              <Icon name='next' className='w-6 h-6 ' />
            </button>
          </div>

          <LikeButton />
        </div>
      </div>
    </div>
  )
}

export default NowPlaying
