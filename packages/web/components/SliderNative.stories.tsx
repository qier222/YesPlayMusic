import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Slider from './SliderNative'
import { useArgs } from '@storybook/client-api'
import { cx } from '@emotion/css'

export default {
  title: 'Basic/Slider (Native Input)',
  component: Slider,
  args: {
    value: 50,
    min: 0,
    max: 100,
    onlyCallOnChangeAfterDragEnded: false,
    orientation: 'horizontal',
    alwaysShowTrack: false,
    alwaysShowThumb: false,
  },
} as ComponentMeta<typeof Slider>

const Template: ComponentStory<typeof Slider> = args => {
  const [, updateArgs] = useArgs()

  return (
    <div
      className={cx(
        'h-full rounded-24 bg-[#F8F8F8] dark:bg-black',
        args.orientation === 'horizontal' && 'py-4 px-5',
        args.orientation === 'vertical' && 'h-64 w-min py-5 px-4'
      )}
    >
      <Slider {...args} onChange={value => updateArgs({ value })} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  alwaysShowTrack: true,
  alwaysShowThumb: true,
}

export const Vertical = Template.bind({})
Vertical.args = {
  orientation: 'vertical',
  alwaysShowTrack: true,
  alwaysShowThumb: true,
}
