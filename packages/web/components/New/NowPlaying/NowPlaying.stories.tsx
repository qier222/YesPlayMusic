import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import NowPlaying from './NowPlaying'
import tracks from '@/web/.storybook/mock/tracks'
import { sample } from 'lodash-es'

export default {
  title: 'Components/NowPlaying',
  component: NowPlaying,
  parameters: {
    viewport: {
      defaultViewport: 'iphone8p',
    },
  },
} as ComponentMeta<typeof NowPlaying>

const Template: ComponentStory<typeof NowPlaying> = args => (
  <div className='fixed inset-0 bg-[#F8F8F8] p-4 dark:bg-black'>
    <NowPlaying track={sample(tracks)} />
  </div>
)

export const Default = Template.bind({})
