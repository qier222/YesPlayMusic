import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import TrackListHeader from './TrackListHeader'

export default {
  title: 'Components/TrackListHeader',
  component: TrackListHeader,
} as ComponentMeta<typeof TrackListHeader>

const Template: ComponentStory<typeof TrackListHeader> = args => (
  <div className='w-[calc(100vw_-_32px)] rounded-24 bg-[#F8F8F8] p-10 dark:bg-black'>
    <TrackListHeader />
  </div>
)

export const Default = Template.bind({})
