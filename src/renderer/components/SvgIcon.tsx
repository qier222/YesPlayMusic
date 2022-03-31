import React from "react";

export interface SvgIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
}

const SvgIcon = ({ name, ...props }: SvgIconProps) => {
  const symbolId = `#icon-${name}`;
  return (
    <svg aria-hidden='true' {...props}>
      <use href={symbolId} fill='currentColor' />
    </svg>
  )
}

export default React.memo(SvgIcon)
