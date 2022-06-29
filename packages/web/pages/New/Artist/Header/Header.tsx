import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import Image from '@/web/components/New/Image'
import { useMemo } from 'react'
import { breakpoint as bp } from '@/web/utils/const'
import BlurBackground from './BlurBackground'
import ArtistInfo from './ArtistInfo'
import Actions from './Actions'
import LatestRelease from './LatestRelease'

const Header = ({ artist }: { artist?: Artist }) => {
  return (
    <div
      className={cx(
        'lg:grid lg:gap-10',
        css`
          grid-template-columns: auto 558px;
          grid-template-areas:
            'info cover'
            'info cover';
        `
      )}
    >
      <Image
        className={cx(
          'aspect-square lg:z-10 lg:rounded-24',
          css`
            grid-area: cover;
          `
        )}
        src={resizeImage(artist?.img1v1Url || '', 'lg')}
      />

      <BlurBackground cover={artist?.img1v1Url} />

      <div
        className={cx(
          'lg:flex lg:flex-col lg:justify-between',
          css`
            grid-area: info;
          `
        )}
      >
        <div
          className={cx(
            'mx-2.5 rounded-48 bg-white/10 p-8 backdrop-blur-3xl lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
            css`
              margin-top: -60px;
              ${bp.lg} {
                margin-top: 0px;
              }
            `
          )}
        >
          <ArtistInfo artist={artist} />
          <Actions />
        </div>

        <LatestRelease />
      </div>
    </div>
  )
}

export default Header
