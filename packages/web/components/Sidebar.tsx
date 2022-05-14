import React from 'react'
import cx from 'classnames'
import SvgIcon from './SvgIcon'

const Sidebar = () => {
  return (
    <div className='relative flex h-full w-[104px] flex-col justify-center'>
      <div className='grid grid-cols-1 justify-items-center	 gap-12 text-black/10 dark:text-white/20'>
        <SvgIcon
          name='my'
          className='h-10 w-10 text-brand-600 dark:text-brand-700'
        />
        <SvgIcon name='explore' className='h-10 w-10' />
        <SvgIcon name='discovery' className='h-10 w-10' />
        <SvgIcon name='lyrics' className='h-10 w-10' />
      </div>
      <div
        className='absolute bottom-8 right-0 left-0 flex rotate-180 items-center font-medium text-brand-600 dark:text-brand-700'
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          letterSpacing: '0.5px',
        }}
      >
        <span>USER PAGE</span>
      </div>
    </div>
  )
}

export default Sidebar
