import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import PlayingNext from './PlayingNext'

export default {
  title: 'Components/PlayingNext',
  component: PlayingNext,
  parameters: {
    viewport: {
      defaultViewport: 'iphone6',
    },
  },
} as ComponentMeta<typeof PlayingNext>

const Template: ComponentStory<typeof PlayingNext> = args => (
  <div className='fixed inset-0 bg-[#F8F8F8] p-4 dark:bg-black'>
    <PlayingNext />
  </div>
)

export const Default = Template.bind({})
