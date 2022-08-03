import PageTransition from '@/web/components/New/PageTransition'
import useMV, { useMVUrl } from '@/web/api/hooks/useMV'
import { useParams } from 'react-router-dom'
import Plyr, { PlyrOptions, PlyrSource } from 'plyr-react'
import 'plyr-react/plyr.css'
import { useMemo } from 'react'
import { css, cx } from '@emotion/css'

const plyrStyle = css`
  --plyr-color-main: rgb(152 208 11);
  --plyr-video-control-background-hover: rgba(255, 255, 255, 0.3);
  --plyr-control-radius: 8px;
  --plyr-range-fill-background: white;
  button[data-plyr='play']:not(.plyr__controls__item) {
    --plyr-video-control-background-hover: var(--plyr-color-main);
  }
`

const plyrOptions: PlyrOptions = {
  settings: [],
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'fullscreen',
  ],
  resetOnEnd: true,
  ratio: '16:9',
}

const MV = () => {
  const params = useParams()
  const { data: mv } = useMV({ mvid: Number(params.id) || 0 })
  const { data: mvUrl } = useMVUrl({ id: Number(params.id) || 0 })
  const source: PlyrSource = useMemo(
    () => ({
      type: 'video',
      sources: [
        {
          src: mvUrl?.data?.url || '',
        },
      ],
      poster: mv?.data.cover,
      title: mv?.data.name,
    }),
    [mv?.data.cover, mv?.data.name, mvUrl?.data?.url]
  )

  return (
    <PageTransition>
      <div className='text-white'>{mv?.data.name}</div>
      <div className={cx('aspect-video overflow-hidden rounded-24', plyrStyle)}>
        {mvUrl && <Plyr options={plyrOptions} source={source} />}
      </div>
    </PageTransition>
  )
}

export default MV
