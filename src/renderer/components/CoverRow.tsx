import React, { useMemo } from 'react'
import Cover from '@/components/Cover'
import Skeleton from '@/components/Skeleton'
import SvgIcon from '@/components/SvgIcon'
import { prefetchAlbum } from '@/hooks/useAlbum'
import { prefetchPlaylist } from '@/hooks/usePlaylist'
import { formatDate, resizeImage, scrollToTop } from '@/utils/common'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'

export enum Subtitle {
  COPYWRITER = 'copywriter',
  CREATOR = 'creator',
  TYPE_RELEASE_YEAR = 'type+releaseYear',
  ARTIST = 'artist',
}

export interface MoreLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  href: string;
}

export const ShowMoreLink = ({ className, ...props }: MoreLinkProps) => (
  <a className={classNames('font-semibold text-gray-600 text-13px hover:underline cursor-pointer', className)} {...props}>
    See More
  </a>
)

export interface TitleProps {
  title: string
  showMoreLink: string
}

export const Title = ({ title, showMoreLink }: TitleProps) => (
  <section className='flex items-baseline justify-between'>
    <div className='my-4 text-[28px] font-bold text-black dark:text-white'>
      {title}
    </div>
    {showMoreLink && <ShowMoreLink href={showMoreLink} />}
  </section>
)

/**
 * 將從網易雲收到的標籤，轉換為 YesPlayMusic
 * 統一的類型標籤。
 * 
 * @param type 從網易雲接收到的標籤。
 * @returns YesPlayMusic 的類型標籤。
 */
const remapType = (
  type: string
): 'playlist' | 'Album' | 'EP' | 'Collection' | 'unknown' => {
  switch (type) {
    case 'playlist':
      return 'playlist'
    case 'album':
    case '專輯':
    case '专辑':
      return 'Album'
    case 'EP':
    case 'EP/Single':
      return 'EP'
    case '精選集':
    case '精选集':
      return 'Collection'
    default:
      return 'unknown'
  }
}

/**
 * 取得副標題內容。
 */
const getSubtitleText = (
  item: Album | Playlist | Artist,
  subtitle: Subtitle
) => {
  const nickname = 'creator' in item ? item.creator.nickname : 'someone'
  const artist = 'artist' in item ? item.artist.name : 'unknown'
  const copywriter = 'copywriter' in item ? item.copywriter : 'unknown'
  const releaseYear = 'publishTime' in item
    ? formatDate(item.publishTime ?? 0, 'en', 'YYYY')
    : 'unknown';
  const type = ('type' in item && typeof item.type === 'string')
    ? remapType(item.type)
    : 'unknown';

  const table = {
    [Subtitle.CREATOR]: `by ${nickname}`,
    [Subtitle.TYPE_RELEASE_YEAR]: `${type} · ${releaseYear}`,
    [Subtitle.ARTIST]: artist,
    [Subtitle.COPYWRITER]: copywriter,
  }

  return table[subtitle]
}

/**
 * 取得影像的 URL。
 * 
 * @param item 專輯、播放列表或作家的資料。
 * @returns 影像 URL。如果沒有，則回傳 `null`。
 */
const getImageUrl = (item: Album | Playlist | Artist) => {
  let cover: string | undefined;

  if ('coverImgUrl' in item && item.coverImgUrl) {
    cover = item.coverImgUrl
  } else if ('picUrl' in item && item.picUrl) {
    cover = item.picUrl
  } else if ('img1v1Url' in item && item.img1v1Url) {
    cover = item.img1v1Url
  }

  return cover
    ? resizeImage(cover, 'md')
    : null;
}

export interface CoverRowProps {
  title?: string
  albums?: Album[]
  artists?: Artist[]
  playlists?: Playlist[]
  subtitle?: Subtitle
  seeMoreLink?: string
  isSkeleton?: boolean
  className?: string
  rows?: number
  navigateCallback?: () => void
}

const CoverRow = ({
  title,
  albums,
  artists,
  playlists,
  subtitle = Subtitle.COPYWRITER,
  seeMoreLink,
  isSkeleton,
  className,
  rows = 2,
  navigateCallback, // Callback function when click on the cover/title
}: CoverRowProps) => {
  const renderItems = useMemo(() => {
    if (isSkeleton) {
      return new Array(rows * 5).fill({}) as Array<Album | Playlist | Artist>
    }
    return albums ?? playlists ?? artists ?? []
  }, [albums, artists, isSkeleton, playlists, rows])

  const navigate = useNavigate()
  const goTo = (id: number) => {
    if (isSkeleton) return
    if (albums) navigate(`/album/${id}`)
    if (playlists) navigate(`/playlist/${id}`)
    if (artists) navigate(`/artist/${id}`)
    if (navigateCallback) navigateCallback()
    scrollToTop()
  }

  const prefetch = (id: number) => {
    if (albums) prefetchAlbum({ id })
    if (playlists) prefetchPlaylist({ id })
  }

  return (
    <div>
      {title && <Title title={title} showMoreLink={seeMoreLink ?? ''} />}

      <div
        className={classNames(
          'grid gap-x-6 gap-y-7',
          className,
          !className &&
            'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
        )}
      >
        {renderItems.map((item, index) => (
          <div
            key={item.id ?? index}
            onMouseOver={() => prefetch(item.id)}
            className='grid gap-x-6 gap-y-7'
          >
            <div>
              {/*  Cover  */}
              {isSkeleton ? (
                <Skeleton className='box-content w-full border border-black border-opacity-0 aspect-square rounded-xl' />
              ) : (
                <Cover
                  onClick={() => goTo(item.id)}
                  imageUrl={getImageUrl(item)}
                  showPlayButton={true}
                />
              )}

              {/* Info */}
              <div className='mt-2'>
                <div className='font-semibold'>
                  {/*  Name */}
                  {isSkeleton ? (
                    <div className='flex flex-col w-full -translate-y-px'>
                      <Skeleton className='w-full leading-tight'>
                        PLACEHOLDER
                      </Skeleton>
                      <Skeleton className='w-1/3 leading-tight translate-y-px'>
                        PLACEHOLDER
                      </Skeleton>
                    </div>
                  ) : (
                    <span className='leading-tight line-clamp-2 '>
                      {/* Playlist private icon */}
                      {(item as Playlist).privacy && (
                        <SvgIcon
                          name='lock'
                          className='inline-block w-3 h-3 mb-1 mr-1 text-gray-300'
                        />
                      )}

                      {/* Explicit icon */}
                      {(item as Album)?.mark === 1056768 && (
                        <SvgIcon
                          name='explicit'
                          className='float-right mt-[2px] h-4 w-4 text-gray-300'
                        />
                      )}

                      {/* Name */}
                      <span
                        onClick={() => goTo(item.id)}
                        className='decoration-gray-600 decoration-2 hover:underline dark:text-white dark:decoration-gray-200'
                      >
                        {item.name}
                      </span>
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                {isSkeleton ? (
                  <Skeleton className='w-3/5 translate-y-px text-[12px]'>
                    PLACEHOLDER
                  </Skeleton>
                ) : (
                  <div className='flex text-[12px] text-gray-500 dark:text-gray-400'>
                    <span>{getSubtitleText(item, subtitle)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoverRow
