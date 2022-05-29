import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Sidebar from './Sidebar'

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
} as ComponentMeta<typeof Sidebar>

const Template: ComponentStory<typeof Sidebar> = args => (
  <div className='h-[calc(100vh_-_32px)] w-min rounded-l-3xl bg-[#F8F8F8] dark:bg-black'>
    <Sidebar />
  </div>
)

export const Default = Template.bind({})
