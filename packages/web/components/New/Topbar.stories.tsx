import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Topbar from './Topbar'

export default {
  title: 'Components/Topbar',
  component: Topbar,
} as ComponentMeta<typeof Topbar>

const Template: ComponentStory<typeof Topbar> = args => (
  <div className='w-[calc(100vw_-_32px)] rounded-24 bg-[#F8F8F8] px-11 dark:bg-black'>
    <Topbar />
  </div>
)

export const Default = Template.bind({})
