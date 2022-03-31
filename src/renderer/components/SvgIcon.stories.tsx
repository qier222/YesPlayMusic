import { Story } from '@ladle/react'
import SvgIcon from './SvgIcon'

export const DislikeIcon: Story<{ name: string }> = ({ name }) => (
  <SvgIcon name={name} className='w-12 h-12' />
)

DislikeIcon.args = {
  name: 'dislike',
}

export const HeartIcon: Story<{ name: string }> = args => (
  <DislikeIcon {...args} />
)
HeartIcon.args = {
  name: 'heart',
}

export const HomeIcon: Story<{ name: string }> = args => (
  <DislikeIcon {...args} />
)
HomeIcon.args = {
  name: 'home',
}

