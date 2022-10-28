import { isIosPwa, resizeImage } from '@/web/utils/common'
import player from '@/web/states/player'
import { State as PlayerState } from '@/web/utils/player'
import { useSnapshot } from 'valtio'
import useTracks from '@/web/api/hooks/useTracks'
import { css, cx } from '@emotion/css'
import Wave from './Wave'
import Icon from '@/web/components/Icon'
import { useWindowSize } from 'react-use'
import { playerWidth, topbarHeight } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'
import { Virtuoso } from 'react-virtuoso'
import toast from 'react-hot-toast'
import { openContextMenu } from '@/web/states/contextMenus'
import { useTranslation } from 'react-i18next'

const Header = () => {
  const { t } = useTranslation()
  return (
    <div
      className={cx(
        'absolute top-0 left-0 z-20 flex w-full items-center justify-between bg-contain bg-repeat-x px-7 pb-6 text-14 font-bold text-neutral-700 dark:text-neutral-300 lg:px-0'
      )}
    >
      <div className='flex'>
        <div className='mr-2 h-4 w-1 bg-brand-700'></div>
        {t`player.queue`}
      </div>
      <div className='flex'>
        <div onClick={() => toast('开发中')} className='mr-2'>
          <Icon name='repeat-1' className='h-7 w-7 opacity-40' />
        </div>
        <div onClick={() => toast('开发中')}>
          <Icon name='shuffle' className='h-7 w-7 opacity-40' />
        </div>
      </div>
    </div>
  )
}

const Track = ({
  track,
  index,
  playingTrackIndex,
  state,
}: {
  track?: Track
  index: number
  playingTrackIndex: number
  state: PlayerState
}) => {
  return (
    <div
      className='mb-5 flex items-center justify-between'
      onClick={e => {
        if (e.detail === 2 && track?.id) player.playTrack(track.id)
      }}
      onContextMenu={event => {
        track?.id &&
          openContextMenu({
            event,
            type: 'track',
            dataSourceID: track.id,
            options: {
              useCursorPosition: true,
            },
          })
      }}
    >
      {/* Cover */}
      <img
        alt='Cover'
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
      />

      {/* Track info */}
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium ',
            playingTrackIndex === index
              ? 'text-brand-700'
              : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200 dark:text-white/25'>
          {track?.ar.map(a => a.name).join(', ')}
        </div>
      </div>

      {/* Wave icon */}
      {playingTrackIndex === index ? (
        <Wave playing={state === 'playing'} />
      ) : (
        <div className='text-16 font-medium text-neutral-700 dark:text-neutral-200'>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}
    </div>
  )
}

const TrackList = ({ className }: { className?: string }) => {
  const { trackList, trackIndex, state } = useSnapshot(player)
  const { data: tracksRaw } = useTracks({ ids: trackList })
  const tracks = tracksRaw?.songs || []
  const { height } = useWindowSize()
  const isMobile = useIsMobile()

  const listHeight = height - topbarHeight - playerWidth - 24 // 24是封面与底部间距
  const listHeightMobile = height - 154 - 110 - (isIosPwa ? 34 : 0) // 154是列表距离底部的距离，110是顶部的距离

  return (
    <>
      <div
        className={css`
          mask-image: linear-gradient(
            to bottom,
            transparent 22px,
            black 42px
          ); // 顶部渐变遮罩
        `}
      >
        <Virtuoso
          style={{
            height: `${isMobile ? listHeightMobile : listHeight}px`,
          }}
          totalCount={tracks.length}
          className={cx(
            'no-scrollbar relative z-10 w-full overflow-auto',
            className,
            css`
              mask-image: linear-gradient(
                to top,
                transparent 8px,
                black 42px
              ); // 底部渐变遮罩
            `
          )}
          fixedItemHeight={76}
          data={tracks}
          overscan={10}
          components={{
            Header: () => <div className='h-8'></div>,
            Footer: () => <div className='h-8'></div>,
          }}
          itemContent={(index, track) => (
            <Track
              key={index}
              track={track}
              index={index}
              playingTrackIndex={trackIndex}
              state={state}
            />
          )}
        ></Virtuoso>
      </div>
    </>
  )
}

const PlayingNext = () => {
  return (
    <>
      <Header />
      <TrackList />
    </>
  )
}

export default PlayingNext
