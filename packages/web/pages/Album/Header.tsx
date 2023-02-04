import useAlbum from '@/web/api/hooks/useAlbum'
import useUserAlbums, { useMutationLikeAAlbum } from '@/web/api/hooks/useUserAlbums'
import Icon from '@/web/components/Icon'
import TrackListHeader from '@/web/components/TrackListHeader'
import useVideoCover from '@/web/hooks/useVideoCover'
import player from '@/web/states/player'
import { formatDuration } from '@/web/utils/common'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAppleMusicAlbum from '@/web/api/hooks/useAppleMusicAlbum'

const Header = () => {
  const { t, i18n } = useTranslation()
  const params = useParams()

  const { data: userLikedAlbums } = useUserAlbums()

  const { data: albumRaw, isLoading: isLoadingAlbum } = useAlbum({
    id: Number(params.id),
  })
  const album = useMemo(() => albumRaw?.album, [albumRaw])

  const { data: appleMusicAlbum, isLoading: isLoadingAppleMusicAlbum } = useAppleMusicAlbum(
    album?.id || 0
  )

  // For <Cover />
  const cover = album?.picUrl
  const videoCover = appleMusicAlbum?.editorialVideo

  // For <Info />
  const title = album?.name
  const creatorName = album?.artist.name
  const creatorLink = `/artist/${album?.artist.id}`
  const description = isLoadingAppleMusicAlbum
    ? ''
    : appleMusicAlbum?.editorialNote?.[i18n.language.replace('-', '_')] ||
      album?.description ||
      appleMusicAlbum?.editorialNote?.en_US
  const extraInfo = useMemo(() => {
    const duration = album?.songs?.reduce((acc, cur) => acc + cur.dt, 0) || 0
    const albumDuration = formatDuration(duration, i18n.language, 'hh[hr] mm[min]')
    return (
      <>
        {album?.mark === 1056768 && (
          <Icon name='explicit' className='mb-px mr-1 h-3 w-3 lg:h-3.5 lg:w-3.5' />
        )}{' '}
        {dayjs(album?.publishTime || 0).year()} ·{' '}
        {t('common.track-with-count', { count: album?.songs?.length })}, {albumDuration}
      </>
    )
  }, [album?.mark, album?.publishTime, album?.songs, i18n.language, t])

  // For <Actions />
  const isLiked = useMemo(() => {
    const id = Number(params.id)
    if (!id) return false
    return !!userLikedAlbums?.data.find(item => item.id === id)
  }, [params.id, userLikedAlbums?.data])

  const onPlay = async (trackID: number | null = null) => {
    if (!album?.id) {
      toast('无法播放专辑，该专辑不存在')
      return
    }
    player.playAlbum(album.id, trackID)
  }

  const likeAAlbum = useMutationLikeAAlbum()
  const onLike = async () => {
    likeAAlbum.mutateAsync(album?.id || Number(params.id))
  }

  return (
    <TrackListHeader
      {...{
        isLoading: isLoadingAlbum,
        title,
        creatorName,
        creatorLink,
        description,
        extraInfo,
        cover,
        videoCover,
        isLiked,
        onLike,
        onPlay,
      }}
    />
  )
}

export default Header
