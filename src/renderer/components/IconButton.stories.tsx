import { Story } from '@ladle/react'
import IconButton from './IconButton'
import SvgIcon from './SvgIcon'

export const DislikeButton: Story<{name: string}> = ({ name }) => (
  <IconButton>
    <SvgIcon name={name} className='w-12 h-12' />
  </IconButton>
)
DislikeButton.args = {
    name: 'dislike',
};

export const HeartButton: Story<{name: string}> = (args) => <DislikeButton {...args} />
HeartButton.args = {
    name: 'heart',
}

export const HomeButton: Story<{name: string}> = (args) => <DislikeButton {...args} />
HomeButton.args = {
    name: 'home',
};
