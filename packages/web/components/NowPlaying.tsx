import React from 'react'
import cx from 'classnames'
import SvgIcon from './SvgIcon'

export const NowPlaying = () => {
  return (
    <div className='relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-3xl'>
      {/* Cover */}
      <img
        className='insert-0 absolute w-full'
        src='https://p2.music.126.net/8g2DIiWDpgZ2nSCoILc9kg==/109951165124745870.jpg?param=1024y1024'
      />

      {/* Info & Controls */}
      <div className='m-3 flex flex-col items-center rounded-[20px] bg-white/60 p-5 backdrop-blur-3xl dark:bg-black/70'>
        {/* Track Info */}
        <div className='text-lg text-black dark:text-white'>
          Life In Technicolor II
        </div>
        <div className='text-base text-black/30 dark:text-white/30'>
          Coldplay
        </div>

        {/* Dividing line */}
        <div className='mt-2 h-px w-2/3 bg-black/10 dark:bg-white/10'></div>

        {/* Progress */}
        <div className='mt-10 flex w-full flex-col'>
          {/* Slider */}
          <div className='relative h-[3px] rounded-full bg-black/10 dark:bg-white/10'>
            <div className='absolute left-0 top-0 bottom-0 w-2/3 rounded-full bg-black dark:bg-white'></div>
          </div>
          <div className='mt-1 flex justify-between text-[14px] font-semibold text-black/20 dark:text-white/20'>
            <span>00:54</span>
            <span>02:53</span>
          </div>
        </div>

        {/* Controls */}
        <div className='mt-4 flex w-full items-center justify-between'>
          <SvgIcon
            name='shuffle'
            className='h-7 w-7 text-black/90 dark:text-white/40'
          />

          <div className='text-black/95 dark:text-white/80'>
            <button className='rounded-full bg-black/10 p-[10px] dark:bg-white/10'>
              <SvgIcon name='previous' className='h-6 w-6 ' />
            </button>
            <button className='mx-2 rounded-full bg-black/10 p-[10px] dark:bg-white/10'>
              <SvgIcon name='play' className='h-6 w-6 ' />
            </button>
            <button className='rounded-full bg-black/10 p-[10px] dark:bg-white/10'>
              <SvgIcon name='next' className='h-6 w-6 ' />
            </button>
          </div>

          <SvgIcon
            name='repeat-1'
            className='h-7 w-7 text-black/90 dark:text-white/40'
          />
        </div>
      </div>
    </div>
  )
}
