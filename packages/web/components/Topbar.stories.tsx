import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Topbar from './Topbar'

export default {
  title: 'Topbar',
  component: Topbar,
} as ComponentMeta<typeof Topbar>

const Template: ComponentStory<typeof Topbar> = args => (
  <div className='w-[calc(100vw_-_32px)] rounded-3xl bg-[#F8F8F8] px-11 dark:bg-black'>
    <Topbar />
  </div>
)

export const Primary = Template.bind({})
