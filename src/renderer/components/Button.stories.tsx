import type { Story } from '@ladle/react'
import Button, { ButtonProps, Color } from './Button'

export const Primary: Story<ButtonProps> = props => (
  <Button {...props} onClick={() => alert('Button has been clicked!')} />
)
Primary.args = {
  children: 'Hello, World!',
  backgroundColor: Color.Primary,
  textColor: Color.Primary,
  isSkelton: false,
}

export const Gray: Story<ButtonProps> = p => (
  <Primary {...p} />
)
Gray.args = {
  ...Primary.args,
  backgroundColor: Color.Gray,
  textColor: Color.Gray,
}

export const Skelton: Story<ButtonProps> = p => (
  <Primary {...p} />
)
Skelton.args = {
  ...Primary.args,
  isSkelton: true,
}
