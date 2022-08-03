import usePlaylist from '@/web/api/hooks/usePlaylist'
import useUser from '@/web/api/hooks/useUser'
import useUserPlaylists, {
  useMutationLikeAPlaylist,
} from '@/web/api/hooks/useUserPlaylists'
import TrackListHeader from '@/web/components/New/TrackListHeader'
import player from '@/web/states/player'
import { formatDate } from '@/web/utils/common'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

const Header = () => {
  const params = useParams()

  const { data: playlistRaw, isLoading } = usePlaylist({
    id: Number(params.id),
  })
  const { data: user } = useUser()

  const { data: userLikedPlaylists } = useUserPlaylists()

  const playlist = playlistRaw?.playlist

  // For <Cover />
  const cover = playlist?.coverImgUrl || playlist?.picUrl

  // For <Info />
  const title = playlist?.name
  const creatorName = playlist?.creator?.nickname
  const creatorLink = undefined // TODO: 链接到用户页面
  const description = playlist?.description || ''
  const extraInfo = useMemo(() => {
    return (
      <>
        Updated at {formatDate(playlist?.updateTime || 0, 'en')} ·{' '}
        {playlist?.trackCount} tracks
      </>
    )
  }, [playlist])

  // For <Actions />
  const isLiked = useMemo(() => {
    const id = Number(params.id)
    if (!id) return false
    return !!userLikedPlaylists?.playlist.find(p => p.id === id)
  }, [params.id, userLikedPlaylists?.playlist])

  const onPlay = async (trackID: number | null = null) => {
    await player.playPlaylist(playlist?.id, trackID)
  }

  const likeAPlaylist = useMutationLikeAPlaylist()
  const onLike = async () => {
    likeAPlaylist.mutateAsync(playlist?.id || Number(params.id))
  }

  return (
    <TrackListHeader
      {...{
        title,
        creatorName,
        creatorLink,
        description,
        extraInfo,
        cover,
        isLiked,
        onLike:
          user?.account?.id === playlist?.creator?.userId ? undefined : onLike,
        onPlay,
      }}
    />
  )
}

export default Header
