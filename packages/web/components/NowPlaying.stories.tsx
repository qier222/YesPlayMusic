import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import NowPlaying from './NowPlaying'

export default {
  title: 'NowPlaying',
  component: NowPlaying,
  parameters: {
    viewport: {
      defaultViewport: 'iphone8p',
    },
  },
} as ComponentMeta<typeof NowPlaying>

const Template: ComponentStory<typeof NowPlaying> = args => <NowPlaying />

export const Primary = Template.bind({})
