import type { Story } from '@ladle/react'
import Cover, { CoverProps } from './Cover'

export const Primary: Story<CoverProps> = props => (
  <main className='w-64'>
    <Cover {...props} onClick={() => alert('Cover has been clicked!')} />
  </main>
)
Primary.args = {
  imageUrl: 'https://picsum.photos/1000',
  roundedClass: 'rounded-xl',
  showPlayButton: false,
  showHover: true,
}

export const WithPlayButton: Story<CoverProps> = p => <Primary {...p} />
WithPlayButton.args = {
  ...Primary.args,
  showPlayButton: true,
}

export const WithoutShadow: Story<CoverProps> = p => <Primary {...p} />
WithoutShadow.args = {
  ...Primary.args,
  showShadow: false,
}
