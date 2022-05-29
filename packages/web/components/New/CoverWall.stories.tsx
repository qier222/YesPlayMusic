import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoverWall from './CoverWall'
import { shuffle } from 'lodash-es'
import { covers } from '../../.storybook/mock/tracks'
import { resizeImage } from '@/web/utils/common'

export default {
  title: 'Components/CoverWall',
  component: CoverWall,
} as ComponentMeta<typeof CoverWall>

const Template: ComponentStory<typeof CoverWall> = args => (
  <div className='rounded-3xl bg-[#F8F8F8] p-10 dark:bg-black'>
    <CoverWall
      covers={shuffle(covers.map(c => resizeImage(c, 'lg'))).slice(0, 31)}
    />
  </div>
)

export const Default = Template.bind({})
