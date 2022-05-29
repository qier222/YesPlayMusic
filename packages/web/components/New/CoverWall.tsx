import { css, cx } from '@emotion/css'
import { sampleSize, shuffle } from 'lodash-es'
import Image from './Image'
import { covers } from '@/web/.storybook/mock/tracks'
import { resizeImage } from '@/web/utils/common'
import useBreakpoint from '@/web/hooks/useBreakpoint'
import { useMemo } from 'react'

const CoverWall = () => {
  const bigCover = useMemo(
    () =>
      shuffle(
        sampleSize([...Array(covers.length).keys()], ~~(covers.length / 3))
      ),
    []
  )
  const breakpoint = useBreakpoint()
  const sizes = {
    small: {
      sm: 'xs',
      md: 'xs',
      lg: 'sm',
      xl: 'sm',
      '2xl': 'md',
    },
    big: {
      sm: 'xs',
      md: 'sm',
      lg: 'md',
      xl: 'md',
      '2xl': 'lg',
    },
  } as const

  return (
    <div
      className={cx(
        'grid w-full grid-flow-row-dense grid-cols-8',
        css`
          gap: 13px;
        `
      )}
    >
      {covers.map((cover, index) => (
        <Image
          src={resizeImage(
            cover,
            sizes[bigCover.includes(index) ? 'big' : 'small'][breakpoint]
          )}
          key={cover}
          alt='Album Cover'
          placeholder={null}
          className={cx(
            'aspect-square h-full w-full rounded-24',
            bigCover.includes(index) && 'col-span-2 row-span-2'
          )}
        />
      ))}
    </div>
  )
}

export default CoverWall
