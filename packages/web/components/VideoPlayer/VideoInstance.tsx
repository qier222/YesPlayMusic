import useUserVideos, { useMutationLikeAVideo } from '@/web/api/hooks/useUserVideos'
import player from '@/web/states/player'
import uiStates from '@/web/states/uiStates'
import { formatDuration } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import { motion, useAnimationControls } from 'framer-motion'
import React, { useEffect, useMemo, useRef } from 'react'
import Icon from '../Icon'
import Slider from '../Slider'
import { proxy, useSnapshot } from 'valtio'
import { throttle } from 'lodash-es'

const videoStates = proxy({
  currentTime: 0,
  duration: 0,
  isPaused: true,
  isFullscreen: false,
})

const VideoInstance = ({ src, poster }: { src: string; poster: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const video = videoRef.current
  const { isPaused, isFullscreen } = useSnapshot(videoStates)

  useEffect(() => {
    if (!video || !src) return
    const handleDurationChange = () => (videoStates.duration = video.duration * 1000)
    const handleTimeUpdate = () => (videoStates.currentTime = video.currentTime * 1000)
    const handleFullscreenChange = () => (videoStates.isFullscreen = !!document.fullscreenElement)
    const handlePause = () => (videoStates.isPaused = true)
    const handlePlay = () => (videoStates.isPaused = false)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    video.addEventListener('pause', handlePause)
    video.addEventListener('play', handlePlay)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('play', handlePlay)
    }
  })

  // if video is playing, pause music
  useEffect(() => {
    if (!isPaused) player.pause()
  }, [isPaused])

  const togglePlay = () => {
    videoStates.isPaused ? videoRef.current?.play() : videoRef.current?.pause()
  }
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      videoStates.isFullscreen = false
    } else {
      if (videoContainerRef.current) {
        videoContainerRef.current.requestFullscreen()
        videoStates.isFullscreen = true
      }
    }
  }

  // reset video state when src changes
  useEffect(() => {
    videoStates.currentTime = 0
    videoStates.duration = 0
    videoStates.isPaused = true
    videoStates.isFullscreen = false
  }, [src])

  // animation controls
  const animationControls = useAnimationControls()
  const controlsTimestamp = useRef(0)
  const isControlsVisible = useRef(false)
  const isMouseOverControls = useRef(false)

  // hide controls after 2 seconds
  const showControls = () => {
    isControlsVisible.current = true
    controlsTimestamp.current = Date.now()
    animationControls.start('visible')
  }
  const hideControls = () => {
    isControlsVisible.current = false
    animationControls.start('hidden')
  }
  useEffect(() => {
    if (!isFullscreen) return
    const interval = setInterval(() => {
      if (
        isControlsVisible.current &&
        Date.now() - controlsTimestamp.current > 2000 &&
        !isMouseOverControls.current
      ) {
        hideControls()
      }
    }, 300)
    return () => clearInterval(interval)
  }, [isFullscreen])

  if (!src) return null
  return (
    <motion.div
      initial='hidden'
      animate={animationControls}
      ref={videoContainerRef}
      className={cx(
        'relative aspect-video overflow-hidden rounded-24 bg-black',
        css`
          video::-webkit-media-controls {
            display: none !important;
          }
        `,
        !isFullscreen &&
          css`
            height: 60vh;
          `
      )}
      onClick={togglePlay}
      onMouseOver={showControls}
      onMouseOut={hideControls}
      onMouseMove={() => !isControlsVisible.current && isFullscreen && showControls()}
    >
      <video ref={videoRef} src={src} controls={false} poster={poster} className='h-full w-full' />
      <Controls
        videoRef={videoRef}
        toggleFullscreen={toggleFullscreen}
        togglePlay={togglePlay}
        onMouseOver={() => (isMouseOverControls.current = true)}
        onMouseOut={() => (isMouseOverControls.current = false)}
      />
    </motion.div>
  )
}

const Controls = ({
  videoRef,
  toggleFullscreen,
  togglePlay,
  onMouseOver,
  onMouseOut,
}: {
  videoRef: React.RefObject<HTMLVideoElement>
  toggleFullscreen: () => void
  togglePlay: () => void
  onMouseOver: () => void
  onMouseOut: () => void
}) => {
  const video = videoRef.current
  const { playingVideoID } = useSnapshot(uiStates)
  const { currentTime, duration, isPaused, isFullscreen } = useSnapshot(videoStates)
  const { data: likedVideos } = useUserVideos()
  const isLiked = useMemo(() => {
    return !!likedVideos?.data?.find(video => String(video.vid) === String(playingVideoID))
  }, [likedVideos])
  const likeAVideo = useMutationLikeAVideo()
  const onLike = async () => {
    if (playingVideoID) likeAVideo.mutateAsync(playingVideoID)
  }

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          toggleFullscreen()
          break
        case ' ':
          togglePlay()
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const animationVariants = {
    hidden: { y: '48px', opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }
  const animationTransition = { type: 'spring', bounce: 0.4, duration: 0.5 }

  return (
    <div onClick={e => e.stopPropagation()} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {/* Current Time */}
      <motion.div
        variants={animationVariants}
        transition={animationTransition}
        className={cx(
          'pointer-events-none absolute left-5 cursor-default select-none font-extrabold text-white/40',
          css`
            bottom: 100px;
            font-size: 120px;
            line-height: 120%;
            letter-spacing: 0.02em;
            -webkit-text-stroke-width: 1px;
            -webkit-text-stroke-color: rgba(255, 255, 255, 0.7);
          `
        )}
      >
        {formatDuration(currentTime || 0, 'en-US', 'hh:mm:ss')}
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={{
          hidden: { y: '48px', opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        transition={animationTransition}
        className='absolute bottom-5 left-5 flex rounded-20 bg-black/70 px-5 py-3 backdrop-blur-3xl'
      >
        <button
          onClick={togglePlay}
          className='flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white/80 transition-colors duration-400  hover:bg-white/30'
        >
          <Icon name={isPaused ? 'play' : 'pause'} className='h-6 w-6' />
        </button>
        <button
          onClick={onLike}
          className='ml-3 flex h-11 w-11 items-center  justify-center rounded-full bg-white/20 text-white/80 transition-colors duration-400 hover:bg-white/30'
        >
          <Icon name={isLiked ? 'heart' : 'heart-outline'} className='h-6 w-6' />
        </button>
        <button
          onClick={toggleFullscreen}
          className='ml-3 flex h-11  w-11 items-center justify-center rounded-full bg-white/20 text-white/80 transition-colors duration-400 hover:bg-white/30'
        >
          <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen-enter'} className='h-6 w-6' />
        </button>
        {/* Slider */}
        <div className='ml-5 flex items-center'>
          <div
            className={css`
              width: 214px;
            `}
          >
            <Slider
              min={0}
              max={duration || 99999}
              value={currentTime || 0}
              onChange={value => video?.currentTime && (video.currentTime = value)}
              onlyCallOnChangeAfterDragEnded={true}
            />
          </div>
          {/* Duration */}
          <span className='ml-4 text-14 font-bold text-white/20'>
            {formatDuration(duration || 0, 'en-US', 'hh:mm:ss')}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default VideoInstance
